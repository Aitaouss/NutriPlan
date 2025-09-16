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
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { loginUser, storeToken, storeUserData } from "../services/api";

export default function LoginScreen() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

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
        // Store the token and user data
        if (result.data && result.data.token) {
          await storeToken(result.data.token);
        }
        if (result.data && result.data.user) {
          await storeUserData(result.data.user);
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
              <Text className="text-red-600 text-sm text-right">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className={`mt-6 py-4 px-6 rounded-lg ${
                loading ? "bg-gray-400" : "bg-red-600"
              }`}
            >
              <Text className="text-white text-lg font-semibold text-center">
                {loading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600 text-base">
                Don't have an account?{" "}
              </Text>
              <Link href="/signup" asChild>
                <TouchableOpacity>
                  <Text className="text-red-600 text-base font-semibold">
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>

            {/* Social Login Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="mx-4 text-gray-500 text-sm">
                Or continue with
              </Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            {/* Social Login Buttons */}
            <View className="space-y-3">
              <TouchableOpacity className="bg-white/80 border border-gray-200 py-3 px-4 rounded-lg flex-row items-center justify-center">
                <Text className="text-gray-700 text-base font-medium ml-2">
                  Continue with Google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="bg-white/80 border border-gray-200 py-3 px-4 rounded-lg flex-row items-center justify-center">
                <Text className="text-gray-700 text-base font-medium ml-2">
                  Continue with Apple
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
