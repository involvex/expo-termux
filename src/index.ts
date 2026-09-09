// Reexport the native module. On web, it will be resolved to ExpoTermuxModule.web.ts
// and on native platforms to ExpoTermuxModule.ts
export { default } from './ExpoTermuxModule';
export * from './ExpoTermux.types';
