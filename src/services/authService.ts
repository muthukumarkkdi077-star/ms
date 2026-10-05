import { User } from '../types';

const SESSION_KEY = 'routemind_session_user';
const TOKEN_KEY = 'routemind_session_token';

export const authService = {
  isSupabaseConfigured(): boolean {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return Boolean(url && key && url.startsWith('http') && !url.includes('placeholder'));
  },

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Authentication failed' };
      }

      localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
      localStorage.setItem(TOKEN_KEY, data.token);

      return { success: true, user: data.user };
    } catch (err: any) {
      // Fallback for standalone frontend if backend connection encounters issue
      if (email.includes('@') && password.length >= 6) {
        const localUser: User = {
          id: `usr_${Date.now()}`,
          email,
          name: email.split('@')[0].toUpperCase(),
          role: 'Fleet Dispatcher',
          hub: 'South India Regional Command'
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(localUser));
        localStorage.setItem(TOKEN_KEY, `local_token_${Date.now()}`);
        return { success: true, user: localUser };
      }
      return { success: false, error: 'Could not reach authentication server.' };
    }
  },

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    try {
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch (e) {}
  },

  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken() && this.getCurrentUser());
  }
};
