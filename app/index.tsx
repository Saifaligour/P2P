import { useAuth } from "@/hooks/useAuth";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useEffect, useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
  const { checkAuth } = useAuth();
  const { theme, s } = useThemeColor()
  useEffect(() => {
    checkAuth();
  }, []);
  const styles = useMemo(() => createStyle(theme, s), [theme, s]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ChatApp</Text>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const createStyle = (theme: any, s: any) =>
  StyleSheet.create({
    container: {
      flex: 1, justifyContent: "center", alignItems: "center",
      backgroundColor: theme.bg
    },
    title: {
      color: theme.text,
      fontSize: s(20),
      fontWeight: '600',
      fontFamily: theme.fontFamily,
    },
  });
