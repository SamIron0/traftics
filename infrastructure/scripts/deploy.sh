#!/bin/bash

# Initialize Terraform
cd infrastructure/terraform
terraform init

# Apply Terraform changes
terraform apply -auto-approve

# Build and deploy collector
docker build -t collector ./apps/collector
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin
docker tag collector:latest $ECR_REPO:latest
docker push $ECR_REPO:latest

# Update ECS service
aws ecs update-service --cluster session-recorder-collector --service collector --force-new-deployment