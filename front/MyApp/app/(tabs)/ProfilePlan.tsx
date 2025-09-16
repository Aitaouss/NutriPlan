import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export default function ProfilePlanScreen() {
  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={["#f8f9fa", "#e9ecef", "#dee2e6"]}
        className="flex-1"
      >
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white/20 rounded-full p-8 mb-8">
            <Text className="text-4xl">👤</Text>
          </View>

          <View className="items-center mb-16">
            <Text className="text-4xl font-bold text-gray-800 mb-2">
              Profile
            </Text>
            <Text className="text-4xl font-bold text-gray-800 mb-4">
              & Plan
            </Text>
            <Text className="text-base text-gray-600 text-center leading-6 px-4">
              Manage your profile and view your personalized nutrition plans.
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
