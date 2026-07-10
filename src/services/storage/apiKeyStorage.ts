/**
 * API Key Storage Service
 *
 * Currently uses AsyncStorage. To migrate to react-native-keychain or any
 * secure storage, replace the implementation below while keeping the
 * exported interface identical. All callers remain untouched.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = 'pf_ai_key_';

// ---------------------------------------------------------------------------
// Interface — the contract that callers depend on
// ---------------------------------------------------------------------------

export interface ApiKeyStorage {
  save(providerId: string, key: string): Promise<boolean>;
  get(providerId: string): Promise<string | null>;
  remove(providerId: string): Promise<boolean>;
  has(providerId: string): Promise<boolean>;
  hasAny(providerIds: string[]): Promise<Record<string, boolean>>;
}

// ---------------------------------------------------------------------------
// AsyncStorage implementation (default)
// ---------------------------------------------------------------------------

function storageKey(providerId: string): string {
  return `${STORAGE_PREFIX}${providerId}`;
}

async function save(providerId: string, key: string): Promise<boolean> {
  try {
    await AsyncStorage.setItem(storageKey(providerId), key);
    return true;
  } catch {
    return false;
  }
}

async function get(providerId: string): Promise<string | null> {
  try {
    const value = await AsyncStorage.getItem(storageKey(providerId));
    return value || null;
  } catch {
    return null;
  }
}

async function remove(providerId: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(storageKey(providerId));
    return true;
  } catch {
    return false;
  }
}

async function has(providerId: string): Promise<boolean> {
  const key = await get(providerId);
  return key !== null && key.length > 0;
}

async function hasAny(providerIds: string[]): Promise<Record<string, boolean>> {
  const statuses: Record<string, boolean> = {};
  for (const id of providerIds) {
    statuses[id] = await has(id);
  }
  return statuses;
}

// ---------------------------------------------------------------------------
// Exported singleton
// ---------------------------------------------------------------------------

export const apiKeyStorage: ApiKeyStorage = {
  save,
  get,
  remove,
  has,
  hasAny,
};
