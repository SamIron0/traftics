export interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    orgId: string;
  };
  headers?: Record<string, string>;
}

export interface ServiceRequest extends AuthenticatedRequest {
  query?: Record<string, string | string[]>;
  params?: Record<string, string>;
  body?: unknown;
} 