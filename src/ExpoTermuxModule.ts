import { NativeModule, requireNativeModule } from 'expo';

declare class ExpoTermuxModule extends NativeModule<{}> {}

export default requireNativeModule<ExpoTermuxModule>('ExpoTermux');
