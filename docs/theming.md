# Theming and design tokens

Tokens are defined on `:root` in `style.css`. Override them **after** loading `prismify-ui/style.css`, in your global CSS or SCSS with nested `:root` / a theme selector.

## Examples

Custom brand:

```css
/* assets/css/prismify-overrides.css */
:root {
  --pf-color-primary: #7c3aed;
  --pf-color-primary-hover: #6d28d9;
}
```

Load this file **after** `prismify-ui/style.css` in `nuxt.config` (order in the `css` array matters) or import it from your main entry.

Dark theme (example):

```css
html.dark {
  --pf-color-surface: #0f172a;
  --pf-color-text: #f8fafc;
  /* other tokens as needed */
}
```

## Token list

Below is what each variable is for. See the package sources for current defaults: `src/styles/variables/*.scss` (wired via `src/styles/_variables.scss`).

### Colors (`variables/_colors.scss`)

| Variable                     | Purpose                       |
| ---------------------------- | ----------------------------- |
| `--pf-color-surface`         | Surface background            |
| `--pf-color-text`            | Primary text                  |
| `--pf-color-muted`           | Muted text                    |
| `--pf-color-primary`         | Primary accent                |
| `--pf-color-primary-hover`   | Primary accent on hover       |
| `--pf-color-secondary`       | Secondary accent              |
| `--pf-color-secondary-hover` | Secondary accent, hover       |
| `--pf-color-success`         | Success                       |
| `--pf-color-success-hover`   | Success, hover                |
| `--pf-color-info`            | Info                          |
| `--pf-color-info-hover`      | Info, hover                   |
| `--pf-color-warning`         | Warning                       |
| `--pf-color-warning-hover`   | Warning, hover                |
| `--pf-color-error`           | Error / destructive           |
| `--pf-color-error-hover`     | Error, hover                  |
| `--pf-color-neutral`         | Neutral accent                |
| `--pf-color-neutral-hover`   | Neutral accent, hover         |
| `--pf-border-color`          | Border color                  |
| `--pf-border-color-hover`    | Border on hover               |
| `--pf-skeleton-bg`           | `PfSkeleton` placeholder fill |

### Typography (`variables/_typography.scss`)

| Variable | Purpose |
| --- | --- |
| `--pf-font-sans` | UI font stack |
| `--pf-font-size-3xs`, `--pf-font-size-2xs`, `--pf-font-size-xs`, `--pf-font-size-sm`, `--pf-font-size-md`, `--pf-font-size-lg` | Text sizes |
| `--pf-font-weight-normal`, `--pf-font-weight-medium`, `--pf-font-weight-bold` | Weights |
| `--pf-line-height-sm`, `--pf-line-height-md`, `--pf-line-height-lg` | Line heights |

### Spacing and radii (`variables/_layout.scss`)

