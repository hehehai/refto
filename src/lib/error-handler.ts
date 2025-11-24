import { toast } from "sonner";

interface ErrorContext {
  action: string;
  fallback?: string;
  showToast?: boolean;
}

/**
 * Extracts error message from unknown error
 */
export function getErrorMessage(
  error: unknown,
  fallback = "An error occurred"
): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return fallback;
}

/**
 * Handles API errors consistently across the app
 */
export function handleApiError(error: unknown, context: ErrorContext): void {
  const { action, fallback = "Please try again", showToast = true } = context;
  const message = getErrorMessage(error, fallback);

  if (showToast) {
    toast.error(message, {
      description: `${action} failed`,
    });
  }

  // Log error for debugging
  console.error(`[${action}]`, error);
}

/**
 * Handles success messages consistently
 */
export function handleApiSuccess(action: string, description?: string): void {
  toast.success(`${action} successful`, {
    description,
  });
}

/**
 * Wraps an async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: ErrorContext
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleApiError(error, context);
    return null;
  }
}
