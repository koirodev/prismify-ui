import '../src/styles/index.scss';
import './storybook-overrides.scss';
import type { Preview } from '@storybook/vue3';
import { setup } from '@storybook/vue3';
import { h } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';

const storybookRouter = createRouter({
  history: createMemoryHistory('/'),
  routes: [
    { path: '/', name: 'home', component: { render: () => h('div', 'Home') } },
    {
      path: '/docs',
      name: 'docs',
      component: { render: () => h('div', 'Docs') },
    },
    {
      path: '/docs/components/link',
      name: 'link-doc',
      component: { render: () => h('div', 'PfLink') },
    },
  ],
});

setup((app) => {
  app.use(storybookRouter);
});

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          'Layout',
          'Element',
          'Form',
          'Data',
          'Navigation',
          'Overlay',
          'Page',
          'Dashboard',
          'Editor',
          'Color Mode',
          'i18n',
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
  },
};

export default preview;
