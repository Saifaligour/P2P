import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { checkAuth } from "../backend/Auth";

export default function SplashScreen() {
  useEffect(() => {
      const isAuthenticated = checkAuth();
    setTimeout(() => {
      router.replace(isAuthenticated ? "/home/UserList/userList" : "/login");
    }, 500); // simulate splash
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