| Variable | Purpose |
| --- | --- |
| `--pf-radius-sm`, `--pf-radius-md` | Border radii |
| `--pf-header-height` | Header height (`PfHeader` — `height`; `PfMain` and `PfError` — `min-height: calc(100vh - var(--pf-header-height))`. Default `0px`; `PfHeader` has `min-height: 3.5rem`, so set the same value next to the header for correct `PfMain`, e.g. `3.5rem`) |
| `--pf-header-z-index` | Sticky `PfHeader` z-index |
| `--pf-header-overlay-z-index` | `PfHeader` mobile menu backdrop z-index |
| `--pf-header-panel-z-index` | `PfHeader` mobile menu panel z-index |
| `--pf-space-xs` … `--pf-space-xl` | Spacing (rem) |
| `--pf-container-max-width` | Max content width for `PfContainer` |
| `--pf-container-padding-x` | Horizontal padding for `PfContainer` (narrow viewport) |
| `--pf-container-padding-x-sm` | Horizontal padding for `PfContainer` from 640px |
| `--pf-container-padding-x-lg` | Horizontal padding for `PfContainer` from 1024px |
| `--pf-footer-section-padding-y`, `--pf-footer-section-padding-y-lg` | Vertical padding for `PfFooter` sections (`top` / `bottom`) |
| `--pf-footer-container-padding-y`, `--pf-footer-container-padding-y-lg` | Vertical padding for the main `PfContainer` row (`left` / default / `right`) |
| `--pf-footer-stack-gap` | Gap between columns when stacked vertically |
| `--pf-footer-inline-gap` | Gap inside `left` / `right` (icons, chips) |
| `--pf-footer-columns-gap`, `--pf-footer-columns-gap-lg` | `PfFooterColumns` grid gap on wide screens |
| `--pf-footer-columns-stack-gap`, `--pf-footer-columns-right-margin-top` | Vertical stack of regions and margin for `right` slot up to `xl` |
| `--pf-footer-columns-inner-gap` | Gap between link columns inside `center` |
| `--pf-footer-columns-label-font-size`, `--pf-footer-columns-label-font-weight`, `--pf-footer-columns-label-color` | Column heading |
| `--pf-footer-columns-list-gap` | List offset from heading and between items |
| `--pf-footer-columns-link-font-size`, `--pf-footer-columns-link-gap` | Link text and icon–label gap |
| `--pf-footer-columns-external-icon-size` | External link icon size in `PfFooterColumns` |
| `--pf-icon-size-3xs` … `--pf-icon-size-3xl` | Inline icon sizes (`PfIcon`, `size` prop) |
| `--pf-avatar-size-3xs` … `--pf-avatar-size-3xl` | `PfAvatar` circle width and height |
| `--pf-avatar-text-3xs` … `--pf-avatar-text-3xl` | Fallback text size (initials / short text) in `PfAvatar` |
| `--pf-chip-size-3xs` … `--pf-chip-size-3xl` | Min `PfChip` indicator size (dot without text) |
| `--pf-chip-font-3xs` … `--pf-chip-font-3xl` | `PfChip` label font size |
| `--pf-chip-pad-x-3xs` … `--pf-chip-pad-x-3xl` | Horizontal padding when `text` / `content` slot is non-empty |
| `--pf-chip-inset-offset` | Indicator inset from edge when `inset` |
| `--pf-checkbox-size-xs` … `--pf-checkbox-size-xl` | `PfCheckbox` indicator square width and height |
| `--pf-checkbox-container-height-xs` … `--pf-checkbox-container-height-xl` | Row height with indicator (`PfCheckbox`, alignment with label) |
| `--pf-checkbox-card-pad-xs` … `--pf-checkbox-card-pad-xl` | Root padding when `variant="card"` (`PfCheckbox`, `PfRadio` with `variant="card"`) |
| `--pf-checkbox-indicator-inset-xs` … `--pf-checkbox-indicator-inset-xl` | Icon inset from square edges in `PfCheckbox` |
| _(same `--pf-checkbox-size-*` and `--pf-checkbox-container-height-*`)_ | `PfRadio` circle indicator and row height (no separate `:root` tokens) |
| `--pf-switch-track-width-xs` … `--pf-switch-track-width-xl` | `PfSwitch` track width per size |
| `--pf-switch-track-height-xs` … `--pf-switch-track-height-xl` | `PfSwitch` track height |
| `--pf-switch-thumb-size-xs` … `--pf-switch-thumb-size-xl` | `PfSwitch` thumb diameter |
| `--pf-switch-inset-xs` … `--pf-switch-inset-xl` | Horizontal thumb inset = vertical gap: `(height − sum of vertical borders − thumb) / 2` in the track padding box |
| `--pf-switch-travel-xs` … `--pf-switch-travel-xl` | Travel when on: `track width − track height` (= inner width − inner height when borders match) |
| `--pf-switch-track-border-x` | Sum of opposite track borders (2px+2px; used in `--pf-switch-inset-*` and track `border`) |
| `--pf-kbd-height-sm`, `--pf-kbd-height-md`, `--pf-kbd-height-lg` | `PfKbd` height per `size` |
| `--pf-kbd-min-width-sm` … `--pf-kbd-min-width-lg` | Min `PfKbd` width |
| `--pf-kbd-font-size-sm` … `--pf-kbd-font-size-lg` | `PfKbd` label size |
| `--pf-kbd-pad-x` | Horizontal padding in `PfKbd` |
| `--pf-progress-thickness-2xs` … `--pf-progress-thickness-2xl` | `PfProgress` track thickness (horizontal — height, vertical — width) |
| `--pf-progress-track-bg` | `PfProgress` track background |
| `--pf-progress-vertical-min-height` | Min root height when `orientation="vertical"` without parent height |
| `--pf-slider-track-thickness-xs` … `--pf-slider-track-thickness-xl` | `PfSlider` track thickness (horizontal — height, vertical — width) |
| `--pf-slider-track-thickness` | Default `PfSlider` track thickness (matches `md` by default) |
| `--pf-slider-thumb-size-xs` … `--pf-slider-thumb-size-xl` | `PfSlider` thumb diameter |
| `--pf-slider-track-bg` | Inactive `PfSlider` track segment background |
| `--pf-slider-vertical-min-height` | Min `PfSlider` root height when `orientation="vertical"` without parent height |
| `--pf-color-picker-size-xs` … `--pf-color-picker-size-xl` | Saturation/value square side and hue track height in `PfColorPicker` |
| `--pf-color-picker-track-width-xs` … `--pf-color-picker-track-width-xl` | Vertical hue track width in `PfColorPicker` |
| `--pf-color-picker-thumb-size` | Thumb diameter on picker and track in `PfColorPicker` |
| `--pf-color-picker-gap` | Gap between square and track in `PfColorPicker` |
| `--pf-select-panel-z-index` | `PfSelect` dropdown panel layer in custom mode (`Teleport`) |
| `--pf-context-menu-z-index` | `PfContextMenu` panel layer (`Teleport` to `body`; default above custom `PfSelect` panel) |
| `--pf-context-menu-backdrop-z-index` | Backdrop when `modal` (below panel) |
| `--pf-context-menu-min-width`, `--pf-context-menu-max-height`, `--pf-context-menu-padding`, `--pf-context-menu-gap`, `--pf-context-menu-submenu-gap` | Panel and nested submenu sizing and spacing |
| `--pf-context-menu-surface`, `--pf-context-menu-border`, `--pf-context-menu-text`, `--pf-context-menu-muted`, `--pf-context-menu-item-hover`, `--pf-context-menu-radius`, `--pf-context-menu-shadow` | Background, stroke, type, item hover/focus background, panel radius and shadow |
| `--pf-context-menu-*` | Same tokens power `PfDropdownMenu` (content/groups/submenu/overlay) so dropdown and context menu look consistent |
| `--pf-editor-surface`, `--pf-editor-text`, `--pf-editor-muted`, `--pf-editor-border`, `--pf-editor-chrome-border`, `--pf-editor-radius`, `--pf-editor-font-size`, `--pf-editor-line-height` | Base colors and type; `--pf-editor-border` — inner bits (code, etc.), `--pf-editor-chrome-border` — frame around `PfEditor` |
| `--pf-editor-min-height`, `--pf-editor-padding-x`, `--pf-editor-padding-y` | `PfEditor` editing area geometry |
| `--pf-editor-toolbar-gap`, `--pf-editor-toolbar-surface`, `--pf-editor-toolbar-shadow`, `--pf-editor-menu-z-index`, `--pf-editor-menu-offset-x`, `--pf-editor-menu-offset-y`, `--pf-editor-menu-min-width`, `--pf-editor-menu-max-width`, `--pf-editor-menu-max-height`, `--pf-editor-menu-surface`, `--pf-editor-menu-shadow` | Toolbar and popovers (`PfEditorToolbar`, `PfEditorSuggestionMenu`, `PfEditorMentionMenu`, `PfEditorEmojiMenu`, `PfEditorDragHandle`) |
| `--pf-tooltip-z-index`, `--pf-tooltip-max-width`, `--pf-tooltip-min-height`, `--pf-tooltip-padding-x`, `--pf-tooltip-padding-y`, `--pf-tooltip-gap`, `--pf-tooltip-radius`, `--pf-tooltip-font-size` | Base `PfTooltip` geometry and type |
| `--pf-tooltip-surface`, `--pf-tooltip-border`, `--pf-tooltip-text`, `--pf-tooltip-shadow` | `PfTooltip` surface, stroke, text color, shadow |
| `--pf-modal-z-index`, `--pf-modal-overlay-z-index`, `--pf-modal-content-z-index` | `PfModal` layers (stack, backdrop, content) |
| `--pf-modal-max-width`, `--pf-modal-max-height`, `--pf-modal-radius`, `--pf-modal-shadow` | `PfModal` window size and look |
| `--pf-modal-overlay-bg`, `--pf-modal-viewport-padding`, `--pf-modal-padding-x`, `--pf-modal-padding-y`, `--pf-modal-header-padding-y`, `--pf-modal-footer-padding-y` | `PfModal` backdrop and inner/outer padding |
| `--pf-modal-enter-shift` | Initial `PfModal` panel shift for enter/leave animation |
| `--pf-toast-z-index`, `--pf-toast-width`, `--pf-toast-radius`, `--pf-toast-enter-shift`, `--pf-toast-pulse-duration` | Layer, width, radius, and motion for `PfToast` / `PfToaster` |
| `--pf-toast-surface`, `--pf-toast-border`, `--pf-toast-fg`, `--pf-toast-muted`, `--pf-toast-shadow` | Toast colors and shadow |

