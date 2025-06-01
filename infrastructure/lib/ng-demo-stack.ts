import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { NgDemoInfrastructure, NgDemoInfrastructureProps } from './index'
import { KeycloakConstruct } from './keycloak-construct'
import * as ecs from 'aws-cdk-lib/aws-ecs'

export interface NgDemoStackProps extends cdk.StackProps {
  environment: string
  infrastructure?: Omit<NgDemoInfrastructureProps, 'environment'>
  includeKeycloak?: boolean
}

export class NgDemoStack extends cdk.Stack {
  public readonly infrastructure: NgDemoInfrastructure
  public readonly keycloak?: KeycloakConstruct

  constructor(scope: Construct, id: string, props: NgDemoStackProps) {
    super(scope, id, props)

    this.infrastructure = new NgDemoInfrastructure(this, 'Infrastructure', {
      environment: props.environment,
      ...props.infrastructure,
    })

    if (props.includeKeycloak) {
      this.keycloak = new KeycloakConstruct(this, 'Keycloak', {
        vpc: this.infrastructure.vpc,
        cluster: this.infrastructure.cluster,
        environment: props.environment,
      })

      const backendTaskDefinition = this.infrastructure.backendService.taskDefinition
      const backendContainer = backendTaskDefinition.defaultContainer!

      backendContainer.addEnvironment('KEYCLOAK_AUTH_SERVER_URL', `http://${this.keycloak.loadBalancer.loadBalancerDnsName}`)
      backendContainer.addEnvironment('KEYCLOAK_REALM', 'ng-demo')
      backendContainer.addEnvironment('KEYCLOAK_CLIENT_ID', 'ng-demo-client')
      backendContainer.addSecret('KEYCLOAK_CLIENT_SECRET', ecs.Secret.fromSecretsManager(this.keycloak.adminSecret, 'password'))

      new cdk.CfnOutput(this, 'KeycloakSetupInstructions', {
        value: `Configure realm at: http://${this.keycloak.loadBalancer.loadBalancerDnsName}/admin`,
        description: 'Keycloak admin console URL for realm configuration',
      })
    }

    new cdk.CfnOutput(this, 'DeploymentInstructions', {
      value: this.getDeploymentInstructions(),
      description: 'Instructions for deploying the application',
    })
  }

  private getDeploymentInstructions(): string {
    const instructions = [
      '1. Build and push Docker image for application',
      '2. Update ECS service with new image',
      '3. Application will be available at the load balancer URL',
    ]

    if (this.keycloak) {
      instructions.push('4. Configure Keycloak realm and client settings')
    }

    return instructions.join(' | ')
  }
} 