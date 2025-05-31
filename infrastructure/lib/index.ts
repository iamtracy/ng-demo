import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as rds from 'aws-cdk-lib/aws-rds'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as certificateManager from 'aws-cdk-lib/aws-certificatemanager'

export interface NgDemoInfrastructureProps {
  domainName?: string
  environment: string
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
  public readonly frontendBucket: s3.Bucket
  public readonly distribution: cloudfront.Distribution
  public readonly loadBalancer: elbv2.ApplicationLoadBalancer

  constructor(scope: Construct, id: string, props: NgDemoInfrastructureProps) {
    super(scope, id)

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
      credentials: rds.Credentials.fromGeneratedSecret('postgres'),
      databaseName: 'ng_demo_db',
      allocatedStorage: props.database?.allocatedStorage || 20,
      storageEncrypted: true,
      backupRetention: cdk.Duration.days(7),
      deletionProtection: props.environment === 'prod',
      removalPolicy: props.environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    })

    this.cluster = new ecs.Cluster(this, 'NgDemoCluster', {
      vpc: this.vpc,
      containerInsights: true,
    })

    this.backendService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'NgDemoBackend', {
      cluster: this.cluster,
      cpu: props.ecs?.cpu || 256,
      memoryLimitMiB: props.ecs?.memoryLimitMiB || 512,
      desiredCount: props.ecs?.desiredCount || 1,
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset('../', {
          file: 'Dockerfile',
        }),
        containerPort: 3000,
        environment: {
          NODE_ENV: 'production',
          PORT: '3000',
        },
        secrets: {
          DATABASE_URL: ecs.Secret.fromSecretsManager(this.database.secret!, 'DATABASE_URL'),
        },
      },
      publicLoadBalancer: true,
      listenerPort: 80,
    })

    this.database.connections.allowFrom(this.backendService.service, ec2.Port.tcp(5432))

    this.loadBalancer = this.backendService.loadBalancer

    this.frontendBucket = new s3.Bucket(this, 'NgDemoFrontend', {
      bucketName: `ng-demo-frontend-${props.environment}-${cdk.Aws.ACCOUNT_ID}`,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: props.environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: props.environment !== 'prod',
    })

    this.distribution = new cloudfront.Distribution(this, 'NgDemoDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(this.frontendBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.LoadBalancerV2Origin(this.loadBalancer, {
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
        },
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    })

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: this.database.instanceEndpoint.hostname,
      description: 'RDS PostgreSQL endpoint',
    })

    new cdk.CfnOutput(this, 'BackendUrl', {
      value: `http://${this.backendService.loadBalancer.loadBalancerDnsName}`,
      description: 'Backend API URL',
    })

    new cdk.CfnOutput(this, 'FrontendUrl', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'Frontend CloudFront URL',
    })

    new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: this.frontendBucket.bucketName,
      description: 'S3 bucket for frontend deployment',
    })
  }
}
