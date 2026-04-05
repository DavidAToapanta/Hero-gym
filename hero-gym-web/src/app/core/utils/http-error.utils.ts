export function extractErrorMessage(error: unknown, fallbackMessage: string): string {
  const message = (error as { error?: { message?: string | string[] } })?.error?.message;

  if (typeof message === 'string' && message.trim() !== '') {
    return message;
  }

  if (Array.isArray(message)) {
    const normalizedMessages = message.filter(
      (item): item is string => typeof item === 'string' && item.trim() !== '',
    );

    if (normalizedMessages.length > 0) {
      return normalizedMessages.join('. ');
    }
  }

  return fallbackMessage;
}
