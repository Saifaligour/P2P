import { Platform, StyleSheet } from "react-native";

export const createRegistrationStyle = (theme: any, s: any, hasBgImage = false) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: hasBgImage ? "transparent" : theme.bg,
            justifyContent: "center",
        },

        overlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: theme.imageOverlay || "transparent",
        },

        logoWrapper: {
            alignItems: "center",
            marginBottom: s(40),
        },

        logoContainer: {
            position: "relative",
            alignItems: "center",
            justifyContent: "center",
        },

        logoRing: {
            position: "absolute",
            width: s(160),
            height: s(160),
            borderRadius: s(80),
            borderWidth: 2,
            borderColor: (theme.button || theme.sent) + "50",
            backgroundColor: (theme.button || theme.sent) + "10",
        },

        logoBorder: {
            width: s(144),
            height: s(144),
            borderRadius: s(72),
            backgroundColor: theme.inputBg,
            padding: s(8),
            shadowColor: theme.shadowColor,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: s(24),
            elevation: 20,
        },

        logo: {
            width: "100%",
            height: "100%",
            borderRadius: s(64),
        },

        appName: {
            marginTop: s(24),
            fontSize: s(38),
            fontWeight: "900",
            color: theme.text,
            letterSpacing: 1.2,
            fontFamily: theme.fontFamily,
            textShadowColor: theme.shadowColor + "40",
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 8,
        },

        tagline: {
            marginTop: s(8),
            fontSize: s(16),
            color: theme.textSecondary,
            fontWeight: "600",
            letterSpacing: 0.8,
            fontFamily: theme.fontFamily,
        },

        card: {
            marginHorizontal: s(24),
            marginVertical: s(40),
            paddingVertical: s(48),
            paddingHorizontal: s(32),
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.14,
            shadowRadius: s(28),
            elevation: 20,
        },

        subtitle: {
            fontSize: s(17),
            textAlign: "center",
            color: theme.textSecondary,
            marginBottom: s(48),
            fontWeight: "500",
            fontFamily: theme.fontFamily,
        },

        inputContainer: {
            backgroundColor: theme.inputBg,
            borderRadius: 30,
            paddingHorizontal: s(20),
            paddingVertical: s(16),
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 2,
            borderColor: theme.inputBorder,
            shadowColor: theme.shadowColor,
            shadowOpacity: 0.3,
            shadowRadius: s(16),
            elevation: 16,
            marginBottom: s(20),
        },

        input: {
            flex: 1,
            color: theme.inputText,
            fontSize: s(17),
            marginLeft: s(12),
            fontWeight: "500",
            fontFamily: theme.fontFamily,
            paddingTop: Platform.OS === "android" ? 4 : 2,
        },

        button: {
            backgroundColor: theme.button,
            paddingVertical: s(18),
            borderRadius: 30,
            marginTop: s(12),
            shadowColor: theme.button,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.36,
            shadowRadius: s(20),
            elevation: 18,
            alignItems: "center",
            justifyContent: "center",
        },

        buttonDisabled: {
            backgroundColor: theme.textSecondary + "60",
            shadowOpacity: 0,
            elevation: 0,
        },

        buttonText: {
            color: theme.sentText,
            fontSize: s(17),
            fontWeight: "600",
            letterSpacing: 0.4,
            fontFamily: theme.fontFamily,
        },

        errorText: {
            color: "red",
            fontSize: s(14),
            textAlign: "center",
            marginBottom: s(16),
            fontWeight: "500",
            fontFamily: theme.fontFamily,
        },
    });
