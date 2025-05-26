#!/bin/bash

# Default values
IMAGE_NAME="my-app"
IMAGE_TAG="latest"
ENV_FILE=".env"
DOCKER_COMPOSE_FILE="docker-compose.yml"
BUILD_ONLY=false
PUSH=false
REGISTRY=""

# Default environment variables
DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/messages?schema=public"
KEYCLOAK_AUTH_SERVER_URL="http://host.docker.internal:8080/auth"
KEYCLOAK_REALM="my-app"
KEYCLOAK_CLIENT_ID="my-app-client"
KEYCLOAK_CLIENT_SECRET="your-client-secret"
NODE_ENV="production"
PORT="3000"

# Function to normalize Keycloak URL
normalize_keycloak_url() {
    local url="$1"
    # Remove trailing slash if present
    url="${url%/}"
    # Add /auth if not present
    if [[ ! "$url" =~ /auth$ ]]; then
        url="${url}/auth"
    fi
    echo "$url"
}

# Help function
show_help() {
    echo "Usage: ./build.sh [OPTIONS]"
    echo "Build and optionally run the Docker image for the application."
    echo
    echo "Options:"
    echo "  -h, --help                    Show this help message"
    echo "  -t, --tag TAG                 Specify image tag (default: latest)"
    echo "  -e, --env FILE                Specify environment file (default: .env)"
    echo "  -b, --build-only              Only build the image, don't run it"
    echo "  -p, --push                    Push the image after building"
    echo "  -r, --registry URL            Specify docker registry URL"
    echo "  -d, --database URL            Specify database URL"
    echo "  -k, --keycloak URL            Specify Keycloak server URL (will append /auth if missing)"
    echo "  --realm REALM                 Specify Keycloak realm"
    echo "  --client-id ID                Specify Keycloak client ID"
    echo "  --client-secret SECRET        Specify Keycloak client secret"
    echo
    echo "Environment Variables (can be set in $ENV_FILE):"
    echo "  DATABASE_URL                  PostgreSQL connection URL"
    echo "  KEYCLOAK_AUTH_SERVER_URL      Keycloak server URL (should include /auth)"
    echo "  KEYCLOAK_REALM               Keycloak realm name"
    echo "  KEYCLOAK_CLIENT_ID           Keycloak client ID"
    echo "  KEYCLOAK_CLIENT_SECRET       Keycloak client secret"
    echo
    echo "Example:"
    echo "  ./build.sh --tag v1.0.0 --env .env.prod --keycloak http://keycloak:8080 --realm my-realm"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -t|--tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        -e|--env)
            ENV_FILE="$2"
            shift 2
            ;;
        -b|--build-only)
            BUILD_ONLY=true
            shift
            ;;
        -p|--push)
            PUSH=true
            shift
            ;;
        -r|--registry)
            REGISTRY="$2"
            shift 2
            ;;
        -d|--database)
            DATABASE_URL="$2"
            shift 2
            ;;
        -k|--keycloak)
            KEYCLOAK_AUTH_SERVER_URL=$(normalize_keycloak_url "$2")
            shift 2
            ;;
        --realm)
            KEYCLOAK_REALM="$2"
            shift 2
            ;;
        --client-id)
            KEYCLOAK_CLIENT_ID="$2"
            shift 2
            ;;
        --client-secret)
            KEYCLOAK_CLIENT_SECRET="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: Environment file $ENV_FILE not found!"
    exit 1
fi

# Set full image name
if [ -n "$REGISTRY" ]; then
    FULL_IMAGE_NAME="$REGISTRY/$IMAGE_NAME:$IMAGE_TAG"
else
    FULL_IMAGE_NAME="$IMAGE_NAME:$IMAGE_TAG"
fi

# Build the image
echo "Building Docker image: $FULL_IMAGE_NAME"
if ! docker build -t "$FULL_IMAGE_NAME" .; then
    echo "Error: Docker build failed!"
    exit 1
fi

# Push the image if requested
if [ "$PUSH" = true ]; then
    echo "Pushing image to registry..."
    if ! docker push "$FULL_IMAGE_NAME"; then
        echo "Error: Failed to push image!"
        exit 1
    fi
fi

# Run the container if not build-only
if [ "$BUILD_ONLY" = false ]; then
    echo "Running container..."
    if ! docker run -d \
        --name "$IMAGE_NAME" \
        --add-host=host.docker.internal:host-gateway \
        --env-file "$ENV_FILE" \
        -e "DATABASE_URL=$DATABASE_URL" \
        -e "KEYCLOAK_AUTH_SERVER_URL=$KEYCLOAK_AUTH_SERVER_URL" \
        -e "KEYCLOAK_REALM=$KEYCLOAK_REALM" \
        -e "KEYCLOAK_CLIENT_ID=$KEYCLOAK_CLIENT_ID" \
        -e "KEYCLOAK_CLIENT_SECRET=$KEYCLOAK_CLIENT_SECRET" \
        -e "NODE_ENV=$NODE_ENV" \
        -e "PORT=$PORT" \
        -p 3000:3000 \
        "$FULL_IMAGE_NAME"; then
        echo "Error: Failed to start container!"
        exit 1
    fi
    
    echo "Container started successfully!"
    echo "Application is running at http://localhost:3000"
    echo
    echo "Environment Configuration:"
    echo "  Database URL: $DATABASE_URL"
    echo "  Keycloak Server: $KEYCLOAK_AUTH_SERVER_URL"
    echo "  Keycloak Realm: $KEYCLOAK_REALM"
    echo "  Keycloak Client ID: $KEYCLOAK_CLIENT_ID"
    echo "  Node Environment: $NODE_ENV"
fi

echo "Build process completed successfully!" 