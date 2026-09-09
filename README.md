# @involvex/expo-termux

Expo native module for integrating with [Termux](https://termux.com/) on Android. Dispatch shell commands to Termux's `RunCommandService` from your Expo/React Native app.

## Features

- Execute shell commands in Termux via native Android intent
- Config plugin that automatically injects required permissions and package visibility declarations
- TypeScript API with web fallback
- Built-in Android 11+ package visibility support
- Android 12+ foreground service compatibility
- Sample terminal UI included

## Installation

```bash
bun add @involvex/expo-termux
# or
npx expo install @involvex/expo-termux
```

For bare React Native or Expo development builds, also install peer dependencies:

```bash
bun add expo-file-system
bun add react-native-safe-area-context
```

## Usage

### API

```ts
import { executeTermuxCommand, type ExecuteTermuxCommandOptions } from '@involvex/expo-termux';

// Positional API
const ok = executeTermuxCommand(
  '/data/data/com.termux/files/usr/bin/bash',
  ['-c', 'ls -la'],
  undefined,
  false
);

// Options API
const ok2 = executeTermuxCommand({
  commandPath: '/data/data/com.termux/files/usr/bin/bash',
  args: ['-c', 'ls -la'],
  inBackground: false,
});
```

**Returns:** `true` if the intent was dispatched, `false` if Termux is unavailable or the platform is web.

**WARNING:** This executes arbitrary shell commands on the device. Never pass unsanitized user input to `commandPath` or `args`.

### Reading command output

The module exposes `readFile(path)` to read files from shared storage:

```ts
import ExpoTermuxModule from '@involvex/expo-termux';

const output = ExpoTermuxModule.readFile('/sdcard/Download/expo-termux/output.txt');
```

### Config plugin

The plugin automatically adds the following to your Android manifest:

- `com.termux.permission.RUN_COMMAND`
- `android.permission.MANAGE_EXTERNAL_STORAGE`
- `<queries><package android:name="com.termux" /></queries>`

If you use Expo config plugins, it is auto-detected via `expo-module.config.json`. Otherwise, add it manually in `app.json`:

```json
{
  "expo": {
    "plugins": ["../plugin/build/index.js"]
  }
}
```

### Sample terminal UI

The `example/` directory contains a terminal-style UI that lets you type commands and view their output. To run it:

```bash
cd example
bun install
bun run android
```

**Note:** On Android 11+ (API 30+), you must grant **All files access** in Settings > Apps > [This app] > Permissions > All files access before output will be readable.

## Requirements

- Expo SDK `~57.0.0` or compatible
- Android only (API 24+)
- Termux app installed on the device
- For output capture: **All files access** on Android 11+ (special permission, no runtime dialog)

## API Reference

### `executeTermuxCommand(options: ExecuteTermuxCommandOptions): boolean`
### `executeTermuxCommand(commandPath: string, args?: string[], workingDir?: string, inBackground?: boolean): boolean`

Dispatches a command to Termux's `RunCommandService`.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `commandPath` | `string` | required | Absolute path to the executable in Termux |
| `args` | `string[]` | `[]` | Arguments passed to the executable |
| `workingDir` | `string` | `undefined` | Working directory for the command |
| `inBackground` | `boolean` | `false` | Run command in the background |

### `readFile(path: string): string`

Reads a file from the device's shared storage and returns its contents as a UTF-8 string. Returns empty string on failure.

## Permissions

| Permission | Purpose |
|------------|---------|
| `com.termux.permission.RUN_COMMAND` | Required by Termux to accept command execution intents |
| `android.permission.MANAGE_EXTERNAL_STORAGE` | Required to read command output files from shared storage on Android 11+ |

## Development

```bash
# Install dependencies
bun install

# Build module and plugin
bun run build

# Run tests
bun run test

# Lint and format
bun run lint
bun run format

# Type check
bun run typecheck
bun run typecheck:plugin
```

## Publishing

```bash
# Build first
bun run build

# Publish
npm publish --access public
```

## License

MIT
