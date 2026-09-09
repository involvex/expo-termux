import { withAndroidManifest, type ConfigPlugin } from '@expo/config-plugins';

const RUN_COMMAND_PERMISSION = 'com.termux.permission.RUN_COMMAND';

const withTermuxRunCommand: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    manifest['uses-permission'] = manifest['uses-permission'] ?? [];

    const alreadyPresent = manifest['uses-permission'].some(
      (entry) => entry.$?.['android:name'] === RUN_COMMAND_PERMISSION
    );

    if (!alreadyPresent) {
      manifest['uses-permission'].push({
        $: { 'android:name': RUN_COMMAND_PERMISSION },
      });
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
