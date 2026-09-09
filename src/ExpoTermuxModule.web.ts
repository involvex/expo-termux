import { registerWebModule, NativeModule } from 'expo';

class ExpoTermuxModule extends NativeModule {
  executeCommand(): boolean {
    console.warn('ExpoTermux.executeCommand is not available on web. Returning false.');
    return false;
  }

  readFile(): string {
    console.warn('ExpoTermux.readFile is not available on web. Returning empty string.');
    return '';
  }
}

export default registerWebModule(ExpoTermuxModule, 'ExpoTermux');
