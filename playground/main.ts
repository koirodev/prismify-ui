import { createApp } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import '../src/styles/index.scss';
import App from './App.vue';

const router = createRouter({
  history: createMemoryHistory('/'),
  routes: [{ path: '/', name: 'home', component: { template: '<div />' } }],
});

createApp(App).use(router).mount('#app');
