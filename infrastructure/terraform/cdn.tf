# CloudFront distribution for tracker script
resource "aws_cloudfront_distribution" "cdn" {
  enabled = true
  
  origin {
    domain_name = aws_s3_bucket.cdn.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.cdn.id}"
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.cdn.id}"
    viewer_protocol_policy = "redirect-to-https"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
