# ng-demo Infrastructure

AWS CDK Infrastructure for the ng-demo application built with TypeScript.

## 🏗️ Architecture

This infrastructure deploys:
- **VPC** with public, private, and isolated subnets
- **RDS PostgreSQL** database in isolated subnets
- **ECS Fargate** service serving both frontend and backend
- **Application Load Balancer** for public access
- **Keycloak** authentication service (optional)

## 🚀 Quick Start

### Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Docker** for building application images
3. **Node.js** 18+ for CDK and build tools

### Setup

```bash
# Install dependencies
npm install

# Bootstrap CDK (first time only)
npm run bootstrap

# Build and deploy to development
npm run deploy:dev
```

## 📜 Available Scripts

### Development Workflow

```bash
# Validate code quality
npm run validate                 # Run all checks (typecheck, lint, format, test)
npm run lint                     # Run ESLint
npm run lint:fix                 # Fix auto-fixable lint issues
npm run format                   # Format code with Prettier
npm run test                     # Run Jest tests

# Build
npm run build                    # Compile TypeScript
npm run watch                    # Watch mode compilation
npm run build:app                # Build Docker image for application
```

### CDK Operations

```bash
# Infrastructure management
npm run synth                    # Synthesize CloudFormation templates
npm run diff                     # Show differences with deployed stack
npm run status                   # List all stacks

# Deployment
npm run deploy                   # Deploy to dev (default)
npm run deploy:dev               # Deploy to development environment
npm run deploy:staging           # Deploy to staging environment  
npm run deploy:prod              # Deploy to production environment

# Destruction (use with caution!)
npm run destroy:dev              # Destroy development stack
npm run destroy:staging          # Destroy staging stack
npm run destroy:prod             # Destroy production stack
```

### Monitoring

```bash
npm run logs                     # Follow ECS logs
```

## 🌍 Environments

Three environments are configured with different resource allocations:

### Development
- **Database**: t3.micro, 20GB storage
- **ECS**: 256 CPU, 512MB memory, 1 instance
- **Features**: Non-production optimized, lower costs

### Staging  
- **Database**: t3.small, 50GB storage
- **ECS**: 512 CPU, 1024MB memory, 2 instances
- **Features**: Production-like environment for testing

### Production
- **Database**: t3.medium, 100GB storage  
- **ECS**: 1024 CPU, 2048MB memory, 3 instances
- **Features**: High availability, encryption, backups

## 🔐 Security & Best Practices

### Implemented Security Features
- ✅ VPC isolation with private subnets
- ✅ Database encryption at rest
- ✅ Secrets Manager for credentials
- ✅ Security groups with least privilege
- ✅ Public access blocked on S3 buckets
- ✅ Backup retention policies

### Linting & Code Quality
- **ESLint** with CDK-specific rules
- **Prettier** for consistent formatting
- **TypeScript** strict mode
- **Security** plugins for vulnerability detection
- **Import** organization and validation

## 📁 Project Structure

```
infrastructure/
├── bin/                     # CDK app entry points
│   └── ng-demo.ts          # Main CDK application
├── lib/                     # CDK constructs
│   ├── index.ts            # Main infrastructure construct
│   ├── keycloak-construct.ts # Keycloak authentication
│   └── ng-demo-stack.ts    # Complete application stack
├── test/                    # Jest tests
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
├── cdk.json                # CDK configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

The following environment variables can be set:

```bash
export CDK_DEFAULT_ACCOUNT=123456789012  # AWS Account ID
export CDK_DEFAULT_REGION=us-east-1      # AWS Region
```

### Customization

Modify the stack configurations in `bin/ng-demo.ts` to adjust:
- Instance types and sizes
- Scaling parameters
- Feature flags (e.g., Keycloak inclusion)
- Resource tags

## 🐛 Troubleshooting

### Common Issues

1. **Bootstrap Required**
   ```bash
   npm run bootstrap
   ```

2. **Docker Build Fails**
   - Ensure Docker is running
   - Check Dockerfile exists in parent directory

3. **Permission Errors**
   - Verify AWS credentials are configured
   - Check IAM permissions for CDK operations

4. **Stack Drift**
   ```bash
   npm run diff        # Check differences
   npm run deploy:dev  # Re-deploy to fix drift
   ```

### Monitoring

- **CloudWatch Logs**: `npm run logs`
- **AWS Console**: Check ECS, RDS, and CloudFormation
- **Stack Status**: `npm run status`

## 📚 Documentation

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [CDK TypeScript Reference](https://docs.aws.amazon.com/cdk/api/v2/typescript/)
- [Best Practices Guide](https://docs.aws.amazon.com/cdk/v2/guide/best-practices.html)

## 🤝 Contributing

1. Run `npm run validate` before committing
2. Follow the established naming conventions
3. Add tests for new constructs
4. Update documentation for significant changes
