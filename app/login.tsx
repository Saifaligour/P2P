
import { login } from "@/backend/Auth";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  const handleLogin = async () => {
    if (!name.trim() || !username.trim()) {
      Alert.alert("Error", "Please enter both name and username");
      return;
    }

   login();
    // router.navigate("/home/chat");
    router.replace("/home/chat");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to ChatApp</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        value={username}
        onChangeText={setUsername}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 30 },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: { color: "#fff", textAlign: "center", fontSize: 16 },
});
