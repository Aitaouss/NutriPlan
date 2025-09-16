import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

export default function HomeScreen() {
  return (
    <View className="flex-1">
      <LinearGradient
        colors={["#f8f9fa", "#e9ecef", "#dee2e6"]}
        className="flex-1"
      >
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white/20 rounded-full p-8 mb-8"></View>

          <View className="items-center mb-16">
            <Text className="text-6xl font-bold text-gray-800 mb-2">
              Welcome
            </Text>
            <Text className="text-6xl font-bold text-gray-800 mb-4">
              to NutriPlan
            </Text>
            <Text className="text-base text-gray-600 text-center leading-6 px-4">
              Your companion for health, fitness, and wellness. Let's journey to
              a healthier you!
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
