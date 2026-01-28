// localStorage wrapper with type safety

const STORAGE_KEYS = {
  USER: 'taskflow_user',
  PROJECTS: 'taskflow_projects',
  TEAM: 'taskflow_team',
  ANALYTICS: 'taskflow_analytics',
  SESSION_ID: 'taskflow_session_id',
  ONBOARDING: 'taskflow_onboarding',
} as const;

export function getItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function removeItem(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

export function clearAll(): void {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

export { STORAGE_KEYS };
