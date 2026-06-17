// Data Transfer Objects for authentication API communication

export interface SignUpRequestDto {
  fullName: string;
  email: string;
  password: string;
}

export interface SignUpResponseDto {
  userId: string;
  verificationToken: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  code: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string[];
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
