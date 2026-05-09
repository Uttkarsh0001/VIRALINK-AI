const KEY = "creatorkit_credits";

export function getCredits() {
  if (typeof window === "undefined") return 40;
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, "40");
    return 40;
  }
  return Number(raw);
}

export function setCredits(value: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, String(value));
}

export function deductCredits(amount: number) {
  const current = getCredits();
  const next = Math.max(current - amount, 0);
  setCredits(next);
  return next;
}

export function addCredits(amount: number) {
  const current = getCredits();
  const next = current + amount;
  setCredits(next);
  return next;
}