import './assets/tailwind.css'

import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'
import messages from '@intlify/unplugin-vue-i18n/messages'
import App from './App.vue'

const getBrowserLocale = () => {
	const locale = navigator.language
	return locale.split('-')[0] // Extract the language code (e.g., "en" from "en-US")
}

const pinia = createPinia()

const i18n = createI18n({
	locale: getBrowserLocale(),
	fallbackLocale: 'en',
	messages,
})
createApp(App).use(pinia).use(i18n).mount('#app')
