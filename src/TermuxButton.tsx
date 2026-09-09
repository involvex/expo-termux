import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle, type TextStyle } from 'react-native';

import ExpoTermuxModule from './ExpoTermuxModule';

/**
 * Security: `commandPath` and `args` are passed directly to the native Termux
 * RunCommandService and executed as shell commands. Do not pass unsanitized
 * user input to these props.
 */
type TermuxButtonProps = {
  commandPath?: string;
  args?: string[];
  workingDir?: string;
  inBackground?: boolean;
  title?: string;
  cardStyle?: ViewStyle;
  titleStyle?: TextStyle;
  buttonStyle?: ViewStyle;
  buttonTextStyle?: TextStyle;
};

const DEFAULT_COMMAND = '/data/data/com.termux/files/usr/bin/bash';
const DEFAULT_ARGS = ['-c', 'ls -la'];

export default function TermuxButton({
  commandPath = DEFAULT_COMMAND,
  args = DEFAULT_ARGS,
  workingDir,
  inBackground = false,
  title = 'Run Termux Command',
  cardStyle,
  titleStyle,
  buttonStyle,
  buttonTextStyle,
}: TermuxButtonProps) {
  const [status, setStatus] = useState<string | null>(null);

  const handlePress = useCallback(() => {
    const ok = ExpoTermuxModule.executeCommand(commandPath, args, workingDir ?? null, inBackground);
    setStatus(ok ? 'Command dispatched to Termux.' : 'Failed: Termux unavailable.');
  }, [commandPath, args, workingDir, inBackground]);

  return (
    <View style={[styles.card, cardStyle]}>
      <Text style={[styles.cardTitle, titleStyle]}>Termux Runner</Text>
      <Text style={styles.command} numberOfLines={2}>
        {commandPath} {args.join(' ')}
      </Text>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, buttonStyle]}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={title}>
        <Text style={[styles.buttonText, buttonTextStyle]}>{title}</Text>
      </Pressable>
      {status ? <Text style={styles.status}>{status}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    margin: 16,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  command: {
    color: '#B0B0B0',
    fontSize: 13,
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#BB86FC',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '700',
  },
  status: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 12,
  },
});