### Footer link columns (`variables/_footerColumns.scss`)

| Variable | Purpose |
| --- | --- |
| `--pf-footer-columns-gap`, `--pf-footer-columns-gap-lg` | Root grid gap on wide screens (`min-width: 80rem`) |
| `--pf-footer-columns-stack-gap`, `--pf-footer-columns-right-margin-top` | Vertical stack on narrow screens; `right` block margin up to `xl` |
| `--pf-footer-columns-inner-gap` | Gap between link columns inside `center` |
| `--pf-footer-columns-label-font-size`, `--pf-footer-columns-label-font-weight`, `--pf-footer-columns-label-color` | Column heading |
| `--pf-footer-columns-list-gap` | List offset from heading and between items |
| `--pf-footer-columns-link-font-size`, `--pf-footer-columns-link-gap` | Link size and icon–label gap |
| `--pf-footer-columns-external-icon-size` | External link icon size (`arrowUpRight`) |

### Breadcrumbs (`variables/_breadcrumb.scss`)

| Variable | Purpose |
| --- | --- |
| `--pf-breadcrumb-gap` | Gap between items and separator in the list |
| `--pf-breadcrumb-font-size`, `--pf-breadcrumb-font-weight`, `--pf-breadcrumb-font-weight-current` | Link size and weight; weight of current (last) item |
| `--pf-breadcrumb-color-muted`, `--pf-breadcrumb-color-current` | Default and current item colors |
| `--pf-breadcrumb-link-gap` | Gap between icon/avatar and label in an item |
| `--pf-breadcrumb-separator-color` | Separator icon color (defaults to muted text) |

