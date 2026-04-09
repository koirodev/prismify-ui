# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0-alpha.5] - 2026-04-09

### Changed

- **Peer dependency** **`vue-router`** raised from **^4** to **^5** (install **Vue Router 5** if you use **`PfLink`** or other router-aware components). The APIs used in the library (**`RouterLink`**, **`useRouter`**, **`useRoute`**, route location types) stay compatible with Vue Router 5; no source changes were required in **prismify-ui**.
- **Dev dependency** **`vue-router`** updated to **^5.0.4** for tests, Storybook, and the playground.
- **`docs/installation.md`**: peer table documents **`vue-router` ^5**.

## [0.1.0-alpha.4] - 2026-04-09

### Added

- Initial **alpha** publish of **prismify-ui**: Vue 3 component library for admin UIs, SCSS in SFCs, theming via **`--pf-*`** CSS variables (no Tailwind in the library), compatible with **Nuxt 4** and plain Vue 3.
- **`Pf*`** components across element, form, layout, data, navigation, overlay, dashboard, and editor categories; see **`src/index.ts`** and Storybook for the full list.
- Global styles and tokens: **`prismify-ui/style.css`** and optional **`prismify-ui/styles`** SCSS entry.
- **`prismifyPlugin`** for global registration; tree-shakeable named exports.
- Documentation in **`docs/`** (installation, theming, library development).
- **`llms.txt`** for AI-assisted development (also copied to **`dist/`** on build).
- Peer-based optional stacks: **`vue-router`**, **`@internationalized/date`**, **`@internationalized/number`**, **`@tanstack/vue-table`**, **`@tiptap/*`** for **`PfLink`**, **`PfCalendar`**, **`PfInputNumber`**, **`PfTable`**, **`PfEditor`**, etc.

After you publish git tags, you can add comparison links at the bottom of this file (see [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)).
