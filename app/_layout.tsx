
import { DEBUG_MODE, RPC_LOG } from "@/constants/command.mjs";
import { rpcService } from "@/hooks/RPC";
import { useThemeColor } from "@/hooks/useThemeColor";
import store from "@/Redux/store"; // Adjust path accordingly
import { formatLogs } from "@/utils/helpter";
import { Slot } from "expo-router";
import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import { Provider } from "react-redux";

export default function App() {

  useEffect(() => {
    if (!DEBUG_MODE) return;
    rpcService.onRequest(RPC_LOG, (data: any) => formatLogs(data));
  }, []);
  return (
    <Provider store={store} >
      <StatusBarS />
      <Slot />
    </Provider>

  );
}

function StatusBarS() {
  const { theme } = useThemeColor()
  return (
    <StatusBar barStyle="default" backgroundColor={theme.bg} />
  )
}