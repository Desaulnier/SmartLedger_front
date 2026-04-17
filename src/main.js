import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import Particles from "@tsparticles/vue3";
import { loadSlim } from "@tsparticles/slim";

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.use(Particles, {
  init: async engine => {
    await loadSlim(engine); // 必须等待引擎加载完成
  },
});
app.mount('#app')