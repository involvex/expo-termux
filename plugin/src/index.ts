import { withAndroidManifest, type ConfigPlugin } from '@expo/config-plugins';

const RUN_COMMAND_PERMISSION = 'com.termux.permission.RUN_COMMAND';
const MANAGE_STORAGE_PERMISSION = 'android.permission.MANAGE_EXTERNAL_STORAGE';

const withTermuxRunCommand: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    manifest['uses-permission'] = manifest['uses-permission'] ?? [];

    const permissionsToAdd = [RUN_COMMAND_PERMISSION, MANAGE_STORAGE_PERMISSION];

    const existing = new Set(
      manifest['uses-permission']
        .map((entry) => entry.$?.['android:name'])
        .filter((name): name is string => typeof name === 'string')
    );

    for (const permission of permissionsToAdd) {
      if (!existing.has(permission)) {
        manifest['uses-permission'].push({
          $: { 'android:name': permission },
        });
      }
    }

    manifest['queries'] = manifest['queries'] ?? [];
    const packageQueries = manifest['queries'].find((entry) => entry.package != null);
    if (packageQueries != null) {
      const packages = packageQueries.package ?? [];
      const termuxPresent = packages.some((pkg) => pkg.$?.['android:name'] === 'com.termux');
      if (!termuxPresent) {
        packages.push({ $: { 'android:name': 'com.termux' } });
      }
      packageQueries.package = packages;
    } else {
      manifest['queries'].push({
        package: [{ $: { 'android:name': 'com.termux' } }],
      });
    }

    return config;
  });
};

export default withTermuxRunCommand;
