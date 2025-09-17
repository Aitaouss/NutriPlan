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
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { registerUser } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function SignUpScreen() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useAuth();

  const handleSignUp = async () => {
    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const result = await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      if (result.error) {
        Alert.alert("Registration Failed", result.error);
      } else {
        // Store the token and user data using AuthProvider
        if (result.data && result.data.token) {
          await setToken(result.data.token);
        }
        if (result.data && result.data.user) {
          await setUser(result.data.user);
        }

        console.log("Registration successful:", result.data);

        Alert.alert("Success", "Account created successfully!", [
          {
            text: "OK",
            onPress: () => {
              // Navigate directly to onboarding without delay
              router.replace("/onboarding");
            },
          },
        ]);
      }
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert(
        "Error",
        `Something went wrong: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView className="flex-1">
      <ImageBackground
        source={require("../assets/images/nutriBack.png")}
        resizeMode="cover"
        className="flex-1 relative"
      >
        <View className="absolute inset-0 bg-white opacity-90" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View className=" flex-1 justify-center px-6 py-12">
              {/* Header */}
              <View className="items-center mb-8">
                <Text className="text-4xl font-bold text-gray-800 mb-2">
                  Create Account
                </Text>
                <Text className="text-base text-gray-600 text-center">
                  Join NutriPlan and start your health journey
                </Text>
              </View>
              {/* Form */}
              <View className="space-y-4">
                {/* Username Input */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Username
                  </Text>
                  <TextInput
                    className="bg-white/80 border border-gray-200 rounded-lg px-4 py-3 text-base"
                    placeholder="Enter your username"
                    placeholderTextColor="#9CA3AF"
                    value={formData.username}
                    onChangeText={(text) =>
                      setFormData({ ...formData, username: text })
                    }
                    autoCapitalize="none"
                  />
                </View>

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

                {/* Confirm Password Input */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </Text>
                  <TextInput
                    className="bg-white/80 border border-gray-200 rounded-lg px-4 py-3 text-base"
                    placeholder="Confirm your password"
                    placeholderTextColor="#9CA3AF"
                    value={formData.confirmPassword}
                    onChangeText={(text) =>
                      setFormData({ ...formData, confirmPassword: text })
                    }
                    secureTextEntry
                  />
                </View>
              </View>
              {/* Sign Up Button */}
              <TouchableOpacity
                onPress={handleSignUp}
                disabled={loading}
                className={`mt-6 py-4 px-6 rounded-lg ${
                  loading ? "bg-gray-400" : "bg-[#BB2121]"
                }`}
              >
                <Text className="text-white text-lg font-semibold text-center">
                  {loading ? "Creating Account..." : "Create Account"}
                </Text>
              </TouchableOpacity>
              {/* Login Link */}
              <View className="flex-row justify-center mt-6">
                <Text className="text-gray-600 text-base">
                  Already have an account?
                </Text>
                <Link href="/login" asChild>
                  <TouchableOpacity>
                    <Text className="text-[#BB2121] text-base font-semibold">
                      Log In
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}
