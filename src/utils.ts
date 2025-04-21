export function isValidTimestamp(timestamp: string): boolean {
  if (!timestamp) {
    return false;
  }

  const isValid = parseInt(timestamp, 10);
  console.log({ isValid })
  if (isNaN(isValid)) {
    return false;
  }

  return parseInt(timestamp, 10) >= 0;
}

function isInMilliseconds(timestamp: string): boolean {
  const timestampNumber = parseInt(timestamp, 10);
  return timestampNumber > 10000000000; // 10 digits for seconds
}
function isInSeconds(timestamp: string): boolean {
  const timestampNumber = parseInt(timestamp, 10);
  return timestampNumber <= 10000000000; // 10 digits for seconds
}
function convertToMilliseconds(timestamp: string): number {
  const timestampNumber = parseInt(timestamp, 10);
  return isInSeconds(timestamp) ? timestampNumber * 1000 : timestampNumber;
}
function convertToSeconds(timestamp: string): number {
  const timestampNumber = parseInt(timestamp, 10);
  return isInMilliseconds(timestamp) ? Math.floor(timestampNumber / 1000) : timestampNumber;
}
