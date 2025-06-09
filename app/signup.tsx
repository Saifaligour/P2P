import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Signup() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Signup Screen</Text>
      <Button title="Go to Login" onPress={() => router.replace("/login")} />
    </View>
  );
}
