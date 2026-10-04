import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// When a page file was updated after the tab loaded, the old copy can't be fetched.
// Reload once to pick up the fresh version instead of showing a blank screen.
if (typeof window !== "undefined" && !(window as any).__mavenPreloadGuard) {
  (window as any).__mavenPreloadGuard = true;
  const reloadOnce = () => {
    const key = "maven-stale-reload";
    const last = Number(sessionStorage.getItem(key) || 0);
    if (Date.now() - last > 10000) {
      sessionStorage.setItem(key, String(Date.now()));
      window.location.reload();
    }
  };
  window.addEventListener("vite:preloadError", (e) => {
    e.preventDefault();
    reloadOnce();
  });
  window.addEventListener("unhandledrejection", (e) => {
    if (/Failed to fetch dynamically imported module|Importing a module script failed/i.test(String(e.reason?.message ?? e.reason))) {
      reloadOnce();
    }
  });
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
