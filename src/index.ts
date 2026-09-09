// Reexport the native module. On web, it will be resolved to ExpoTermuxModule.web.ts
// and on native platforms to ExpoTermuxModule.ts
import type { ExecuteTermuxCommandOptions } from './ExpoTermux.types';
import ExpoTermuxModule from './ExpoTermuxModule';

export { default } from './ExpoTermuxModule';
export * from './ExpoTermux.types';
export { default as TermuxButton } from './TermuxButton';

/**
 * Execute a command in Termux via the Termux RunCommandService intent.
 *
 * WARNING: This executes arbitrary shell commands on the device. Never pass
 * unsanitized user input to `commandPath` or `args`.
 *
 * @param options.commandPath Absolute path to the executable in Termux,
 * e.g. `/data/data/com.termux/files/usr/bin/bash`.
 * @param options.args Arguments passed to the executable. Defaults to `[]`.
 * @param options.workingDir Optional working directory for the command.
 * @param options.inBackground Whether to run the command in the background. Defaults to `false`.
 * @returns `true` if the intent was dispatched, `false` otherwise
 * (e.g. Termux missing, permission denied, or running on web).
 */
export function executeTermuxCommand(options: ExecuteTermuxCommandOptions): boolean;
export function executeTermuxCommand(commandPath: string): boolean;
export function executeTermuxCommand(
  commandPathOrOptions: string | ExecuteTermuxCommandOptions,
  maybeArgs?: string[],
  maybeWorkingDir?: string,
  maybeInBackground?: boolean
): boolean {
  let commandPath: string;
  let args: string[];
  let workingDir: string | undefined;
  let inBackground: boolean;

  if (typeof commandPathOrOptions === 'string') {
    commandPath = commandPathOrOptions;
    args = maybeArgs ?? [];
    workingDir = maybeWorkingDir;
    inBackground = maybeInBackground ?? false;
  } else {
    const opts = commandPathOrOptions;
    commandPath = opts.commandPath;
    args = opts.args ?? [];
    workingDir = opts.workingDir;
    inBackground = opts.inBackground ?? false;
  }

  return ExpoTermuxModule.executeCommand(commandPath, args, workingDir ?? null, inBackground);
}
