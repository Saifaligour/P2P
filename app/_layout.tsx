
import store from "@/Redux/store"; // Adjust path accordingly
import { Slot } from "expo-router";
import React from "react";
import { Provider } from "react-redux";

export default function App() {
  return (
    <Provider store={store}>
      <Slot />
    </Provider>
  );
}
