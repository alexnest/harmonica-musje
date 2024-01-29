import { createApp } from 'vue'
import { setupStore } from './stores'
import { setupRouter } from './router'
import 'uno.css'

import App from './App.vue'

function bootstrap() {
  const app = createApp(App)
  setupStore(app)
  setupRouter(app)
  app.mount('#app')
}

bootstrap()
