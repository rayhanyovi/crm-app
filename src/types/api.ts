export type ApiSuccess<T, M = Record<string, unknown>> = {
  data: T;
  meta?: M;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
