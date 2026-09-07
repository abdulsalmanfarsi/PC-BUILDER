import { Tabs } from "expo-router";

import {
  ThemeProvider,
} from "../../src/context/ThemeContext";

export default function TabLayout() {
  return (
    <ThemeProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            display: "none",
          },
        }}
      />
    </ThemeProvider>
  );
}