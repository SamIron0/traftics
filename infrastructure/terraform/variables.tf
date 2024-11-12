variable "aws_region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment (dev/staging/prod)"
  default     = "dev"
}

variable "project_name" {
  description = "Project name"
  default     = "session-recorder"
}
