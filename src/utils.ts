export function isValidTimestamp(timestamp: string): boolean {
  if (!timestamp || isNaN(Number(timestamp))) {
    return false;
  }

  const timestampNum = parseInt(timestamp, 10);
  if (isNaN(timestampNum)) {
    return false;
  }

  return timestampNum >= 0;
}
