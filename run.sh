#!/bin/bash

# Default values
CONTAINER_NAME="my-app"
IMAGE_NAME="my-app"
IMAGE_TAG="latest"
ENV_FILE=".env"
PORT=3000
DETACH=false
FORCE_REMOVE=false

# Required environment variables
REQUIRED_ENV_VARS=(
    "DATABASE_URL"
    "NODE_ENV"
)

# Help function
show_help() {
    echo "Usage: ./run.sh [OPTIONS]"
    echo "Run the Docker container for the application."
    echo
    echo "Options:"
    echo "  -h, --help           Show this help message"
    echo "  -n, --name NAME      Container name (default: my-app)"
    echo "  -i, --image NAME     Image name (default: my-app)"
    echo "  -t, --tag TAG        Image tag (default: latest)"
    echo "  -e, --env FILE       Environment file (default: .env)"
    echo "  -p, --port PORT      Host port to bind (default: 3000)"
    echo "  -d, --detach         Run container in background"
    echo "  -f, --force          Force remove existing container"
    echo
    echo "Required environment variables in $ENV_FILE:"
    for var in "${REQUIRED_ENV_VARS[@]}"; do
        echo "  - $var"
    done
    echo
    echo "Example:"
    echo "  ./run.sh --name my-app-prod --env .env.prod --port 8080 --detach"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -n|--name)
            CONTAINER_NAME="$2"
            shift 2
            ;;
        -i|--image)
            IMAGE_NAME="$2"
            shift 2
            ;;
        -t|--tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        -e|--env)
            ENV_FILE="$2"
            shift 2
            ;;
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        -d|--detach)
            DETACH=true
            shift
            ;;
        -f|--force)
            FORCE_REMOVE=true
            shift
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

# Validate required environment variables
missing_vars=()
while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ $line =~ ^[^#] ]]; then  # Skip comments
        key=$(echo "$line" | cut -d'=' -f1)
        for required in "${REQUIRED_ENV_VARS[@]}"; do
            if [[ "$key" == "$required" ]]; then
                continue 2
            fi
        done
    fi
done < "$ENV_FILE"

for required in "${REQUIRED_ENV_VARS[@]}"; do
    if ! grep -q "^${required}=" "$ENV_FILE"; then
        missing_vars+=("$required")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "Error: Missing required environment variables in $ENV_FILE:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

# Check if container already exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    if [ "$FORCE_REMOVE" = true ]; then
        echo "Removing existing container..."
        docker rm -f "$CONTAINER_NAME"
    else
        echo "Error: Container $CONTAINER_NAME already exists. Use --force to remove it."
        exit 1
    fi
fi

# Prepare docker run command
CMD="docker run"
if [ "$DETACH" = true ]; then
    CMD="$CMD -d"
fi

# Add container name and port mapping
CMD="$CMD --name $CONTAINER_NAME"
CMD="$CMD -p $PORT:3000"

# Add environment file
CMD="$CMD --env-file $ENV_FILE"

# Add restart policy
CMD="$CMD --restart unless-stopped"

# Add health check monitoring
CMD="$CMD --health-start-period 30s"
CMD="$CMD --health-interval 30s"
CMD="$CMD --health-timeout 3s"
CMD="$CMD --health-retries 3"

# Add image name and tag
CMD="$CMD $IMAGE_NAME:$IMAGE_TAG"

# Run the container
echo "Starting container $CONTAINER_NAME..."
echo "Using environment file: $ENV_FILE"
echo "Checking environment variables..."

if eval "$CMD"; then
    if [ "$DETACH" = true ]; then
        echo "Container started in background. Use 'docker logs $CONTAINER_NAME' to view logs."
        echo "Container health can be monitored with 'docker inspect $CONTAINER_NAME | grep Health'"
    fi
    echo "Application is running at http://localhost:$PORT"
else
    echo "Error: Failed to start container!"
    exit 1
fi 