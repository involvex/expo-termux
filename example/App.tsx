import { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import ExpoTermuxModule, { type ExecuteTermuxCommandOptions } from 'expo-termux';

type CommandEntry = {
  id: string;
  command: string;
  status: 'pending' | 'dispatched' | 'failed';
  output: string;
  timestamp: Date;
};

const OUTPUT_DIR = '/sdcard/Download/expo-termux';

export default function App() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandEntry[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const appendOutput = (id: string, output: string) => {
    setHistory((prev) => prev.map((entry) => (entry.id === id ? { ...entry, output } : entry)));
  };

  const showAllFilesAccessPrompt = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    const apiLevel = Number(Platform.Version);
    if (apiLevel < 30) {
      return true;
    }

    return new Promise((resolve) => {
      Alert.alert(
        'All files access required',
        'This app needs "All files access" to read command output from shared storage.\n\nTap OK to open Settings, then:\n1. Find this app in the list\n2. Tap "All files access" or "Files and media"\n3. Set it to "Allow"\n\nNote: This is a special Android permission — it will NOT show a popup dialog.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          {
            text: 'Open Settings',
            onPress: async () => {
              try {
                await Linking.openSettings();
              } catch {
                Alert.alert(
                  'Unable to open settings',
                  'Please open Settings > Apps > Expo Termux Example > Permissions > All files access manually.'
                );
              }
              resolve(true);
            },
          },
        ]
      );
    });
  };

  const ensureOutputDir = async (): Promise<string | null> => {
    const dirInfo = await FileSystem.getInfoAsync(OUTPUT_DIR);
    if (!dirInfo.exists) {
      try {
        await FileSystem.makeDirectoryAsync(OUTPUT_DIR, { intermediates: true });
      } catch {
        const opened = await showAllFilesAccessPrompt();
        if (!opened) {
          return null;
        }

        try {
          await FileSystem.makeDirectoryAsync(OUTPUT_DIR, { intermediates: true });
        } catch {
          Alert.alert(
            'Storage unavailable',
            'Cannot create output directory. Ensure All files access is granted.'
          );
          return null;
        }
      }
    }
    return OUTPUT_DIR;
  };

  const runCommand = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const dir = await ensureOutputDir();
    if (!dir) {
      return;
    }

    const id = `${Date.now()}`;
    const entry: CommandEntry = {
      id,
      command: trimmed,
      status: 'pending',
      output: '',
      timestamp: new Date(),
    };

    setHistory((prev) => [entry, ...prev]);
    setInput('');

    const outputPath = `${OUTPUT_DIR}/expo_termux_out_${id}.txt`;
    const escapedPath = outputPath.replace(/'/g, "'\\''");
    const wrappedCommand = `bash`;
    const wrappedArgs = ['-c', `mkdir -p '${OUTPUT_DIR}' && ${trimmed} > '${escapedPath}' 2>&1`];

    const options: ExecuteTermuxCommandOptions = {
      commandPath: wrappedCommand,
      args: wrappedArgs,
      workingDir: undefined,
      inBackground: false,
    };

    const dispatched = ExpoTermuxModule.executeCommand(
      options.commandPath,
      options.args ?? [],
      options.workingDir ?? null,
      options.inBackground ?? false
    );

    setHistory((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, status: dispatched ? 'dispatched' : 'failed' } : entry
      )
    );

    if (!dispatched) {
      appendOutput(id, 'Failed to dispatch command. Is Termux installed?');
      return;
    }

    let output = '';
    for (let i = 0; i < 20; i++) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      try {
        output = await FileSystem.readAsStringAsync(outputPath, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      } catch {
        output = ExpoTermuxModule.readFile(outputPath);
      }
      if (output.length > 0 || i >= 19) {
        break;
      }
    }

    appendOutput(id, output || '(no output)');
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.output}
          contentContainerStyle={styles.outputContent}>
          {history.length === 0 && (
            <Text style={styles.placeholder}>
              Type a Termux command below. Output will appear here.
            </Text>
          )}
          {history.map((entry) => (
            <View key={entry.id} style={styles.session}>
              <Text style={styles.prompt}>$ {entry.command}</Text>
              <Text style={[styles.status, entry.status === 'failed' && styles.statusFailed]}>
                {entry.status === 'pending'
                  ? 'Running...'
                  : entry.status === 'dispatched'
                    ? 'Dispatched to Termux'
                    : 'Failed to dispatch'}
              </Text>
              {entry.output ? <Text style={styles.outputText}>{entry.output}</Text> : null}
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <Text style={styles.inputPrompt}>$</Text>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a command..."
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={runCommand}
            returnKeyType="send"
          />
          <Pressable style={styles.sendButton} onPress={runCommand}>
            <Text style={styles.sendButtonText}>Run</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  output: {
    flex: 1,
  },
  outputContent: {
    padding: 16,
  },
  placeholder: {
    color: '#666',
    fontSize: 14,
    marginTop: 24,
  },
  session: {
    marginBottom: 20,
  },
  prompt: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
  },
  status: {
    color: '#4ADE80',
    fontSize: 12,
    marginTop: 4,
  },
  statusFailed: {
    color: '#F87171',
  },
  outputText: {
    color: '#B0B0B0',
    fontSize: 13,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
    marginTop: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    backgroundColor: '#121212',
  },
  inputPrompt: {
    color: '#4ADE80',
    fontSize: 16,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  sendButton: {
    backgroundColor: '#BB86FC',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  sendButtonText: {
    color: '#121212',
    fontSize: 14,
    fontWeight: '700',
  },
});
