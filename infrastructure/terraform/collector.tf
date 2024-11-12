# ECS cluster for collector service
resource "aws_ecs_cluster" "collector" {
  name = "${var.project_name}-collector-${var.environment}"
}

# ECS task definition
resource "aws_ecs_task_definition" "collector" {
  family                   = "collector"
  requires_compatibilities = ["FARGATE"]
  network_mode            = "awsvpc"
  cpu                     = 256
  memory                  = 512

  container_definitions = jsonencode([
    {
      name  = "collector"
      image = "${aws_ecr_repository.collector.repository_url}:latest"
      environment = [
        { name = "NODE_ENV", value = var.environment },
        { name = "SESSION_BUCKET", value = aws_s3_bucket.sessions.id }
      ]
      portMappings = [
        {
          containerPort = 3001
          hostPort      = 3001
        }
      ]
    }
  ])
}

# ECS service
resource "aws_ecs_service" "collector" {
  name            = "collector"
  cluster         = aws_ecs_cluster.collector.id
  task_definition = aws_ecs_task_definition.collector.arn
  desired_count   = 2

  network_configuration {
    subnets         = aws_vpc.main.private_subnets
    security_groups = [aws_security_group.collector.id]
  }
}
