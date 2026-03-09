# AGENTS.md

## Scope
- Repository area: `hero-gym-web` (Angular frontend).
- Git root also contains `backend_hero`; do not assume backend and frontend share tooling.
- Prefer changes that fit current Angular standalone-component architecture.

## Rule Sources Checked
- `.cursor/rules/`: not found.
- `.cursorrules`: not found.
- `.github/copilot-instructions.md`: not found.
- If any of these files are added later, treat them as high-priority instructions.

## Stack Snapshot
- Angular CLI 21, TypeScript 5.9, RxJS 7, Karma + Jasmine.
- Tailwind CSS v4 via `@tailwindcss/postcss`.
- Charting and PDF libs: `ng2-charts`, `chart.js`, `jspdf`, `jspdf-autotable`.
- Icon system: `lucide-angular` with icons provided in `src/app/app.config.ts`.

## Important Paths
- App bootstrap: `src/main.ts`.
- Global providers/icons: `src/app/app.config.ts`.
- Routes: `src/app/app.routes.ts` and `src/app/pages/clientes/cliente.routes.ts`.
- Core services/guards/interceptors: `src/app/core`.
- Shared UI: `src/app/shared`.
- Environment config: `src/environments/environment*.ts`.

## Install and Run
```bash
npm ci
npm start
```
- Dev server default URL: `http://localhost:4200/`.

## Build Commands
```bash
npm run build
npm run build -- --configuration development
npm run watch
```
- `npm run build` uses production config and currently fails on bundle budget (1 MB limit).
- Use development build for fast compile validation while iterating.

## Lint and Static Checks
```bash
npx ng lint
npx tsc -p tsconfig.app.json --noEmit
npx tsc -p tsconfig.spec.json --noEmit
```
- `ng lint` is currently not configured (`Cannot find "lint" target`).
- For now, treat `tsc --noEmit` + test run as the practical lint gate.

## Test Commands
```bash
npm test
npm test -- --watch=false --browsers=ChromeHeadless
npm test -- --watch=false --browsers=ChromeHeadless --code-coverage
npx ng test --watch=false --browsers=ChromeHeadless --include=src/app/shared/loaders/skeleton-table/skeleton-table.component.spec.ts
npx ng test --watch=false --browsers=ChromeHeadless --include=src/app/pages/clientes
```
- `npm test` runs Karma in watch mode.
- Use `--watch=false` for CI/non-interactive runs.
- Use `--include=<spec-file-or-folder>` to run a single test file or a spec directory.

## Current Test Baseline (as of this guide)
- Full suite is not fully green (multiple spec setup issues).
- Frequent failures come from missing test providers (e.g., `ActivatedRoute`) and Lucide icon provisioning.
- If your change is unrelated, run targeted specs and report untouched baseline failures separately.

## Formatting Conventions
- Use 2-space indentation (`.editorconfig`).
- Use UTF-8, trim trailing whitespace, and keep final newline.
- Prefer single quotes in TypeScript.
- Keep files in kebab-case with Angular suffixes (`*.component.ts`, `*.service.ts`, `*.guard.ts`).
- Keep class/type names in PascalCase.
- Keep variables/functions/properties in camelCase.

## Import Conventions
- Group imports in this order:
  1) Angular/framework imports
  2) third-party packages
  3) local app imports (relative paths)
- Keep one import section per group with a blank line between groups.
- Avoid deep reordering churn in untouched files; apply ordering mainly to files you edit.
- Prefer existing relative import style; path aliases are not configured.

## TypeScript and Types
- Project runs with `strict: true`; do not disable strict compiler options.
- Prefer explicit interfaces/types for API payloads and component state.
- Avoid new `any`; use `unknown` + narrowing if type is unclear.
- Keep DTO-like types close to services when scope is local.
- Convert numeric user input with `Number(...)` and validate `isNaN(...)` where needed.

## Angular Component Patterns
- Prefer standalone components (`standalone: true`) and local `imports` arrays.
- Keep feature pages under `src/app/pages/<feature>`.
- Keep reusable cross-feature UI in `src/app/shared`.
- Keep data access in services under `src/app/core/services`, not in templates.
- Prefer `@Input()`/`@Output()` for parent-child communication.
- Keep lifecycle hooks minimal; move heavy logic into private methods.

## Templates and Styling
- Tailwind utility classes are the primary styling approach.
- Global utility/component classes live in `src/styles.css`.
- Many templates already use Angular control flow blocks (`@if`, `@for`); follow local file style.
- Keep templates readable: avoid huge inline logic and repeated long expressions.
- Preserve Spanish UI/domain language unless feature requirements say otherwise.

## Services and HTTP
- Prefer `environment.apiUrl` for new endpoints; some legacy services still hardcode localhost.
- Return typed `Observable<T>` from service methods whenever practical.
- Build query params with `HttpParams` for pagination/filter endpoints.
- Keep transformation logic (`map`, `tap`) in service layer when it is data-shaping.
- Avoid duplicating endpoint strings; centralize constants per service.

## Error Handling and Logging
- Handle both `next` and `error` branches for user-triggered HTTP actions.
- Surface user-safe messages in UI state (`errorMessage`) instead of raw errors.
- Normalize backend message shapes (`string | string[]`) before showing.
- Use `console.error`/`console.warn` for diagnostics; avoid noisy logs in stable code paths.
- Never swallow errors silently unless there is an explicit UX reason.

## Naming and Domain Conventions
- Keep route and role identifiers consistent with backend contracts (`ADMIN`, `RECEPCIONISTA`, `CLIENTE`).
- Keep component selectors with `app-` prefix.
- Keep event handler names action-oriented (`onGuardarX`, `onCancelY`, `cargarZ`).
- Keep boolean flags readable (`isLoading`, `mostrarModal`, `toastVisible`).

## Testing Guidelines
- Co-locate specs with source files as `*.spec.ts`.
- For standalone component specs, import the component directly in `TestBed`.
- Mock required providers for router-dependent templates (`RouterTestingModule`/providers).
- When templates use Lucide icons, provide required icons or stub icon components.
- Keep specs deterministic; avoid depending on real timers/network.

## Before Opening a PR
- Run at minimum:
```bash
npx tsc -p tsconfig.app.json --noEmit
npm test -- --watch=false --browsers=ChromeHeadless --include=<changed-spec-or-folder>
npm run build -- --configuration development
```
- If full test/build is red for known baseline reasons, call that out explicitly in PR notes.
- Do not introduce unrelated formatting-only churn.

## Agent Workflow Expectations
- Read nearby feature files before editing to mirror local conventions.
- Keep commits focused and atomic by feature/fix.
- Prefer small, reviewable diffs over broad refactors.
- Document any new scripts/tooling in this file when you add them.

## Quick Single-Test Example
- `npx ng test --watch=false --browsers=ChromeHeadless --include=src/app/pages/facturas/facturas.component.spec.ts`
- Replace the path with the exact spec you are modifying.
