import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { NgDemoInfrastructure, NgDemoInfrastructureProps } from './index'
import { KeycloakConstruct } from './keycloak-construct'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as route53 from 'aws-cdk-lib/aws-route53'

export interface NgDemoStackProps extends cdk.StackProps {
  environment: string
  hostedZoneId?: string
  infrastructure?: Omit<NgDemoInfrastructureProps, 'environment'>
  includeKeycloak?: boolean
}

export class NgDemoStack extends cdk.Stack {
  public readonly infrastructure: NgDemoInfrastructure
  public readonly keycloak?: KeycloakConstruct

  constructor(scope: Construct, id: string, props: NgDemoStackProps) {
    super(scope, id, props)

    this.infrastructure = new NgDemoInfrastructure(this, 'Infrastructure', {
      certificateArn: props.infrastructure?.certificateArn || '',
      domainName: props.infrastructure?.domainName || '',
      environment: props.environment,
    })

    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: props.infrastructure?.domainName || '',
    })

    if (props.includeKeycloak) {
      this.keycloak = new KeycloakConstruct(this, 'Keycloak', {
        certificateArn: props.infrastructure?.certificateArn || '',
        cluster: this.infrastructure.cluster,
        domainName: props.infrastructure?.domainName ?? '',
        environment: props.environment,
        hostedZone,
        vpc: this.infrastructure.vpc,
      })

      const backendTaskDefinition = this.infrastructure.backendService.taskDefinition
      const backendContainer = backendTaskDefinition.defaultContainer!

      backendContainer.addEnvironment('KEYCLOAK_AUTH_SERVER_URL', `https://auth.${props.infrastructure?.domainName}`)
      backendContainer.addEnvironment('KEYCLOAK_REALM', 'ng-demo')
      backendContainer.addEnvironment('KEYCLOAK_CLIENT_ID', 'ng-demo-client')
      backendContainer.addSecret('KEYCLOAK_CLIENT_SECRET', ecs.Secret.fromSecretsManager(this.keycloak.keycloakClientSecret, 'KEYCLOAK_CLIENT_SECRET'))

      new cdk.CfnOutput(this, 'KeycloakSetupInstructions', {
        value: `Configure realm at: https://${this.keycloak.loadBalancer.loadBalancerDnsName}/admin`,
        description: 'Keycloak admin console URL for realm configuration',
      })
    }
  }
} 