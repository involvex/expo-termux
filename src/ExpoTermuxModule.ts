import { NativeModule, requireNativeModule } from 'expo';

declare class ExpoTermuxModule extends NativeModule {
  executeCommand(
    commandPath: string,
    args: string[],
    workingDir: string | null,
    inBackground: boolean
  ): boolean;

  readFile(path: string): string;
}

export default requireNativeModule<ExpoTermuxModule>('ExpoTermux');
