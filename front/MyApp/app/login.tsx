import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { loginUser } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function LoginScreen() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useAuth();

  const handleLogin = async () => {
    // Validation
    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const result = await loginUser({
        email: formData.email,
        password: formData.password,
      });
      if (result.error) {
        Alert.alert("Login Failed", result.error);
      } else {
        // Store the token and user data using AuthProvider
        if (result.data && result.data.token) {
          await setToken(result.data.token);
        }
        if (result.data && result.data.user) {
          await setUser(result.data.user);
        }

        Alert.alert("Success", "Welcome back!", [
          {
            text: "OK",
            onPress: () => router.push("/(tabs)"),
          },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={["#f8f9fa", "#e9ecef", "#dee2e6"]}
        className="flex-1"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View className="flex-1 justify-center px-6 py-12">
              {/* Header */}
              <View className="items-center mb-8">
                <Text className="text-4xl font-bold text-gray-800 mb-2">
                  Welcome Back
                </Text>
                <Text className="text-base text-gray-600 text-center">
                  Sign in to continue your health journey
                </Text>
              </View>
              {/* Form */}
              <View className="space-y-4">
                {/* Email Input */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Email
                  </Text>
                  <TextInput
                    className="bg-white/80 border border-gray-200 rounded-lg px-4 py-3 text-base"
                    placeholder="Enter your email"
                    placeholderTextColor="#9CA3AF"
                    value={formData.email}
                    onChangeText={(text) =>
                      setFormData({ ...formData, email: text })
                    }
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Password Input */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Password
                  </Text>
                  <TextInput
                    className="bg-white/80 border border-gray-200 rounded-lg px-4 py-3 text-base"
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    value={formData.password}
                    onChangeText={(text) =>
                      setFormData({ ...formData, password: text })
                    }
                    secureTextEntry
                  />
                </View>
              </View>
              {/* Forgot Password */}
              <TouchableOpacity className="mt-4">
                <Text className="text-[#BB2121] text-sm text-right">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                className={`mt-6 py-4 px-6 rounded-lg ${
                  loading ? "bg-gray-400" : "bg-[#BB2121]"
                }`}
              >
                <Text className="text-white text-lg font-semibold text-center">
                  {loading ? "Signing In..." : "Sign In"}
                </Text>
              </TouchableOpacity>
              {/* Sign Up Link */}
              <View className="flex-row justify-center mt-6">
                <Text className="text-gray-600 text-base">
                  Don't have an account?
                </Text>
                <Link href="/signup" asChild>
                  <TouchableOpacity>
                    <Text className="text-[#BB2121] text-base font-semibold">
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
              {/* Social Login Divider */}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
