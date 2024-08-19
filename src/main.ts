import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import AOS from 'aos'
import PrimeVue from 'primevue/config';
import Lara from '@primevue/themes/lara';

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Lara
  }
});

app.mount('#app')

AOS.init()
