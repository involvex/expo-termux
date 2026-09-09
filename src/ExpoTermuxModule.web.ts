import { registerWebModule, NativeModule } from 'expo';

class ExpoTermuxModule extends NativeModule {
  executeCommand(): boolean {
    console.warn('ExpoTermux.executeCommand is not available on web. Returning false.');
    return false;
  }
}

export default registerWebModule(ExpoTermuxModule, 'ExpoTermux');
