# Installation and usage

## Install

```bash
npm install prismify-ui
```

The package has **no runtime `dependencies`**; everything below is **`peerDependencies`**. Install the peers you need for the components you use. Exact version ranges match **`package.json`** in the repo.

| Peer | Used for |
| --- | --- |
| `vue` ^3.4 | All components |
| `vue-router` ^5 | **`PfLink`** (and router-aware navigation) |
| `@internationalized/date` ^3.12 | **`PfCalendar`** |
| `@internationalized/number` ^3.6 | **`PfInputNumber`** ([Internationalized Number](https://react-spectrum.adobe.com/internationalized/number/) — locale parsing/formatting) |
| `@tanstack/vue-table` ^8.21 | **`PfTable`** |
| `@tiptap/*` (full list in **`package.json` → `peerDependencies`**) | **`PfEditor`** and editor toolbar / menus / extensions |

If you use **`PfEditor`**, install the entire **`@tiptap/*`** set listed there (versions should stay aligned with each other).

## Quick start (Vue 3 + Vite)

### 1. Styles

Import the built CSS once (default `:root` tokens + component styles):

```ts
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import 'prismify-ui/style.css';

import PrismifyUI from 'prismify-ui';

createApp(App).use(PrismifyUI).mount('#app');
```

Without **`prismify-ui/style.css`**, components will not get baseline **`--pf-*`** values or component rules.

### 2. App shell

Use **`PfApp`** at the root for locale, `dir`, portal targets, and integration with overlays/toasts. **`PfCalendar`** without its own `locale` reads **`locale`** from the nearest **`PfApp`**.

```vue
<!-- App.vue -->
<template>
  <PfApp :locale="appLocale" dir="ltr">
    <RouterView />
  </PfApp>
</template>
```

Register **`vue-router`** in your app if you use **`PfLink`** with `to`.

### 3. Tree-shaking imports

```vue
<script setup lang="ts">
import { PfButton, PfIcon } from 'prismify-ui';
</script>
```

Styles must still come from **`prismify-ui/style.css`** (or an equivalent global bundle), or the UI will be incomplete.

The default export is the Vue plugin (also exported as **`prismifyPlugin`**):

```ts
import PrismifyUI, { prismifyPlugin } from 'prismify-ui';
// app.use(PrismifyUI) === app.use(prismifyPlugin)
```

## Quick start (Nuxt 4)

### 1. Styles

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: ['prismify-ui/style.css'],
});
```

Order in the **`css`** array matters: load your overrides **after** **`prismify-ui/style.css`** (see **`docs/theming.md`**).

### 2. Plugin (global registration)

```ts
// plugins/prismify-ui.ts
import PrismifyUI from 'prismify-ui';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrismifyUI);
});
```

In templates: `<PfButton>…</PfButton>`, `<PfIcon name="plus" size="md" />` — glyph names must come from **`PF_ICON_NAMES`** / **`PfIconName`**, sizes from **`PF_ICON_SIZES`** / **`PfIconSize`** (see the package and **`docs/theming.md`**).

Wrap the app root in **`PfApp`** as in the Vue section; use **`<NuxtPage />`** instead of **`RouterView`** where appropriate.

## Composables and helpers

Exported from **`prismify-ui`** (see **`src/index.ts`** for the full list):

| Export | Role |
| --- | --- |
| **`usePfApp`** | Read-only context from the nearest **`PfApp`** (locale, `dir`, `portalTarget`, tooltip/toaster handles, etc.). Outside **`PfApp`**, sensible defaults apply. |
| **`usePfToast`** | Imperative toasts (queue, variants) for use with **`PfToaster`**. |
| **`usePfContentSearch`** | Shared open/close state and search term for **`PfContentSearch`** / search UI. |
| **`usePfKbd`**, **`getPfKbdKey`**, **`PF_KBD_GLYPHS`** | Keyboard shortcut display in **`PfKbd`**. |
| **`mapEditorItems`**, **`mapEditorItem`** | Helpers for **`PfEditor`** toolbar / menu item mapping. |
| **`PfEditorImageUpload`** | Tiptap extension export for image upload in the editor pipeline. |

## Optional SCSS entry

Default tokens can also be pulled through **`prismify-ui/styles`** in a global SCSS pipeline; component styles remain only in **`prismify-ui/style.css`**. See **`docs/theming.md`**.

## Where is the component list?

There is no separate catalog page in **`docs/`**. Use **`src/index.ts`** (named exports) or **Storybook** (`npm run storybook` in the repo) as the source of truth.
