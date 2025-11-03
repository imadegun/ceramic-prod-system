import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  public statusCode: number;
  public errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number = 500,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'ApiError';
  }
}

export function createSuccessResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status: statusCode }
  );
}

export function createErrorResponse(
  error: string | Error | ZodError,
  statusCode: number = 500,
  errors?: Record<string, string[]>
): NextResponse<ApiResponse> {
  let message = 'An unexpected error occurred';
  let validationErrors: Record<string, string[]> | undefined;

  if (error instanceof ZodError) {
    message = 'Validation failed';
    validationErrors = error.issues.reduce((acc, err) => {
      const field = err.path.join('.');
      if (!acc[field]) {
        acc[field] = [];
      }
      acc[field].push(err.message);
      return acc;
    }, {} as Record<string, string[]>);
    statusCode = 400;
  } else if (error instanceof ApiError) {
    message = error.message;
    statusCode = error.statusCode;
    validationErrors = error.errors;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  return NextResponse.json(
    {
      success: false,
      error: message,
      errors: validationErrors,
    },
    { status: statusCode }
  );
}

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return createErrorResponse(error.message, error.statusCode, error.errors);
  }

  if (error instanceof ZodError) {
    return createErrorResponse(error);
  }

  if (error instanceof Error) {
    // Handle Prisma errors
    if (error.message.includes('Unique constraint')) {
      return createErrorResponse('A record with this value already exists', 409);
    }

    if (error.message.includes('Foreign key constraint')) {
      return createErrorResponse('Related record not found', 400);
    }

    return createErrorResponse(error.message, 500);
  }

  return createErrorResponse('An unexpected error occurred', 500);
}

// Utility function to wrap API handlers with error handling
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}