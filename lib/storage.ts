import { GenerationRecord, VaultItem } from "./types";

const HISTORY_KEY = "creatorkit_history";
const VAULT_KEY = "creatorkit_vault";

export function getHistory(): GenerationRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveHistory(record: GenerationRecord) {
  if (typeof window === "undefined") return;
  const current = getHistory();
  localStorage.setItem(HISTORY_KEY, JSON.stringify([record, ...current]));
}

export function getVault(): VaultItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(VAULT_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveToVault(item: VaultItem) {
  if (typeof window === "undefined") return;
  const current = getVault();
  localStorage.setItem(VAULT_KEY, JSON.stringify([item, ...current]));
}

export function clearVault() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(VAULT_KEY);
}