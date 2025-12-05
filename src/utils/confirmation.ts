const STORAGE_PREFIX = "chromatic-confirm-";

export type ConfirmationAction = "reset" | "image" | "preset";

export function getConfirmationKey(action: ConfirmationAction): string {
  return `${STORAGE_PREFIX}${action}`;
}

export function shouldSkipConfirmation(action: ConfirmationAction): boolean {
  try {
    const key = getConfirmationKey(action);
    const value = localStorage.getItem(key);
    return value === "true";
  } catch (e) {
    console.error("Failed to read confirmation preference:", e);
    return false;
  }
}

export function setSkipConfirmation(action: ConfirmationAction, skip: boolean): void {
  try {
    const key = getConfirmationKey(action);
    localStorage.setItem(key, skip ? "true" : "false");
  } catch (e) {
    console.error("Failed to save confirmation preference:", e);
  }
}
