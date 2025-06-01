import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as rds from 'aws-cdk-lib/aws-rds'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'

export interface NgDemoInfrastructureProps {
  domainName: string
  environment: string
  certificateArn: string
  database?: {
    instanceClass?: ec2.InstanceType
    allocatedStorage?: number
  }
  ecs?: {
    cpu?: number
    memoryLimitMiB?: number
    desiredCount?: number
  }
}

export class NgDemoInfrastructure extends Construct {
  public readonly vpc: ec2.Vpc
  public readonly database: rds.DatabaseInstance
  public readonly cluster: ecs.Cluster
  public readonly backendService: ecsPatterns.ApplicationLoadBalancedFargateService
  public readonly loadBalancer: elbv2.ApplicationLoadBalancer
  public readonly certificate: acm.ICertificate
  public readonly hostedZone: route53.IHostedZone

  constructor(scope: Construct, id: string, props: NgDemoInfrastructureProps) {
    super(scope, id)

    this.hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: props.domainName,
    })

    this.certificate = acm.Certificate.fromCertificateArn(this, 'AppCertificate', props.certificateArn)

    this.vpc = new ec2.Vpc(this, 'NgDemoVpc', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 28,
          name: 'isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    })

    this.database = new rds.DatabaseInstance(this, 'NgDemoDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16,
      }),
      instanceType: props.database?.instanceClass || ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc: this.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      credentials: {
        username: 'postgres',
        password: cdk.SecretValue.unsafePlainText('postgres'),
      },
      databaseName: 'ng_demo_db',
      storageEncrypted: true,
      backupRetention: cdk.Duration.days(7),
      deletionProtection: props.environment === 'production',
      removalPolicy: props.environment === 'production' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    })

    this.cluster = new ecs.Cluster(this, 'NgDemoCluster', {
      vpc: this.vpc,
      containerInsights: true,
    })

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'NgDemoTaskDefinition', {
      memoryLimitMiB: props.ecs?.memoryLimitMiB || 512,
      cpu: props.ecs?.cpu || 256,
    })

    const container = taskDefinition.addContainer('NgDemoContainer', {
      image: ecs.ContainerImage.fromAsset('../', {
        file: 'Dockerfile',
        exclude: [
          'infrastructure/',
          '**/cdk.out/',
          '**/cdk.context.json',
          '**/.cdk.staging/',
          '**/node_modules/',
          '**/.git/',
          '**/.angular/',
          '**/cypress/',
          '**/e2e/',
          '**/scripts/',
          '**/*.log',
          '**/.env*',
          '!**/.env.example',
        ],
      }),
      environment: {
        DATABASE_URL: `postgresql://postgres:postgres@${this.database.instanceEndpoint.hostname}:${this.database.instanceEndpoint.port.toString()}/ng_demo_db?sslmode=no-verify`,
        DB_HOST: this.database.instanceEndpoint.hostname,
        DB_NAME: 'ng_demo_db',
        DB_PASSWORD: 'postgres',
        DB_PORT: this.database.instanceEndpoint.port.toString(),
        DB_USERNAME: 'postgres',
        NODE_ENV: 'production',
        PORT: '3000',
      },
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'ng-demo-app',
        logGroup: new logs.LogGroup(this, 'NgDemoAppLogGroup', {
          logGroupName: `/aws/ecs/ng-demo-${props.environment}`,
          retention: logs.RetentionDays.ONE_WEEK,
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        }),
      })
    })

    container.addPortMappings({
      containerPort: 3000,
      protocol: ecs.Protocol.TCP,
    })

    this.backendService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'NgDemoApp', {
      cluster: this.cluster,
      taskDefinition: taskDefinition,
      desiredCount: props.ecs?.desiredCount || 1,
      publicLoadBalancer: true,
      protocol: elbv2.ApplicationProtocol.HTTPS,
      certificate: this.certificate,
      redirectHTTP: true,
      domainName: `app.${props.domainName}`,
      domainZone: this.hostedZone,
    })

    this.database.connections.allowFrom(this.backendService.service, ec2.Port.tcp(5432))

    this.loadBalancer = this.backendService.loadBalancer

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: this.database.instanceEndpoint.hostname,
      description: 'RDS PostgreSQL endpoint',
    })

    new cdk.CfnOutput(this, 'ApplicationUrl', {
      value: `https://app.${props.domainName}`,
      description: 'Application URL',
    })
  }
}