### Table (`variables/_table.scss`)

| Variable | Purpose |
| --- | --- |
| `--pf-table-border-color` | Cell and row borders |
| `--pf-table-cell-padding-x`, `--pf-table-cell-padding-y` | `th` / `td` padding |
| `--pf-table-header-font-size`, `--pf-table-header-font-weight` | Column headers |
| `--pf-table-cell-font-size` | Cell text |
| `--pf-table-sticky-bg` | Sticky `thead` / `tfoot` and pinned column background |
| `--pf-table-sticky-z-index`, `--pf-table-pin-z-index` | Layers for sticky regions and column pinning |
| `--pf-table-row-hover-bg`, `--pf-table-row-selected-bg` | Row background on hover (with `selectable` / `onSelect`) and when selected |
| `--pf-table-loading-line-height`, `--pf-table-loading-line-duration`, `--pf-table-loading-line-easing` | Loading indicator under header when `loading` |

**PfTable** is built on `@tanstack/vue-table` (`useVueTable`, `FlexRender`). Peer: `@tanstack/vue-table`. Virtualization (`virtualize`) is not implemented in the component — use TanStack Virtual in the app if needed.

### Accordion (`variables/_accordion.scss`)

| Variable | Purpose |
| --- | --- |
| `--pf-accordion-item-border` | Bottom border between `PfAccordion` items |
| `--pf-accordion-trigger-padding-y` | Vertical padding on the trigger button |
| `--pf-accordion-trigger-gap` | Gap between leading icon, label, and trailing icon |
| `--pf-accordion-label-font-size`, `--pf-accordion-label-font-weight` | Trigger label |
| `--pf-accordion-body-font-size`, `--pf-accordion-body-padding-bottom` | Panel body text (`body` slot and `content` string) |
| `--pf-accordion-panel-duration`, `--pf-accordion-panel-easing` | Panel height animation (on by default; `unmount-on-hide="true"` disables it by removing content from the DOM when closed) |
| `--pf-accordion-trailing-rotate-duration`, `--pf-accordion-trailing-rotate-easing` | Trailing icon rotation when opening |

