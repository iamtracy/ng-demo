import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as rds from 'aws-cdk-lib/aws-rds'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'

export interface KeycloakConstructProps {
  vpc: ec2.Vpc
  cluster: ecs.Cluster
  environment: string
  adminCredentials?: {
    username?: string
    password?: string
  }
  database?: {
    instanceClass?: ec2.InstanceType
    allocatedStorage?: number
  }
}

export class KeycloakConstruct extends Construct {
  public readonly database: rds.DatabaseInstance
  public readonly service: ecsPatterns.ApplicationLoadBalancedFargateService
  public readonly adminSecret: secretsmanager.Secret
  public readonly loadBalancer: elbv2.ApplicationLoadBalancer

  constructor(scope: Construct, id: string, props: KeycloakConstructProps) {
    super(scope, id)

    this.adminSecret = new secretsmanager.Secret(this, 'KeycloakAdminSecret', {
      secretName: `keycloak-admin-${props.environment}`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ 
          username: props.adminCredentials?.username || 'admin' 
        }),
        generateStringKey: 'password',
        excludeCharacters: '"@/\\',
        passwordLength: 32,
      },
      description: 'Keycloak admin credentials',
    })

    this.database = new rds.DatabaseInstance(this, 'KeycloakDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16,
      }),
      instanceType: props.database?.instanceClass || ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      credentials: rds.Credentials.fromGeneratedSecret('keycloak'),
      databaseName: 'keycloak',
      allocatedStorage: props.database?.allocatedStorage || 20,
      storageEncrypted: true,
      backupRetention: cdk.Duration.days(7),
      deletionProtection: props.environment === 'prod',
      removalPolicy: props.environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    })

    this.service = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'KeycloakService', {
      cluster: props.cluster,
      cpu: 512,
      memoryLimitMiB: 1024,
      desiredCount: 1,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry('quay.io/keycloak/keycloak:26.2.4'),
        containerPort: 8080,
        secrets: {
          KC_BOOTSTRAP_ADMIN_USERNAME: ecs.Secret.fromSecretsManager(this.adminSecret, 'username'),
          KC_BOOTSTRAP_ADMIN_PASSWORD: ecs.Secret.fromSecretsManager(this.adminSecret, 'password'),
          KC_DB_USERNAME: ecs.Secret.fromSecretsManager(this.database.secret!, 'username'),
          KC_DB_PASSWORD: ecs.Secret.fromSecretsManager(this.database.secret!, 'password'),
        },
        environment: {
          KC_HEALTH_ENABLED: 'true',
          KC_FEATURES: 'preview',
          KC_HTTP_ENABLED: 'true',
          KC_HOSTNAME_STRICT: 'false',
          KC_DB: 'postgres',
          KC_DB_URL: `jdbc:postgresql://${this.database.instanceEndpoint.hostname}:5432/keycloak`,
        },
        command: ['start'],
      },
      publicLoadBalancer: true,
      listenerPort: 80,
      healthCheckGracePeriod: cdk.Duration.minutes(5),
    })

    this.service.targetGroup.configureHealthCheck({
      path: '/health/ready',
      port: '8080',
      protocol: elbv2.Protocol.HTTP,
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 5,
      timeout: cdk.Duration.seconds(30),
      interval: cdk.Duration.seconds(60),
    })

    this.database.connections.allowFrom(this.service.service, ec2.Port.tcp(5432))

    this.loadBalancer = this.service.loadBalancer

    new cdk.CfnOutput(this, 'KeycloakUrl', {
      value: `http://${this.service.loadBalancer.loadBalancerDnsName}`,
      description: 'Keycloak authentication server URL',
    })

    new cdk.CfnOutput(this, 'KeycloakAdminSecretArn', {
      value: this.adminSecret.secretArn,
      description: 'ARN of the secret containing Keycloak admin credentials',
    })

    new cdk.CfnOutput(this, 'KeycloakDatabaseEndpoint', {
      value: this.database.instanceEndpoint.hostname,
      description: 'Keycloak database endpoint',
    })
  }
} 