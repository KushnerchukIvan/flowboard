import type { AuthUser } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();
  if (!auth.initialized) {
    try {
      const requestFetch = useRequestFetch();
      const result = await requestFetch<{ user: AuthUser }>("/api/auth/me");
      auth.setUser(result.user);
    } catch {
      auth.setUser(null);
    }
  }
  if (to.path === "/auth") {
    if (auth.isAuthenticated) return navigateTo("/");
    return;
  }
  if (!auth.isAuthenticated) return navigateTo("/auth");
});