### Navigation menu (`variables/_navigationMenu.scss`)

| Variable | Purpose |
| --- | --- |
| `--pf-navigation-menu-gap`, `--pf-navigation-menu-group-gap` | Gaps between items and groups (`PfNavigationMenu`) |
| `--pf-navigation-menu-bar-padding-y` | Vertical padding on the horizontal bar |
| `--pf-navigation-menu-link-padding-x`, `--pf-navigation-menu-link-padding-y` | Trigger and link padding |
| `--pf-navigation-menu-link-radius` | Trigger and child link radii |
| `--pf-navigation-menu-item-hover-bg` | Item background on hover (top level and children) |
| `--pf-navigation-menu-dropdown-z-index` | Shared submenu panel layer (horizontal) |
| `--pf-navigation-menu-dropdown-min-width`, `--pf-navigation-menu-dropdown-max-height` | Submenu panel size |
| `--pf-navigation-menu-dropdown-padding` | Padding around submenu content (horizontal: `slideShell`, not the shadow wrapper) |
| `--pf-navigation-menu-child-gap` | Gap in the child item grid |
| `--pf-navigation-menu-child-link-padding-x`, `--pf-navigation-menu-child-link-padding-y` | Child row padding |
| `--pf-navigation-menu-child-link-gap` | Gap between icon and text in a child row |
| `--pf-navigation-menu-viewport-margin-top` | Gap between trigger bar and shared panel |
| `--pf-navigation-menu-viewport-duration`, `--pf-navigation-menu-viewport-easing` | Duration and easing (including first-open `fade`) |
| `--pf-navigation-menu-dropdown-plank-duration`, `--pf-navigation-menu-dropdown-plank-scale`, `--pf-navigation-menu-dropdown-plank-translate-y` | Horizontal plank show/hide (opacity + scale + Y shift) |
| `--pf-navigation-menu-slide-duration` | Submenu content swap (opacity + slight shift) and panel height animation |
| `--pf-navigation-menu-vertical-group-gap` | Gap between blocks in vertical menu |
| `--pf-navigation-menu-section-label-padding-y` | Vertical padding for section label (`type: label`) |
| `--pf-navigation-menu-collapsed-width` | Sidebar width in `collapsed` + `vertical` |
| `--pf-navigation-menu-indicator-size` | Highlight bar thickness (`highlight`) |

### Tabs (`variables/_tabs.scss`)

