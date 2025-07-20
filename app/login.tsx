import { useAuth } from "@/hooks/useAuth";
import { styles } from "@/style/loginStyle";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
export default function LoginScreen() {
  const {
    credentials,
    loading,
    error,
    handleChange,
    login
  } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to ChatApp</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={credentials.name}
        onChangeText={(text) => handleChange('name', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        value={credentials.username}
        onChangeText={(text) => handleChange('username', text)}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={styles.button}
        onPress={login}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Continue"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
