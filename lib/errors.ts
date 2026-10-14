/* Readable message for a failed server action, with a fallback. */
export function friendlyError(err: unknown, fallback: string): string {
  const message = err instanceof Error ? err.message : "";
  // Tab is running an older build than the server
  if (/Server Action .* was not found|Failed to find Server Action/i.test(message)) {
    return "The Hub was just updated, refresh the page and try again.";
  }
  // Production builds hide thrown messages
  if (!message || /omitted in production builds/i.test(message)) return fallback;
  return message;
}
