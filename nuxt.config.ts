// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
    typescript: {
        typeCheck: true,
    },
    app: {
        head: {
            title: "Aelwren",
        },
    },
    modules: [
        //https://pinia.vuejs.org/ssr/nuxt.html
        "@pinia/nuxt",
        //https://nuxt.com/modules/pinia-plugin-persistedstate
        "pinia-plugin-persistedstate/nuxt",
        //https://primevue.org/nuxt
        "@primevue/nuxt-module",
    ],
    runtimeConfig: {
        public: {
            baseURL: "",
        },
    },
});