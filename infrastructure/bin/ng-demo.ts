#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { NgDemoStack } from '../lib/ng-demo-stack'

const app = new cdk.App()

new NgDemoStack(app, 'NgDemo-Staging', {
  environment: 'staging',
  includeKeycloak: true,
  infrastructure: {
    database: {
      instanceClass: cdk.aws_ec2.InstanceType.of(cdk.aws_ec2.InstanceClass.T3, cdk.aws_ec2.InstanceSize.SMALL),
      allocatedStorage: 50,
    },
    ecs: {
      cpu: 512,
      memoryLimitMiB: 1024,
      desiredCount: 2,
    },
  },
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  tags: {
    Environment: 'staging',
    Project: 'ng-demo',
  },
})

new NgDemoStack(app, 'NgDemo-Prod', {
  environment: 'prod',
  includeKeycloak: true,
  infrastructure: {
    database: {
      instanceClass: cdk.aws_ec2.InstanceType.of(cdk.aws_ec2.InstanceClass.T3, cdk.aws_ec2.InstanceSize.MEDIUM),
      allocatedStorage: 100,
    },
    ecs: {
      cpu: 1024,
      memoryLimitMiB: 2048,
      desiredCount: 3,
    },
  },
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  tags: {
    Environment: 'prod',
    Project: 'ng-demo',
  },
})

app.synth() 