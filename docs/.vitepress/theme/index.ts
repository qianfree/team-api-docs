import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Home from './components/Home.vue'
import Pricing from './components/Pricing.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Home', Home)
    app.component('Pricing', Pricing)
  },
} satisfies Theme
