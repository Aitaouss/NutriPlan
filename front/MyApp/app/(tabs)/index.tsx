import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserPlan,
  generatePlan,
  getUserProfile,
  updateProfile,
} from "@/services/api";

interface NutritionPlan {
  id: number;
  goal: string;
  age: number;
  height: number;
  weight: number;
  bmi: number;
  calories_target: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export default function HomeScreen() {
  const { user, token, logout } = useAuth();
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpdateProfileModal, setShowUpdateProfileModal] = useState(false);
  const [profileValues, setProfileValues] = useState({
    age: 0,
    height: 0,
    weight: 0,
    goal: "",
  });

  // Get BMI category
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-600" };
    if (bmi < 25) return { category: "Normal", color: "text-green-600" };
    if (bmi < 30) return { category: "Overweight", color: "text-orange-600" };
    return { category: "Obese", color: "text-red-600" };
  };

  // Calculate macro percentages dynamically
  const getMacroPercentages = () => {
    if (!plan) {
      return { protein: 25, carbs: 45, fat: 30 };
    }
    const proteinCalories = plan.macros.protein * 4;
    const carbCalories = plan.macros.carbs * 4;
    const fatCalories = plan.macros.fat * 9;
    const totalCalories = proteinCalories + carbCalories + fatCalories;

    return {
      protein: Math.round((proteinCalories / totalCalories) * 100),
      carbs: Math.round((carbCalories / totalCalories) * 100),
      fat: Math.round((fatCalories / totalCalories) * 100),
    };
  };

  // Get goal-specific tips
  const getGoalSpecificTips = () => {
    if (!plan) return [];

    const baseTips = [
      "• Drink plenty of water throughout the day",
      "• Track your progress regularly",
      "• Stay consistent with your plan",
    ];

    const goalSpecificTips: { [key: string]: string[] } = {
      "lose weight": [
        "• Create a moderate calorie deficit",
        "• Focus on protein to maintain muscle mass",
        "• Include fiber-rich foods to stay full",
        "• Eat slowly and mindfully",
      ],
      "weight loss": [
        "• Create a moderate calorie deficit",
        "• Focus on protein to maintain muscle mass",
        "• Include fiber-rich foods to stay full",
        "• Eat slowly and mindfully",
      ],
      "gain weight": [
        "• Eat frequent, nutrient-dense meals",
        "• Include healthy fats in your diet",
        "• Add strength training to build muscle",
        "• Don't skip meals",
      ],
      "weight gain": [
        "• Eat frequent, nutrient-dense meals",
        "• Include healthy fats in your diet",
        "• Add strength training to build muscle",
        "• Don't skip meals",
      ],
      "maintain weight": [
        "• Focus on balanced, whole foods",
        "• Maintain regular exercise routine",
        "• Listen to your hunger cues",
        "• Include variety in your meals",
      ],
    };

    const goal = plan.goal?.toLowerCase() || "maintain weight";
    const specificTips =
      goalSpecificTips[goal] || goalSpecificTips["maintain weight"];
    return [...baseTips, ...specificTips];
  };

  useEffect(() => {
    if (user && token) {
      loadNutritionPlan();
    }
  }, [user, token]);

  const loadNutritionPlan = async () => {
    try {
      setLoading(true);
      setError(null);

      // First try to get existing plan
      const planResponse = await getUserPlan(user!.id, token);

      if (planResponse.data && planResponse.data.plans) {
        setPlan(planResponse.data.plans.plan_data);
      } else {
        // No plan exists, generate one
        await generateNewPlan();
      }
    } catch (error) {
      console.error("Error loading plan:", error);
      setError("Failed to load your nutrition plan");
    } finally {
      setLoading(false);
    }
  };

  const generateNewPlan = async () => {
    try {
      const generateResponse = await generatePlan(user!.id, token);

      if (generateResponse.data && generateResponse.data.plan) {
        setPlan(generateResponse.data.plan.plan_data);
      } else {
        console.error("Plan generation failed:", generateResponse.error);
        setError(generateResponse.error || "Failed to generate plan");
      }
    } catch (error) {
      console.error("Error generating plan:", error);
      setError("Failed to generate your nutrition plan");
    }
  };

  const handleUpdateProfile = async () => {
    // Load current profile data first
    try {
      const profileResponse = await getUserProfile(token);
      if (profileResponse.data && profileResponse.data.onboardingData) {
        const profile = profileResponse.data.onboardingData;
        setProfileValues({
          age: profile.age,
          height: profile.height,
          weight: profile.weight,
          goal: profile.goal,
        });
        setShowUpdateProfileModal(true);
      } else {
        Alert.alert("Error", "Could not load your current profile");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load profile data");
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      // Update the profile
      const response = await updateProfile(profileValues, token);

      if (response.data) {
        // Profile updated successfully, now regenerate nutrition plan
        Alert.alert(
          "Profile Updated",
          "Your profile has been updated. Generating new nutrition plan...",
          [
            {
              text: "OK",
              onPress: async () => {
                setShowUpdateProfileModal(false);
                await generateNewPlan(); // This will recalculate based on new stats
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", response.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update your profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">
          Loading your nutrition plan...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <Text className="text-red-500 text-center mb-4">{error}</Text>
        <TouchableOpacity
          className="bg-blue-600 px-6 py-3 rounded-lg"
          onPress={loadNutritionPlan}
        >
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-blue-600 px-6 py-3 rounded-lg"
          onPress={handleLogout}
        >
          <Text className="text-white font-medium">logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <LinearGradient
        colors={["#3b82f6", "#1d4ed8"]}
        className="px-6 py-8 pb-12"
      >
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-white text-2xl font-bold">
              Hello, {user?.name || "User"}!
            </Text>
            <Text className="text-blue-100">
              Welcome to your nutrition plan
            </Text>
          </View>
          <TouchableOpacity
            className="bg-white/20 px-4 py-2 rounded-lg"
            onPress={handleLogout}
          >
            <Text className="text-white text-sm">Logout</Text>
          </TouchableOpacity>
        </View>

        {plan && (
          <View className="bg-white/10 rounded-2xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-xl font-semibold">
                Your Goal
              </Text>
              <TouchableOpacity
                className="bg-white/20 px-3 py-1 rounded-full"
                onPress={handleUpdateProfile}
              >
                <Text className="text-white text-xs">Update Profile</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-blue-100 text-lg capitalize">
              {plan.goal}
            </Text>
          </View>
        )}
      </LinearGradient>

      {plan && (
        <View className="px-6 -mt-6">
          {/* Stats Cards */}
          <View className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <Text className="text-gray-800 text-lg font-semibold mb-4">
              Your Stats
            </Text>
            <View className="flex-row flex-wrap">
              <View className="w-1/2 mb-4">
                <Text className="text-gray-500 text-sm">Age</Text>
                <Text className="text-gray-800 text-xl font-bold">
                  {plan.age} years
                </Text>
              </View>
              <View className="w-1/2 mb-4">
                <Text className="text-gray-500 text-sm">Height</Text>
                <Text className="text-gray-800 text-xl font-bold">
                  {plan.height} cm
                </Text>
              </View>
              <View className="w-1/2 mb-4">
                <Text className="text-gray-500 text-sm">Weight</Text>
                <Text className="text-gray-800 text-xl font-bold">
                  {plan.weight} kg
                </Text>
              </View>
              <View className="w-1/2 mb-4">
                <Text className="text-gray-500 text-sm">BMI</Text>
                <View className="flex-row items-center">
                  <Text className="text-gray-800 text-xl font-bold mr-2">
                    {plan.bmi?.toFixed(1)}
                  </Text>
                  <Text
                    className={`text-sm font-medium ${
                      getBMICategory(plan.bmi || 0).color
                    }`}
                  >
                    {getBMICategory(plan.bmi || 0).category}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Daily Calories */}
          <View className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <Text className="text-gray-800 text-lg font-semibold mb-4">
              Daily Calorie Target
            </Text>
            <View className="items-center">
              <Text className="text-4xl font-bold text-blue-600 mb-2">
                {plan.calories_target}
              </Text>
              <Text className="text-gray-500">calories per day</Text>
            </View>
          </View>

          {/* Macronutrients */}
          <View className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <Text className="text-gray-800 text-lg font-semibold mb-4">
              Macronutrients
            </Text>

            <View className="space-y-4">
              <View className="flex-row justify-between items-center p-4 bg-green-50 rounded-xl">
                <View>
                  <Text className="text-green-800 font-medium">Protein</Text>
                  <Text className="text-green-600 text-sm">
                    {getMacroPercentages().protein}% of calories
                  </Text>
                </View>
                <Text className="text-green-800 text-xl font-bold">
                  {plan.macros.protein}g
                </Text>
              </View>

              <View className="flex-row justify-between items-center p-4 bg-orange-50 rounded-xl">
                <View>
                  <Text className="text-orange-800 font-medium">
                    Carbohydrates
                  </Text>
                  <Text className="text-orange-600 text-sm">
                    {getMacroPercentages().carbs}% of calories
                  </Text>
                </View>
                <Text className="text-orange-800 text-xl font-bold">
                  {plan.macros.carbs}g
                </Text>
              </View>

              <View className="flex-row justify-between items-center p-4 bg-purple-50 rounded-xl">
                <View>
                  <Text className="text-purple-800 font-medium">Fat</Text>
                  <Text className="text-purple-600 text-sm">
                    {getMacroPercentages().fat}% of calories
                  </Text>
                </View>
                <Text className="text-purple-800 text-xl font-bold">
                  {plan.macros.fat}g
                </Text>
              </View>
            </View>
          </View>

          {/* Tips */}
          <View className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <Text className="text-gray-800 text-lg font-semibold mb-4">
              Tips for Success
            </Text>
            <View className="space-y-3">
              {getGoalSpecificTips().map((tip, index) => (
                <Text key={index} className="text-gray-600">
                  {tip}
                </Text>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Profile Update Modal */}
      <Modal
        visible={showUpdateProfileModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowUpdateProfileModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-xl font-bold text-gray-800 mb-6 text-center">
              Update Your Profile
            </Text>

            {/* Age */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Age</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
                value={profileValues.age.toString()}
                onChangeText={(text: string) =>
                  setProfileValues({
                    ...profileValues,
                    age: parseInt(text) || 0,
                  })
                }
                keyboardType="numeric"
                placeholder="Enter your age"
              />
            </View>

            {/* Height */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">
                Height (cm)
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
                value={profileValues.height.toString()}
                onChangeText={(text: string) =>
                  setProfileValues({
                    ...profileValues,
                    height: parseInt(text) || 0,
                  })
                }
                keyboardType="numeric"
                placeholder="Enter your height in cm"
              />
            </View>

            {/* Weight */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">
                Weight (kg)
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
                value={profileValues.weight.toString()}
                onChangeText={(text: string) =>
                  setProfileValues({
                    ...profileValues,
                    weight: parseInt(text) || 0,
                  })
                }
                keyboardType="numeric"
                placeholder="Enter your weight in kg"
              />
            </View>

            {/* Goal */}
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">Goal</Text>
              <View className="border border-gray-300 rounded-lg">
                {[
                  "lose weight",
                  "gain weight",
                  "build_muscle",
                  "maintain weight",
                ].map((goalOption) => (
                  <TouchableOpacity
                    key={goalOption}
                    className={`p-3 ${
                      profileValues.goal === goalOption ? "bg-blue-100" : ""
                    }`}
                    onPress={() =>
                      setProfileValues({ ...profileValues, goal: goalOption })
                    }
                  >
                    <Text
                      className={`capitalize ${
                        profileValues.goal === goalOption
                          ? "text-blue-600 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {goalOption === "build_muscle"
                        ? "Build Muscle"
                        : goalOption}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Buttons */}
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 bg-gray-300 py-3 rounded-lg mr-2"
                onPress={() => setShowUpdateProfileModal(false)}
              >
                <Text className="text-gray-700 font-medium text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-blue-600 py-3 rounded-lg ml-2"
                onPress={handleSaveProfile}
              >
                <Text className="text-white font-medium text-center">
                  Save & Regenerate Plan
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
