export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
}

export interface CacheConfig {
  ttl: number;
  maxSize?: number;
}