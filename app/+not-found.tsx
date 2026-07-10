import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useTheme } from '../src/theme/useTheme';

export default function NotFoundScreen() {
  const { theme } = useTheme();
  const colors = theme.color;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Page not found</Text>
      <Link href="/" style={[styles.link, { color: colors.primary }]}>
        Go to home
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  link: {
    fontSize: 16,
  },
});
