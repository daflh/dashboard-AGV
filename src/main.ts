import 'primeicons/primeicons.css'
import './assets/main.css'

import { createApp } from 'vue'
import { definePreset } from '@primevue/themes'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import AOS from 'aos'
import Lara from '@primevue/themes/lara'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const app = createApp(App)
const vuetify = createVuetify({
  components,
  directives
})

const MyPreset = definePreset(Lara, {
  semantic: {
    primary: {
        50: '{indigo.50}',
        100: '{indigo.100}',
        200: '{indigo.200}',
        300: '{indigo.300}',
        400: '{indigo.400}',
        500: '{indigo.500}',
        600: '{indigo.600}',
        700: '{indigo.700}',
        800: '{indigo.800}',
        900: '{indigo.900}',
        950: '{indigo.950}'
    }
  }
});

app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: MyPreset,
    options: {
      darkModeSelector: '.p-dark'
    }
  }
})
app.use(vuetify)
app.mount('#app')

AOS.init()
