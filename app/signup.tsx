import { useAuth } from "@/hooks/useAuth"; // you will create this hook
import { useThemeColor } from "@/hooks/useThemeColor";
import { createRegistrationStyle } from "@/style/registrationStyle";
import { useMemo } from "react";
import {
  Animated,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegistrationScreen() {
  const { theme, s } = useThemeColor();
  const hasBgImage = !!theme.bgImage;

  const styles = useMemo(() => createRegistrationStyle(theme, s), [theme, s]);

  // custom hook similar to useAuth
  const { form, loading, error, handleFormChange, register, glowScale } = useAuth();

  return (
    <View style={styles.container}>
      {hasBgImage && <View style={styles.overlay} />}

      {/* === LOGO WITH SAME GLOW === */}
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
              source={{ uri: "https://randomuser.me/api/portraits/women/65.jpg" }}
              style={styles.logo}
            />
          </View>
        </Animated.View>

        <Text style={styles.appName}>Create Account</Text>
        <Text style={styles.tagline}>Join the experience</Text>
      </View>

      {/* === FORM CARD === */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>Fill in your details</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor={theme.inputText}
            value={form.name}
            onChangeText={(t) => handleFormChange("name", t)}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={theme.inputText}
            value={form.username}
            onChangeText={(t) => handleFormChange("username", t)}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={theme.inputText}
            value={form.password}
            secureTextEntry
            onChangeText={(t) => handleFormChange("password", t)}
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={register}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Creating..." : "Register"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
