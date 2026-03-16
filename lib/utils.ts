import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts a user-friendly API error message from unknown thrown values.
 */
export function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
  if (typeof error === 'object' && error !== null) {
    const maybeResponse = error as { response?: { data?: { message?: string | string[] } } };
    const message = maybeResponse.response?.data?.message;

    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    if (Array.isArray(message) && message.length > 0) {
      return message.join(', ');
    }
  }

  return fallbackMessage;
}
