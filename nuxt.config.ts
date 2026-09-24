// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  runtimeConfig: {
    jwtSecret: process.env.NUXT_JWT_SECRET || process.env.JWT_SECRET || "",
  },
  css: ["~/assets/scss/_tokens.scss", "~/assets/css/main.css"],
  vite: {
    css: {
      preprocessorOptions: {
        scss: { api: "legacy" },
        sass: { api: "legacy" },
      },
    },
  },
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      title: "Flowboard — робочий простір команди",
      meta: [
        {
          name: "description",
          content:
            "Плануйте командні проєкти, завдання та дедлайни у Flowboard.",
        },
      ],
    },
  },

  modules: ["@pinia/nuxt", "@nuxt/eslint", "@nuxt/image"],
});
