import { Link, router } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export default function WelcomeScreen() {
  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={["#f8f9fa", "#e9ecef", "#dee2e6"]}
        className="flex-1"
      >
        <View className="flex-1 items-start justify-end bg-transparent px-6 gap-6">
          <View className="flex gap-2">
            <Text className="text-black text-6xl font-bold">Welcome</Text>
            <Text className="text-black text-6xl font-bold">to NutriPlan</Text>
            <Text className="text-gray-600 text-base leading-6 mt-2">
              Your Personal Nutrition and Meal Planning Assistant. Start your
              journey to better health today!
            </Text>
          </View>
          <View className="gap-4 w-full flex items-center justify-center mb-6">
            <Link href="/signup" asChild>
              <TouchableOpacity className="bg-red-600 rounded-full w-full py-4 items-center">
                <Text className="text-white text-lg font-semibold">
                  🏃‍♂️ Let's Get Started
                </Text>
              </TouchableOpacity>
            </Link>
            <View className="flex-row items-center">
              <Text className="font-medium text-gray-700">
                Already have an account?
              </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text className="text-red-600 font-semibold">Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
