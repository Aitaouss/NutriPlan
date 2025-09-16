import "../global.css";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{ headerShown: false, title: "Welcome" }}
          />
          <Stack.Screen
            name="signup"
            options={{
              headerShown: false,
              title: "Sign Up",
              headerStyle: { backgroundColor: "#f8f9fa" },
              headerTintColor: "#374151",
            }}
          />
          <Stack.Screen
            name="login"
            options={{
              headerShown: false,
              title: "Login",
              headerStyle: { backgroundColor: "#f8f9fa" },
              headerTintColor: "#374151",
            }}
          />
          <Stack.Screen
            name="onboarding"
            options={{
              headerShown: false,
              title: "Profile Setup",
              headerStyle: { backgroundColor: "#f8f9fa" },
              headerTintColor: "#374151",
            }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
