import { useAuth } from "@/hooks/useAuth";
import { useThemeColor } from "@/hooks/useThemeColor";
import { createStyle } from "@/style/loginStyle";
import { useMemo } from "react";
import { Animated, Image, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const { theme, s } = useThemeColor(); // assuming you have this
  const hasBgImage = !!theme.bgImage;
  const styles = useMemo(() => createStyle(theme, s), [theme, s]);

  const { credentials, loading, error, handleChange, login, glowScale } = useAuth();

  return (
    <View style={styles.container}>
      {hasBgImage && <View style={styles.overlay} />}
      {/* === LOGO === */}
      <View style={styles.logoWrapper}>

        <Animated.View
          style={[
            styles.logoContainer,
            { transform: [{ scale: glowScale }] },
          ]}
        >
          <View style={styles.logoRing} />

          <View style={styles.logoBorder}>
            <Image
              source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
              style={styles.logo}
            />
          </View>
        </Animated.View>

        {/* App name & tagline */}
        <Text style={styles.appName}>ChatApp</Text>
        <Text style={styles.tagline}>Connect with elegance</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.subtitle}>Enter your details to continue</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={theme.inputText}
            value={credentials.name}
            onChangeText={(t) => handleChange("name", t)}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={theme.inputText}
            value={credentials.username}
            onChangeText={(t) => handleChange("username", t)}
            autoCapitalize="none"
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={login}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Logging in..." : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
