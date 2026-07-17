import pkg from './package.json';

export default defineNuxtConfig({
    runtimeConfig: {
        public: {
            version: pkg.version,
            siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
        },
    },
    app: {
        head: {
            meta: [
                {
                    name: 'viewport',
                    content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
                },
                {
                    name: 'theme-color',
                    content: '#C4301F',
                },
            ],
            link: [
                {
                    rel: 'icon',
                    type: 'image/svg+xml',
                    href: '/favicon.svg',
                },
            ],
        },
    },
    compatibilityDate: '2026-01-01',
    devtools: { enabled: true },
    modules: [
        '@nuxt/eslint',
        '@nuxt/devtools',
        '@pinia/nuxt',
        '@nuxt/image',
        '@nuxt/icon',
        '@nuxt/fonts',
        '@nuxt/scripts',
    ],
    devServer: {
        port: 8080,
    },
    typescript: {
        typeCheck: 'build',
    },
    vite: {
        define: {
            global: 'globalThis',
        },
        css: {
            preprocessorMaxWorkers: true,
            preprocessorOptions: {
                scss: {
                    additionalData: `@use "~/scss/colors.scss" as *;@use "~/scss/variables.scss" as *;`,
                },
            },
        },
        resolve: {
            alias: {
                '.prisma/client/index-browser': './node_modules/.prisma/client/index-browser.js',
            },
        },
    },
});
