import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as rds from 'aws-cdk-lib/aws-rds'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import path from 'path'

export interface KeycloakConstructProps {
  vpc: ec2.Vpc
  cluster: ecs.Cluster
  environment: string
  domainName: string
  hostedZone: route53.IHostedZone
  certificateArn: string
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
  public readonly certificate: acm.ICertificate
  public readonly keycloakClientSecret: secretsmanager.ISecret

  constructor(scope: Construct, id: string, props: KeycloakConstructProps) {
    super(scope, id)

    this.certificate = acm.Certificate.fromCertificateArn(this, 'KeycloakCertificate', props.certificateArn)

    this.adminSecret = new secretsmanager.Secret(this, 'KeycloakAdminSecret', {
      secretName: `keycloak-admin-${props.environment}`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: props.adminCredentials?.username || 'admin',
        }),
        generateStringKey: 'password',
        excludeCharacters: '"@/\\',
        passwordLength: 32,
      },
      description: 'Keycloak admin credentials',
    })

    this.keycloakClientSecret = new secretsmanager.Secret(this, 'KeycloakClientSecret', {
      secretName: 'keycloak-client-secret-name',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: 'KEYCLOAK_CLIENT_SECRET',
        passwordLength: 32,
      },
      description: 'Keycloak OIDC client secret for both Keycloak and backend',
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
      storageEncrypted: true,
      backupRetention: cdk.Duration.days(7),
      deletionProtection: props.environment === 'production',
      removalPolicy: props.environment === 'production' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    })

    this.service = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'KeycloakService', {
      cluster: props.cluster,
      cpu: 512,
      memoryLimitMiB: 1024,
      desiredCount: 1,
      taskImageOptions: {
        containerPort: 8080,
        environment: {
          KC_DB_SCHEMA: 'public',
          KC_DB_URL: `jdbc:postgresql://${this.database.instanceEndpoint.hostname}:5432/keycloak`,
          KC_DB: 'postgres',
          KC_FEATURES: 'preview',
          KC_HEALTH_ENABLED: 'true',
          KC_HOSTNAME_STRICT: 'true',
          KC_HOSTNAME: `auth.${props.domainName}`,
          KC_HTTP_ENABLED: 'true',
          KC_HTTP_PORT: '8080',
          KC_JAVA_OPTS_MAX_MEMORY: '1024m',
          KC_JAVA_OPTS_MAX_METASPACE_SIZE: '512m',
          KC_JAVA_OPTS_METASPACE_SIZE: '128M',
          KC_JAVA_OPTS_MIN_MEMORY: '512m',
          KC_LOG_LEVEL: 'INFO',
        },
        image: ecs.ContainerImage.fromAsset(path.join(__dirname, '..', '..', 'keycloak')),
        secrets: {
          KC_BOOTSTRAP_ADMIN_USERNAME: ecs.Secret.fromSecretsManager(this.adminSecret, 'username'),
          KC_BOOTSTRAP_ADMIN_PASSWORD: ecs.Secret.fromSecretsManager(this.adminSecret, 'password'),
          KC_DB_USERNAME: ecs.Secret.fromSecretsManager(this.database.secret!, 'username'),
          KC_DB_PASSWORD: ecs.Secret.fromSecretsManager(this.database.secret!, 'password'),
          KEYCLOAK_CLIENT_SECRET: ecs.Secret.fromSecretsManager(this.keycloakClientSecret, 'KEYCLOAK_CLIENT_SECRET'),
        },
      },
      protocol: elbv2.ApplicationProtocol.HTTPS,
      certificate: this.certificate,
      redirectHTTP: true,
      domainName: `auth.${props.domainName}`,
      domainZone: props.hostedZone,
      healthCheckGracePeriod: cdk.Duration.minutes(5),
    })

    this.service.targetGroup.configureHealthCheck({
      path: '/health/ready',
      port: '8080',
      healthyHttpCodes: '200-499',
      protocol: elbv2.Protocol.HTTP,
      interval: cdk.Duration.seconds(120),
      timeout: cdk.Duration.seconds(60),
      unhealthyThresholdCount: 2,
      healthyThresholdCount: 2,
    })

    this.database.connections.allowFrom(this.service.service, ec2.Port.tcp(5432))

    this.loadBalancer = this.service.loadBalancer

    new cdk.CfnOutput(this, 'KeycloakUrl', {
      value: `https://${this.service.loadBalancer.loadBalancerDnsName}`,
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