| Variable | Purpose |
| --- | --- |
| `--pf-tabs-gap` | Gap between tab list and content / in toolbar |
| `--pf-tabs-list-gap`, `--pf-tabs-list-padding`, `--pf-tabs-list-radius` | Tab list layout and background (`variant="pill"`) |
| `--pf-tabs-list-bg-elevated` | Pill “substrate” background |
| `--pf-tabs-link-border-color` | Border for `variant="link"` |
| `--pf-tabs-indicator-duration`, `--pf-tabs-indicator-easing` | Indicator animation (underline / capsule) |
| `--pf-tabs-indicator-shadow` | Pill indicator shadow |
| `--pf-tabs-content-padding-top` | Panel content offset from tab list |

### Tree (`variables/_tree.scss`)

| Variable | Purpose |
| --- | --- |
| `--pf-tree-indent` | Nesting indent when `nested=false` (flat list) |
| `--pf-tree-list-child-margin-start`, `--pf-tree-list-child-border` | Inset and left border for nested list when `nested=true` |
| `--pf-tree-row-gap` | Gap between expand button, icon, and label |
| `--pf-tree-row-pad-x` | Horizontal row padding (`pfTree__row`; set with `pfTree_size_*` per tree size) |
| `--pf-tree-link-pad-x`, `--pf-tree-link-pad-y`, `--pf-tree-font-size`, `--pf-tree-icon-size` | Row sizing (default `md`; overridden by `pfTree_size_*`) |
| `--pf-tree-chevron-rotate-duration`, `--pf-tree-chevron-rotate-easing` | Trailing expand chevron rotation |
| `--pf-tree-expand-duration`, `--pf-tree-expand-easing` | Nested list expand/collapse easing (`nested=true`) |
| `--pf-tree-transition-duration`, `--pf-tree-transition-easing` | Row, background, and color transitions |
| `--pf-tree-link-color`, `--pf-tree-leading-color`, `--pf-tree-chevron-color` | Text, leading icon, right chevron |
| `--pf-tree-row-hover-bg` | Row background on hover |

### Empty state (`variables/_empty.scss`)

| Variable | Purpose |
| --- | --- |
| `--pf-empty-gap` | Vertical gap between main blocks in `PfEmpty` |
| `--pf-empty-header-gap` | Gap between title and description in header |
| `--pf-empty-actions-gap` | Gap between buttons in `actions` |
| `--pf-empty-max-text-width` | Max width for text columns (title, description, body, footer) |
| `--pf-empty-icon-bubble-bg` | Circle under icon (overridden in `variant="solid"`) |

### Timeline (`variables/_timeline.scss`)

| Variable | Purpose |
| --- | --- |
| `--pf-timeline-root-gap` | Gap between root and rows (`flex-gap` on `PfTimeline`) |
| `--pf-timeline-item-gap` | Gap between indicator column and text |
| `--pf-timeline-separator-thickness` | Line thickness between items |
| `--pf-timeline-separator-pending-bg` | Segment background in “pending” (incomplete) state |

### Stepper (`variables/_stepper.scss`)

| Variable | Purpose |
| --- | --- |
| `--pf-stepper-root-gap` | Vertical gap between step row and content panel (`PfStepper`) |
| `--pf-stepper-header-gap` | Gap between items in stepper header |
| `--pf-stepper-item-gap` | Gap between step indicator and label |
| `--pf-stepper-separator-thickness` | Line thickness between steps |
| `--pf-stepper-line-gap` | Small gap from line to circle edge (horizontal and vertical) |
| `--pf-stepper-separator-pending-bg` | Line segment background in “pending” state |
| `--pf-stepper-content-padding-top` | Top padding on content panel (`content` slot / item `content`) |

### Effects (`variables/_effects.scss`)

| Variable            | Purpose                                     |
| ------------------- | ------------------------------------------- |
| `--pf-focus-ring`   | Focus ring (uses `var(--pf-color-primary)`) |
| `--pf-stroke-width` | Stroke thickness                            |

### Animation (`variables/_animation.scss`)

