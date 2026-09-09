import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TermuxButton from '../src/TermuxButton';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Expo Termux Demo</Text>
        <Text style={styles.subtitle}>
          Dispatch a test command to Termux via the native RunCommandService intent.
        </Text>
        <TermuxButton />
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Test command</Text>
          <Text style={styles.command}>/data/data/com.termux/files/usr/bin/bash -c "ls -la"</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 16,
  },
  header: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
    marginHorizontal: 16,
  },
  subtitle: {
    color: '#B0B0B0',
    fontSize: 14,
    marginTop: 8,
    marginHorizontal: 16,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    margin: 16,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  command: {
    color: '#B0B0B0',
    fontSize: 13,
    fontFamily: 'monospace',
  },
});
