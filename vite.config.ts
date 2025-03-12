import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import vueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

// https://vite.dev/config/
export default defineConfig((mode) => {
	return {
		base: mode.command === 'build' ? '/vnexus/' : '/',
		plugins: [
			vue(),
			vueDevTools(),
			vueI18nPlugin({
				include: [fileURLToPath(new URL('./src/locales/**', import.meta.url))],
			}),
		],
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url)),
			},
		},
	}
})
