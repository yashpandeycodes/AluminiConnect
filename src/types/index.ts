export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

export class AppError extends Error {
  public code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'AppError';
  }
}
