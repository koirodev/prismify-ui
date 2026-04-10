# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0-alpha.13] - 2026-04-10

### Added

- **PfNavigationMenu**: added **`collapsedSquare`** prop to support square trigger/link controls in collapsed vertical navigation.

### Fixed

- **PfNavigationMenu (labels)**: empty labels are no longer rendered for section rows, top-level items, and child items.
- **PfNavigationMenu (vertical child list layout)**: when menu orientation is vertical, child lists now force vertical orientation so submenu items are no longer laid out as horizontal two-column content.
- **PfNavigationMenu (collapsed vertical alignment)**: improved collapsed vertical link/trigger sizing and centering so icon-only items are no longer visually shifted to the right.
- **PfDashboardSidebar (collapsed spacing)**: collapsed desktop sidebar now removes horizontal paddings in header/body/footer and centers header/footer content for cleaner compact alignment.
- **Global styles**: applied **`box-sizing: border-box`** to all elements (including pseudo-elements) from the shared style entry for consistent sizing across Prismify components.

## [0.1.0-alpha.12] - 2026-04-10

### Added

- **PfDashboardSidebar**: added **`mobileMenuOrientation`** (`top`/`bottom`/`left`/`right`) to control mobile drawer direction independently from desktop sidebar side; default is now **`bottom`**.
- **Dashboard theme tokens**: added **`--pf-dashboard-sidebar-mobile-pad-x`** and **`--pf-dashboard-sidebar-mobile-pad-y`** for mobile sidebar spacing overrides and documented them in **`docs/theming.md`**.

### Fixed

- **PfDashboardSidebar (mobile drawer layout)**: removed unintended horizontal offset for bottom/top mobile drawer by applying slideover inset only to side directions (**`left`**/**`right`**), disabling background scale for this drawer, and removing extra nested container paddings.
- **PfDashboardSidebar (mobile content spacing)**: removed inner mobile paddings in header/body/footer wrappers so sidebar slot content aligns to container edges without right shift.
- **PfToaster (mobile right positions)**: on mobile viewports, **`top-right`** and **`bottom-right`** stacks now align like centered stacks to avoid visual right drift.
- **PfToast (overflow width)**: added **`box-sizing: border-box`** so toast width includes padding and no longer overflows its container on desktop/mobile.

## [0.1.0-alpha.11] - 2026-04-10

### Fixed

- **Lint / Nuxt module files**: ESLint no longer fails on root Nuxt entry files by covering **`nuxt.ts`** in the lint TypeScript project, ignoring **`nuxt.d.ts`** for typed parsing, and aligning formatting in **`nuxt.ts`**.

- **Theme color tokens**: removed hardcoded and fallback color values from shared style variables and component shadows so surfaces, borders, text, focus ring, and elevation now consistently resolve through **`src/styles/variables/_colors.scss`** tokens (updated **`_toast.scss`**, **`_contextMenu.scss`**, **`_tooltip.scss`**, **`_effects.scss`**, **`_navigationMenu.scss`**, **`_tabs.scss`**, and **`PfSwitch`** styles).

## [0.1.0-alpha.10] - 2026-04-10

### Added

- **Playground**: added a dashboard shell in **`playground/App.vue`** (group, sidebar, panel, navbar) for local dashboard behavior checks outside Storybook.
- **Nuxt module**: added **`prismify-ui/nuxt`** for direct Nuxt integration with:
  - automatic **`Pf*`** component registration,
  - composable auto-imports (**`usePfApp`**, **`usePfToast`**, **`usePfContentSearch`**, **`usePfKbd`**),
  - automatic **`prismify-ui/style.css`** injection,
  - optional plugin install via **`prismifyUI.plugin`**.
- **Nuxt entry export** in **`package.json`** (**`./nuxt`**) and Nuxt module typing via **`nuxt.d.ts`**.
- **`docs/installation.md`**: Nuxt 4 setup now documents module-based integration and module options.

### Fixed

- **PfDashboardSidebar**: restoring from persisted state now clamps invalid sizes and preserves expanded width while collapsed, so sidebars can be collapsed and expanded reliably.
- **PfDashboardSidebarCollapse**: reads sidebar API at interaction time instead of caching a non-reactive lookup, so collapse/expand toggling stays functional after mount timing changes.
- **PfDashboardResizeHandle**: improved desktop handle visibility with an explicit visual divider while keeping a wider pointer hit area for resizing.

## [0.1.0-alpha.9] - 2026-04-10

### Fixed

- **PfDrawer**: SSR-safe use of **`document`** and **`window`** (scroll lock, scale wrapper query, global listeners, deferred **`setTimeout`**) so server renders (e.g. **Nuxt**) do not throw **`ReferenceError`** or return HTTP 500 when watchers run without a DOM.
- **PfDashboardSidebarCollapse**: toggling no longer calls **`toggleCollapsed()`** (which was a no-op unless **`PfDashboardSidebar`** had **`collapsible`**); it now calls **`setCollapsed()`** so the control works with default sidebar props. Default **icon-only** styling (**`iconOnly`**, **`aria-label`**) for a square, centered icon button.

## [0.1.0-alpha.8] - 2026-04-10

### Fixed

- **PfDashboardSidebar**: template used an invalid tag (**`div-d-c`**) where a **`div`** was intended.
- **PfDashboardSidebar**: removed stray text (**`-m-d -t-s`**) accidentally left in the markup.

## [0.1.0-alpha.7] - 2026-04-10

### Fixed

- **PfInput**, **PfTextarea**, **PfPinInput**: WebKit autofill text color (**`-webkit-text-fill-color`**) now uses **`var(--pf-input-text)`** so filled fields match the themed input text token (instead of **`--input-color`**).

## [0.1.0-alpha.6] - 2026-04-10

### Fixed

- **PfInput**, **PfTextarea**, **PfPinInput**: **WebKit** autofill (**`:-webkit-autofill`**) no longer shows the default yellow highlight: **`box-shadow`** cleared, backgrounds set to transparent, text color follows **`var(--input-color)`** via **`-webkit-text-fill-color`**, and a long **`background-color`** **transition** keeps Chrome from repainting the autofill background over the themed field.

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
