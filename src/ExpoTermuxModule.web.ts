import { registerWebModule, NativeModule } from 'expo';

// ExpoTermuxModule is not available on the web platform.
class ExpoTermuxModule extends NativeModule<{}> {}

export default registerWebModule(ExpoTermuxModule, 'ExpoTermuxModule');
