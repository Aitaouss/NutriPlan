import React, { useEffect, useState } from "react";
import { Link, router } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfile } from "../services/api";

export default function WelcomeScreen() {
  const { isAuthenticated, loading, token } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);

  useEffect(() => {
    // Check authentication state when component mounts
    if (!loading && isAuthenticated && token) {
      checkOnboardingStatus();
    }
    // If not authenticated, stay on welcome screen
  }, [isAuthenticated, loading, token]);

  const checkOnboardingStatus = async () => {
    try {
      setCheckingOnboarding(true);

      // Check if user has completed onboarding by checking profile
      const response = await getUserProfile(token);

      if (response.data && response.data.onboardingData) {
        // User has completed onboarding, redirect to main app
        router.replace("/(tabs)");
      } else {
        // User needs to complete onboarding
        router.replace("/onboarding");
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      // On error, redirect to onboarding to be safe
      router.replace("/onboarding");
    } finally {
      setCheckingOnboarding(false);
    }
  };

  const handleLogin = () => {
    router.push("/login");
  };
  // Show loading while checking authentication or onboarding
  if (loading || checkingOnboarding) {
    return (
      <SafeAreaView className="flex-1">
        <LinearGradient
          colors={["#f8f9fa", "#e9ecef", "#dee2e6"]}
          className="flex-1"
        >
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#BB2121" />
            <Text className="text-gray-600 mt-4 text-lg">
              {checkingOnboarding ? "Checking profile..." : "Loading..."}
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Show welcome screen only if user is not authenticated
  return (
    <SafeAreaView className="flex-1">
      {/* <LinearGradient
        colors={["#BB2121", "#e9ecef", "#dee2e6"]}
        className="flex
        -1"
      > */}
      <ImageBackground
        source={require("../assets/images/nutriBack.png")}
        resizeMode="cover"
        className="flex-1 relative"
      >
        <View className="absolute top-0 left-0 right-0 h-full bg-white/90" />
        <View className="w-full h-full absolute flex items-center justify-center">
          <Image
            source={require("../assets/images/NuriPlanLogo.png")}
            className="w-40 h-40"
          />
        </View>
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
              <TouchableOpacity className="bg-[#BB2121] flex flex-row justify-center gap-3 rounded-full w-full py-4 items-center">
                <Image
                  source={require("../assets/images/NutriPlanLogoWhite.png")}
                  className="w-5 h-5"
                />
                <Text className="text-white text-lg font-semibold">
                  Let's Get Started
                </Text>
              </TouchableOpacity>
            </Link>
            <View className="flex-row items-center">
              <Text className="font-medium text-gray-700">
                Already have an account ?
              </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text className="text-[#BB2121] font-bold"> Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* </LinearGradient> */}
      </ImageBackground>
    </SafeAreaView>
  );
}
