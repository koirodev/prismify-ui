# Library development

## Component categories

Sources live under **`src/components/<category>/Pf…/`** (e.g. **`src/components/element/PfButton/`**). In **Storybook**, story titles are **`'<Category>/<Name>'`** (e.g. **`Element/PfButton`**).

Storybook also lists **Page**, **Color Mode**, and **i18n** in the sidebar (see **`.storybook/preview.ts`** → **`storySort`**). Those sections are **only** placeholder **`…/Overview`** stories in **`src/stories/`** — there are **no** matching folders under **`src/components/page/`** (or **`color-mode/`**, **`i18n/`**) yet.

| Category | Purpose |
| --- | --- |
| **Element** | Buttons, icons, badges, avatars, cards, alerts, etc. |
| **Layout** | **`PfApp`**, header/main/footer, container, error layout |
| **Form** | Inputs, selects, calendar, validation, field groups |
| **Data** | Tables, lists, accordion, empty states, scroll area, tree, … |
| **Navigation** | Tabs, breadcrumbs, pagination, **`PfLink`**, content nav |
| **Overlay** | Modals, drawers, menus, tooltips, toasts |
| **Dashboard** | Dashboard shell, sidebar, panels, toolbar |
| **Editor** | **`PfEditor`** and related pieces |

| Command | Purpose |
| --- | --- |
| `npm run build` | Library build (`dist/`, `style.css`) |
| `npm test` | Vitest |
| `npm run lint` / `npm run lint:fix` | ESLint |
| `npm run storybook` | Docs and visual UI checks |
| `npm run build-storybook` | Static Storybook build |
| `npm run playground` | Vite app in **`playground/`** (dev against the lib) |
| `npm run icons:build` | Regenerate **`PfIcon/paths.ts`** from **`src/icons/svg/*.svg`** (runs automatically before **`build`**) |

## Icons (`PfIcon`)

Sources are individual files in **`src/icons/svg/`** (file **`chevron-down.svg`** yields glyph name **`chevronDown`**). After adding or editing SVGs, run **`npm run icons:build`** or simply **`npm run build`**: the script regenerates **`src/components/element/PfIcon/paths.ts`**. Bulk import from Figma is still **`node scripts/extract-pf-icons.mjs`**. Icon name aliases for older sets (Heroicons, etc.) are **not** supported unless backward compatibility is explicitly required.

## Versioning (semver + alpha)

- Format: **`MAJOR.MINOR.PATCH`** and prereleases **`0.1.0-alpha.0`**, **`0.1.0-alpha.1`**, …
- Bump prerelease without git tag: **`npm run version:alpha`** (runs **`npm version prerelease --preid=alpha --no-git-tag-version`**)
- Publish with **`alpha`** tag: **`npm run release:alpha`** (after **`npm login`**)

Stable releases: **`npm publish`** without **`--tag alpha`** once the API is stable.

### CI (lint, test, build)

Workflows **`.github/workflows/test.yml`** (lint + Vitest) and **`.github/workflows/build.yml`** (Vite library build) run on **push to `main`** and on **pull requests**. Each has its own **`concurrency`** group so a new push cancels only the previous run of that workflow. Both use **`actions/setup-node`** with **`cache: npm`** (keyed by **`package-lock.json`**) so dependencies are not fully re-downloaded when the lockfile is unchanged.

### Publish from GitHub Actions

Workflow **`.github/workflows/publish-npm.yml`** runs on **push to `main`**. It publishes to npm **only when the `version` field in `package.json` changes** in that push (so ordinary commits do not hit the registry). Prereleases whose version contains **`alpha`**, **`beta`**, or **`rc`** are published with dist-tag **`alpha`**; stable versions use the default **`latest`** tag.

1. In the npm account: **Access Tokens** → create an **Automation** (or **Publish**) token.
2. In the GitHub repo: **Settings → Secrets and variables → Actions** → add **`NPM_TOKEN`** with that token.

On each release, add a section to **`CHANGELOG.md`** (date, semver) and summarize user-visible changes (Added / Changed / Fixed / Removed as appropriate).

## Repository documentation

User-facing docs live in **`docs/`**. When the public API changes (style entry, tokens, exports), update the matching files under **`docs/`**.