| Variable | Purpose |
| --- | --- |
| `--pf-animation-duration` | Duration |
| `--pf-animation-easing` | Easing curve |
| `--pf-skeleton-pulse-duration` | `PfSkeleton` pulse cycle duration |
| `--pf-skeleton-pulse-mid-opacity` | Mid-cycle opacity for `PfSkeleton` pulse |
| `--pf-progress-indeterminate-duration` | Indeterminate `PfProgress` cycle duration |
| `--pf-progress-indeterminate-easing` | Indeterminate `PfProgress` easing |
| `--pf-switch-move-duration` | Thumb travel and track background change duration for `PfSwitch` |
| `--pf-switch-move-easing` | Thumb travel easing for `PfSwitch` |
| `--pf-switch-squish-duration` | Thumb squash duration when toggling `PfSwitch` |
| `--pf-switch-squish-easing` | Thumb squash easing for `PfSwitch` |
| `--pf-input-char-appear-duration` | Character appear duration on input in `PfInput`, `PfTextarea`, and `PfPinInput` (`animatedText`) |
| `--pf-input-char-appear-easing` | Character appear easing in `PfInput` / `PfTextarea` / `PfPinInput` |
| `--pf-input-char-fall-duration` | Character “fall” duration on delete in `PfInput` / `PfTextarea` / `PfPinInput` |
| `--pf-input-char-fall-easing` | Character “fall” easing in `PfInput` / `PfTextarea` / `PfPinInput` |
| `--pf-textarea-resizer-color` | Decorative resize grip color for `PfTextarea` (without `autoresize`; set on `.pfTextarea` root, default `var(--pf-input-muted)`; fill via `mask-image`) |

### Marquee (`variables/_marquee.scss`)

| Variable | Purpose |
| --- | --- |
| `--pf-marquee-duration` | One animation cycle duration for `PfMarquee` |
| `--pf-marquee-gap` | Gap between content copies on the track and between items inside a segment |
| `--pf-marquee-overlay-z-index` | Gradient edge overlay layer when `overlay` |

### Dashboard (`variables/_dashboard.scss`)

| Variable | Purpose |
| --- | --- |
| `--pf-dashboard-header-height` | Base height for `PfDashboardNavbar` and `PfDashboardSidebar` header |
| `--pf-dashboard-sidebar-pad-x`, `--pf-dashboard-sidebar-pad-y` | Inner padding for desktop `PfDashboardSidebar` body/footer |
| `--pf-dashboard-sidebar-mobile-pad-x`, `--pf-dashboard-sidebar-mobile-pad-y` | Inner padding for mobile `PfDashboardSidebar` header/body/footer content |
| `--pf-dashboard-panel-pad-x`, `--pf-dashboard-panel-pad-y` | Inner padding for `PfDashboardPanel` body and `PfDashboardNavbar`/`PfDashboardToolbar` |
| `--pf-dashboard-search-max-width` | Max width for `PfDashboardSearch` modal container |

### Content components (`PfContentNavigation`, `PfContentToc`, `PfContentSurround`, `PfContentSearch`, `PfContentSearchButton`)

No separate `:root` tokens were added for Content components. They reuse existing variables:

- colors and states: `--pf-color-*`, `--pf-border-color`, `--pf-color-muted`;
- typography and spacing: `--pf-font-*`, `--pf-line-height-*`, `--pf-space-*`, `--pf-radius-*`;
- focus and motion: `--pf-focus-ring`, `--pf-animation-duration`, `--pf-animation-easing`;
- search overlay: `PfModal` tokens (`--pf-modal-*`) and `PfKbd` (`--pf-kbd-*`).

For deeper customization, override `ui` props on the components and/or the shared tokens above.

## Optional: SCSS entry `prismify-ui/styles`

The `prismify-ui/styles` export is SCSS that pulls in the same `:root` block with `--pf-*`. It does **not** replace `style.css`: component styles stay only in **`prismify-ui/style.css`**.

Use it when you bundle one global SCSS chain and want default tokens in that pipeline. Avoid duplicate `:root` blocks unless needed (one token source plus your overrides is enough).
