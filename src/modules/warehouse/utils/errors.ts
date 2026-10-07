export function getWarehouseErrorMessage(error: unknown, fallback: string) {
  const requestError = error as {
    response?: { status?: number; data?: { message?: string } };
  };
  const message = requestError.response?.data?.message;

  if (
    !message ||
    requestError.response?.status === 404 ||
    /route not found|cannot (get|post|put|delete)/i.test(message)
  ) {
    return fallback;
  }

  return message;
}