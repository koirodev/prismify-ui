# prismify-ui v0.1.0-alpha.9

[![Tests](https://github.com/koirodev/prismify-ui/actions/workflows/test.yml/badge.svg)](https://github.com/koirodev/prismify-ui/actions/workflows/test.yml) [![Build](https://github.com/koirodev/prismify-ui/actions/workflows/build.yml/badge.svg)](https://github.com/koirodev/prismify-ui/actions/workflows/build.yml)

Vue 3 components aimed at **admin UIs**. Built primarily for personal use, published on npm under **MIT**.

**Source:** [github.com/koirodev/prismify-ui](https://github.com/koirodev/prismify-ui)

Styles live in components as **SCSS**; theming uses **`--pf-*`** CSS variables. **No Tailwind**. Works with **Nuxt 4** and plain **Vue 3**.

## What’s included

`Pf*` prefix: forms, data table, modals, menus, navigation, layout (`PfApp`, etc.), dashboard, rich-text editor. Token reference: **`docs/theming.md`**. Build: Vite → **`dist/`** (JS, types, **`style.css`**). Storybook and Vitest live in this repo.

**Docs:** [`docs/`](./docs/README.md) — [installation](./docs/installation.md) (peers, Vue/Vite, Nuxt, composables), [theming](./docs/theming.md), [library development](./docs/library-development.md). **Changelog:** [CHANGELOG.md](./CHANGELOG.md).

## Dependencies

There are **no runtime `dependencies`** — nothing is pulled in transitively. Everything required at runtime is **`peerDependencies`**; install what you need in your app.

| Package | Used for |
| --- | --- |
| `vue` | All components |
| `vue-router` | `PfLink` |
| `@internationalized/date` | `PfCalendar` |
| `@internationalized/number` | `PfInputNumber` |
| `@tanstack/vue-table` | `PfTable` |
| `@tiptap/*` | `PfEditor` and related (full list in **`package.json` → `peerDependencies`**) |

Vite, TypeScript, ESLint, Storybook, and the rest are **devDependencies** for building the library only.

## License

[MIT](LICENSE)

## Code of conduct

[Contributor Covenant 2.1](CODE_OF_CONDUCT.md)
