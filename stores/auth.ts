export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({ user: null as AuthUser | null, initialized: false }),
  getters: { isAuthenticated: (state) => Boolean(state.user) },
  actions: {
    setUser(user: AuthUser | null) {
      this.user = user;
      this.initialized = true;
    },
    async hydrate() {
      try {
        const result = await $fetch<{ user: AuthUser }>("/api/auth/me");
        this.setUser(result.user);
      } catch {
        this.setUser(null);
      }
    },
    async register(name: string, email: string, password: string) {
      const result = await $fetch<{ user: AuthUser }>("/api/auth/register", {
        method: "POST",
        body: { name, email, password },
      });
      this.setUser(result.user);
    },
    async signIn(email: string, password: string) {
      const result = await $fetch<{ user: AuthUser }>("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      this.setUser(result.user);
    },
    async signOut() {
      try {
        await $fetch("/api/auth/logout", { method: "POST" });
      } finally {
        this.setUser(null);
      }
    },
  },
});
