import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f4f7fc",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchWrapper: {
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 3,
    marginBottom: 10,
    marginTop: Platform.OS === "ios" ? 10 : 6,
    elevation: 1,
  },
  searchInput: {
    fontSize: 16,
    color: "#000",
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#34C759",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    fontSize: 24,
    color: "#555",
    fontWeight: "700",
  },
  chatContent: {
    flex: 1,
    justifyContent: "center",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  chatTime: {
    fontSize: 13,
    color: "#999",
  },
  chatFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  checkMark: {
    fontSize: 13,
    color: "#007AFF",
    marginRight: 6,
  },
  chatMessage: {
    fontSize: 14,
    color: "#555",
    flexShrink: 1,
  },
  separator: {
    height: 10,
  },
});
