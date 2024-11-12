# S3 bucket for session recordings
resource "aws_s3_bucket" "sessions" {
  bucket = "${var.project_name}-sessions-${var.environment}"
}

resource "aws_s3_bucket_versioning" "sessions" {
  bucket = aws_s3_bucket.sessions.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 bucket for CDN assets
resource "aws_s3_bucket" "cdn" {
  bucket = "${var.project_name}-cdn-${var.environment}"
}

# CORS configuration for sessions bucket
resource "aws_s3_bucket_cors_configuration" "sessions" {
  bucket = aws_s3_bucket.sessions.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}
