#!/bin/bash

# =============================================================================
# 🚀 ng-demo AWS Deployment Script
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="dev"
SKIP_FRONTEND=false
SKIP_BACKEND=false
AWS_REGION="us-east-1"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Help function
show_help() {
    cat << EOF
ng-demo AWS Deployment Script

Usage: $0 [OPTIONS]

Options:
    -e, --environment   Environment to deploy (dev|staging|prod) [default: dev]
    -r, --region        AWS region [default: us-east-1]
    --skip-frontend     Skip frontend build and deployment
    --skip-backend      Skip backend build and deployment
    --destroy           Destroy the stack instead of deploying
    -h, --help          Show this help message

Examples:
    $0 -e dev                   # Deploy to development
    $0 -e prod -r us-west-2     # Deploy to production in us-west-2
    $0 --destroy -e dev         # Destroy development stack
EOF
}

# Parse command line arguments
DESTROY=false
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -r|--region)
            AWS_REGION="$2"
            shift 2
            ;;
        --skip-frontend)
            SKIP_FRONTEND=true
            shift
            ;;
        --skip-backend)
            SKIP_BACKEND=true
            shift
            ;;
        --destroy)
            DESTROY=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT. Must be dev, staging, or prod."
    exit 1
fi

STACK_NAME="NgDemo-$(echo $ENVIRONMENT | sed 's/.*/\u&/')"

print_status "🚀 Starting deployment for environment: $ENVIRONMENT"
print_status "📍 Region: $AWS_REGION"
print_status "📦 Stack: $STACK_NAME"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Set AWS environment variables
export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
export CDK_DEFAULT_REGION=$AWS_REGION

print_status "🔧 Using AWS Account: $CDK_DEFAULT_ACCOUNT"

if [ "$DESTROY" = true ]; then
    print_warning "⚠️  DESTROYING stack: $STACK_NAME"
    read -p "Are you sure you want to destroy the $ENVIRONMENT environment? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cdk destroy $STACK_NAME --force
        print_success "🗑️  Stack destroyed successfully"
    else
        print_status "❌ Destruction cancelled"
    fi
    exit 0
fi

# Bootstrap CDK if needed
print_status "🔄 Bootstrapping CDK..."
cdk bootstrap aws://$CDK_DEFAULT_ACCOUNT/$AWS_REGION

# Build and deploy backend
if [ "$SKIP_BACKEND" = false ]; then
    print_status "🏗️  Building backend..."
    cd ..
    docker build -t ng-demo-backend:latest .
    cd infrastructure
fi

# Deploy infrastructure
print_status "☁️  Deploying infrastructure..."
cdk deploy $STACK_NAME --require-approval never

# Get outputs
print_status "📋 Getting deployment outputs..."
OUTPUTS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $AWS_REGION --query 'Stacks[0].Outputs' --output json)

# Extract important values
FRONTEND_BUCKET=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="FrontendBucketName") | .OutputValue')
CLOUDFRONT_DISTRIBUTION=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="FrontendUrl") | .OutputValue' | sed 's/.*\/\///' | sed 's/\/.*//')
BACKEND_URL=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="BackendUrl") | .OutputValue')

# Deploy frontend
if [ "$SKIP_FRONTEND" = false ] && [ "$FRONTEND_BUCKET" != "null" ]; then
    print_status "🌐 Building and deploying frontend..."
    cd ../client
    
    # Update environment for production build
    if [ "$ENVIRONMENT" = "prod" ]; then
        npm run build
    else
        npm run build -- --configuration=development
    fi
    
    # Deploy to S3
    aws s3 sync dist/ s3://$FRONTEND_BUCKET --delete
    
    # Invalidate CloudFront
    if [ "$CLOUDFRONT_DISTRIBUTION" != "null" ]; then
        print_status "🔄 Invalidating CloudFront distribution..."
        aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION --paths "/*" > /dev/null
    fi
    
    cd ../infrastructure
fi

# Print summary
print_success "🎉 Deployment completed successfully!"
echo
print_status "📊 Deployment Summary:"
echo "  Environment: $ENVIRONMENT"
echo "  Region: $AWS_REGION"
echo "  Stack: $STACK_NAME"

if [ "$FRONTEND_BUCKET" != "null" ]; then
    echo "  Frontend Bucket: $FRONTEND_BUCKET"
fi

if [ "$BACKEND_URL" != "null" ]; then
    echo "  Backend URL: $BACKEND_URL"
fi

echo
print_status "🔗 Useful commands:"
echo "  Check stack status: cdk list"
echo "  View stack details: aws cloudformation describe-stacks --stack-name $STACK_NAME"
echo "  Check logs: aws logs tail /aws/ecs/ng-demo --follow"
echo
print_warning "⚠️  Don't forget to configure Keycloak realm settings if this is a first deployment!" 