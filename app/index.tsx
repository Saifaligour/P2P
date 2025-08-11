import { checkAuth } from "@/hooks/useAuth";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {

  async function isLogin() {
    const isAuthenticated = await checkAuth();
    router.replace(isAuthenticated ? "/home/UserScreen/groupList" : "/login");
  }
  useEffect(() => {
    isLogin()
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ChatApp</Text>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 20 },
});
