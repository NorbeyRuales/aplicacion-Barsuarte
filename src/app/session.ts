import { type Client } from '../services/supabase';

export const HOME_ROUTE = '/';
export const CLIENT_PORTAL_ROUTE = '/clientes';
export const CLIENT_PROFILE_ROUTE = '/clientes/perfil';
export const CURRENT_CLIENT_KEY = 'barsuarte_current_client';
export const ADMIN_SESSION_KEY = 'barsuarte_admin_session';
export const POST_AUTH_REDIRECT_KEY = 'barsuarte_post_auth_redirect';
export const SESSION_CHANGED_EVENT = 'barsuarte-session-changed';

export type UserRole = 'admin' | 'client';

export interface AppSession {
  client: Client | null;
  role: UserRole | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
}

export function readStoredClient(): Client | null {
  try {
    const rawClient = localStorage.getItem(CURRENT_CLIENT_KEY);
    return rawClient ? (JSON.parse(rawClient) as Client) : null;
  } catch {
    localStorage.removeItem(CURRENT_CLIENT_KEY);
    return null;
  }
}

export function readAppSession(): AppSession {
  const client = readStoredClient();
  const adminEmail = localStorage.getItem(ADMIN_SESSION_KEY);
  const isAdmin = Boolean(client && adminEmail && client.email.toLowerCase() === adminEmail.toLowerCase());

  return {
    client,
    role: client ? (isAdmin ? 'admin' : 'client') : null,
    isLoggedIn: Boolean(client),
    isAdmin,
  };
}

export function saveAppSession(client: Client, role: UserRole) {
  localStorage.setItem(CURRENT_CLIENT_KEY, JSON.stringify(client));

  if (role === 'admin') {
    localStorage.setItem(ADMIN_SESSION_KEY, client.email);
  } else {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }

  notifySessionChanged();
}

export function clearAppSession() {
  localStorage.removeItem(CURRENT_CLIENT_KEY);
  localStorage.removeItem(ADMIN_SESSION_KEY);
  notifySessionChanged();
}

export function rememberPostAuthPath(pathname: string) {
  if (pathname && pathname !== CLIENT_PORTAL_ROUTE) {
    localStorage.setItem(POST_AUTH_REDIRECT_KEY, pathname);
  }
}

export function resolvePostAuthRedirect(fallback = HOME_ROUTE) {
  const redirect = localStorage.getItem(POST_AUTH_REDIRECT_KEY);
  localStorage.removeItem(POST_AUTH_REDIRECT_KEY);

  if (!redirect || redirect === CLIENT_PORTAL_ROUTE) {
    return fallback;
  }

  return redirect;
}

export function notifySessionChanged() {
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}
