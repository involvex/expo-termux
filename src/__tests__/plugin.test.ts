import withTermuxRunCommand from '../../plugin/build/index.js';

type Manifest = Record<string, unknown>;

function createManifestFn() {
  const pluginConfig = (
    withTermuxRunCommand as unknown as (config: Record<string, unknown>) => Record<string, unknown>
  )({
    name: 'test',
    slug: 'test',
    mods: {},
  });

  const androidMods = (pluginConfig.mods ?? {}) as {
    android: {
      manifest: (input: {
        modResults: { manifest: Manifest };
        modRequest: Record<string, unknown>;
      }) => Promise<{ modResults: { manifest: Manifest } }>;
    };
  };
  return androidMods.android.manifest;
}

async function runManifestModifier(manifest: Manifest): Promise<Manifest> {
  const fn = createManifestFn();
  const result = await fn({ modResults: { manifest }, modRequest: {} });
  return result.modResults.manifest;
}

describe('withTermuxRunCommand', () => {
  it('adds RUN_COMMAND and MANAGE_EXTERNAL_STORAGE permissions to an empty manifest', async () => {
    const manifest = await runManifestModifier({});
    const permissions = manifest['uses-permission'] as { $: { 'android:name': string } }[];

    expect(permissions).toEqual([
      { $: { 'android:name': 'com.termux.permission.RUN_COMMAND' } },
      { $: { 'android:name': 'android.permission.MANAGE_EXTERNAL_STORAGE' } },
    ]);
  });

  it('adds Termux package queries to an empty manifest', async () => {
    const manifest = await runManifestModifier({});
    const queries = manifest['queries'] as {
      package: { $: { 'android:name': string } }[];
    }[];

    expect(queries).toEqual([{ package: [{ $: { 'android:name': 'com.termux' } }] }]);
  });

  it('is idempotent across multiple invocations', async () => {
    const first = await runManifestModifier({});

    const second = await runManifestModifier(first);

    const permissions = second['uses-permission'] as { $: { 'android:name': string } }[];
    const queries = second['queries'] as {
      package: { $: { 'android:name': string } }[];
    }[];

    expect(permissions).toHaveLength(2);
    expect(queries).toHaveLength(1);
    expect(queries[0].package).toHaveLength(1);
  });

  it('preserves existing permissions and appends missing ones', async () => {
    const existing = {
      'uses-permission': [{ $: { 'android:name': 'android.permission.INTERNET' } }],
    };

    const manifest = await runManifestModifier(existing);
    const permissions = manifest['uses-permission'] as { $: { 'android:name': string } }[];

    expect(permissions).toEqual([
      { $: { 'android:name': 'android.permission.INTERNET' } },
      { $: { 'android:name': 'com.termux.permission.RUN_COMMAND' } },
      { $: { 'android:name': 'android.permission.MANAGE_EXTERNAL_STORAGE' } },
    ]);
  });

  it('does not duplicate existing permissions', async () => {
    const existing = {
      'uses-permission': [
        { $: { 'android:name': 'com.termux.permission.RUN_COMMAND' } },
        { $: { 'android:name': 'android.permission.MANAGE_EXTERNAL_STORAGE' } },
      ],
    };

    const manifest = await runManifestModifier(existing);
    const permissions = manifest['uses-permission'] as { $: { 'android:name': string } }[];

    expect(permissions).toHaveLength(2);
  });
});
