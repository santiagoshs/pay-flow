import { defineConfig } from '#q-app';

export default defineConfig((/* ctx */) => {
  return {
    boot: [
      'axios'
    ],

    css: [
      'app.scss'
    ],

    extras: [
      'roboto-font',
      'material-icons',
    ],

    build: {
      typescript: {
        strict: true,
        vueShim: true
      },

      vueRouterMode: 'hash',

      vitePlugins: [
        ['vite-plugin-checker', {
          vueTsc: true,
          eslint: {
            lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{ts,js,mjs,cjs,vue}"',
            useFlatConfig: true
          }
        }, { server: false }]
      ]
    },

    devServer: {
      open: true
    },

    framework: {
      config: {},
      plugins: [
        'Notify',
        'Dialog'
      ]
    },

    animations: []
  }
});
