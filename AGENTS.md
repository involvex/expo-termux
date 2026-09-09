# AGENTS.md

Instructions for AI agents working in this repository.

## Useful Commands

### Package Manager

- **Preferred:** `bun` for installing dependencies, running scripts, and lockfile management.
- Install deps: `bun install`
- Run scripts: `bun run <script>`

### Build & Development

- Build the module: `bun run build`
- Clean build artifacts: `bun run clean`
- Run tests: `bun run test`
- Lint source: `bun run lint`
- Format code: `bun run format`

### Example App (iOS/Android/Web)

From the `example/` directory:

- Start dev server: `bun run start`
- Run on Android: `bun run android`
- Run on iOS: `bun run ios`
- Run on Web: `bun run web`

### Git

- No commits, PRs, or pushes unless explicitly requested.
- Use `git --no-pager log` / `git --no-pager diff` in non-interactive environments.

## Technologies

- **Runtime:** Node.js / Bun
- **Language:** TypeScript (`~6.0.3`)
- **Framework:** Expo SDK `~57.0.0`
- **Native Platform:** Android only (`expo-module.config.json` lists only `android`)
- **Native Language:** Kotlin (`android/src/main/java/.../ExpoTermuxModule.kt`)
- **Module System:** Expo Modules (Kotlin modules API)
- **Testing:** Jest with `jest-expo`
- **Linting:** ESLint `~9.39.4` with `eslint-config-universe`
- **Formatting:** Prettier `^3.0.0`
- **React Native:** `0.86.3`
- **React:** `19.2.x`

## Project Structure

```
expo-termux/
├── src/
│   ├── index.ts                 # Public API entry point
│   ├── ExpoTermuxModule.ts      # Native module (Android / iOS / native)
│   ├── ExpoTermuxModule.web.ts  # Web stub (registerWebModule)
│   └── ExpoTermux.types.ts      # Type definitions
├── android/
│   └── src/main/java/com/involvex/expotermux/
│       └── ExpoTermuxModule.kt  # Android native implementation
├── example/                     # Expo example app
├── expo-module.config.json      # Expo module config (Android only)
├── package.json
├── tsconfig.json
├── eslint.config.cjs
├── .prettierrc
└── AGENTS.md                    # This file
```

## Best Practices and Guidelines

### Documentation

- Read the **versioned Expo docs** at `https://docs.expo.dev/versions/v57.0.0/` before writing or modifying module code.
- Do not rely on generic or latest Expo docs; this project targets a specific SDK version.

### Code Style

- **TypeScript:** Strict mode enabled (`strict: true`). No unused locals (`noUnusedLocals: true`). No implicit returns (`noImplicitReturns: true`).
- **Formatting:** Prettier with `printWidth: 100`, `singleQuote: true`, `trailingComma: "es5"`, `jsxSingleQuote: false`, `bracketSameLine: true`.
- **Linting:** ESLint flat config extending `eslint-config-universe/flat/native` and `eslint-config-universe/flat/web`. Ignore `build/`.
- **Imports:** Use `expo` APIs (`requireNativeModule`, `registerWebModule`, `NativeModule`) for module registration.

### Module Implementation

- Keep the native module name `ExpoTermux` consistent across TS and Kotlin.
- **Android:** Implement module logic in `android/.../ExpoTermuxModule.kt` using the Expo Kotlin modules API (`ModuleDefinition`, `Name`, etc.).
- **Web:** `ExpoTermuxModule.web.ts` must use `registerWebModule` and should not attempt native functionality.
- **Types:** Export public types from `ExpoTermux.types.ts` and re-export through `src/index.ts`.

### Testing

- Tests use Jest with `jest-expo` preset.
- Place tests in `src/__tests__/` or alongside source files as appropriate.
- Run tests before submitting changes: `bun run test`.

### Build & CI

- The module is built via `internal/module_scripts/build.js` (Node.js). Do not modify build scripts without understanding the Expo module build pipeline.
- Build output goes to `build/` (gitignored).
- `prepare` script runs automatically after install.

### Security & Permissions

- This module targets Android. Any new native features must declare required permissions in `android/src/main/AndroidManifest.xml`.
- Do not request broad permissions without clear user-facing justification.

### Dependencies

- Avoid adding runtime dependencies. This module currently has zero runtime dependencies.
- Add dev dependencies only when necessary for build, test, or type tooling.

## Non-Negotiable Rules

1. Always use `bun` for Node.js tasks in this repo.
2. Never commit secrets, keystores, or build artifacts.
3. Never use interactive git commands (`git add -p`, `git rebase -i`, etc.).
4. Do not run editors or pagers (`vim`, `nano`, `less`, etc.) in scripts.
5. Match existing code style; run `bun run lint` and `bun run format` before considering work complete.
