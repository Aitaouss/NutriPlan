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
import { router } from "expo-router";
import { getStoredToken, submitOnboarding } from "../services/api";

const GOAL_OPTIONS = [
  { id: "lose_weight", label: "Lose Weight", emoji: "⬇️" },
  { id: "gain_weight", label: "Gain Weight", emoji: "⬆️" },
  { id: "maintain_weight", label: "Maintain Weight", emoji: "➡️" },
  { id: "build_muscle", label: "Build Muscle", emoji: "💪" },
  { id: "improve_health", label: "Improve Health", emoji: "❤️" },
];

export default function OnboardingScreen() {
  const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
    goal: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (
      !formData.age ||
      !formData.height ||
      !formData.weight ||
      !formData.goal
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const age = parseInt(formData.age);
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);

    if (age < 10 || age > 120) {
      Alert.alert("Error", "Please enter a valid age");
      return;
    }

    if (height < 100 || height > 250) {
      Alert.alert("Error", "Please enter height in cm (100-250)");
      return;
    }

    if (weight < 30 || weight > 300) {
      Alert.alert("Error", "Please enter weight in kg (30-300)");
      return;
    }

    setLoading(true);

    try {
      // For demo purposes, using a mock token
      // In a real app, you'd get this from your auth state/storage
      const mockToken = await getStoredToken();

      const result = await submitOnboarding(
        {
          age,
          height,
          weight,
          goal: formData.goal,
        },
        mockToken as string
      );

      if (result.error) {
        Alert.alert("Onboarding Failed", result.error);
      } else {
        Alert.alert("Success", "Profile created successfully!", [
          {
            text: "Continue",
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
            <View className="flex-1 px-6 py-12">
              {/* Header */}
              <View className="items-center mb-8">
                <Text className="text-4xl font-bold text-gray-800 mb-2">
                  Tell Us About You
                </Text>
                <Text className="text-base text-gray-600 text-center">
                  Help us create a personalized nutrition plan
                </Text>
              </View>

              {/* Form */}
              <View className="space-y-6">
                {/* Age Input */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Age (years)
                  </Text>
                  <TextInput
                    className="bg-white/80 border border-gray-200 rounded-lg px-4 py-3 text-base"
                    placeholder="Enter your age"
                    placeholderTextColor="#9CA3AF"
                    value={formData.age}
                    onChangeText={(text) =>
                      setFormData({ ...formData, age: text })
                    }
                    keyboardType="numeric"
                  />
                </View>

                {/* Height Input */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Height (cm)
                  </Text>
                  <TextInput
                    className="bg-white/80 border border-gray-200 rounded-lg px-4 py-3 text-base"
                    placeholder="Enter your height in cm"
                    placeholderTextColor="#9CA3AF"
                    value={formData.height}
                    onChangeText={(text) =>
                      setFormData({ ...formData, height: text })
                    }
                    keyboardType="numeric"
                  />
                </View>

                {/* Weight Input */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </Text>
                  <TextInput
                    className="bg-white/80 border border-gray-200 rounded-lg px-4 py-3 text-base"
                    placeholder="Enter your weight in kg"
                    placeholderTextColor="#9CA3AF"
                    value={formData.weight}
                    onChangeText={(text) =>
                      setFormData({ ...formData, weight: text })
                    }
                    keyboardType="numeric"
                  />
                </View>

                {/* Goal Selection */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-3">
                    What's your goal?
                  </Text>
                  <View className="space-y-2">
                    {GOAL_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option.id}
                        onPress={() =>
                          setFormData({ ...formData, goal: option.id })
                        }
                        className={`border rounded-lg px-4 py-3 flex-row items-center ${
                          formData.goal === option.id
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 bg-white/80"
                        }`}
                      >
                        <Text className="text-xl mr-3">{option.emoji}</Text>
                        <Text
                          className={`text-base ${
                            formData.goal === option.id
                              ? "text-red-700 font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className={`mt-8 py-4 px-6 rounded-lg ${
                  loading ? "bg-gray-400" : "bg-[#BB2121]"
                }`}
              >
                <Text className="text-white text-lg font-semibold text-center">
                  {loading ? "Creating Profile..." : "Create My Profile"}
                </Text>
              </TouchableOpacity>

              {/* Skip for now */}
              <TouchableOpacity
                onPress={() => router.push("/(tabs)")}
                className="mt-4"
              >
                <Text className="text-gray-500 text-base text-center">
                  Skip for now
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
