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
  getUserDataWithProfile,
  updateUserData,
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

interface UserProfile {
  age: number;
  height: number;
  weight: number;
  goal: string;
}

export default function HomeScreen() {
  const { user, token, logout, refreshAuthState, setUser } = useAuth();
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpdateProfileModal, setShowUpdateProfileModal] = useState(false);
  const [showUpdateUserModal, setShowUpdateUserModal] = useState(false);
  const [profileValues, setProfileValues] = useState({
    age: 0,
    height: 0,
    weight: 0,
    goal: "",
  });
  const [userValues, setUserValues] = useState({
    name: "",
    email: "",
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
      build_muscle: [
        "• Prioritize protein intake (aim for 35% of calories)",
        "• Eat in a slight calorie surplus",
        "• Focus on progressive overload in training",
        "• Get adequate sleep for recovery",
        "• Include post-workout protein",
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
      console.log("User and token available, loading data...");
      loadUserData();
    }
  }, [user, token]);

  const loadUserData = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);

      // Check if we have user and token, if not wait a bit and retry
      if (!user || !token) {
        if (retryCount < 3) {
          console.log(
            `Auth not ready, retrying in 1 second... (attempt ${
              retryCount + 1
            })`
          );
          setTimeout(() => loadUserData(retryCount + 1), 1000);
          return;
        } else {
          setError(
            "Authentication data not available. Please try logging in again."
          );
          setLoading(false);
          return;
        }
      }

      console.log(
        "Loading user data and nutrition plan for user:",
        user.id,
        "with token:",
        token ? "present" : "missing"
      );

      // Load user profile data first
      const userDataResponse = await getUserDataWithProfile(token);
      if (userDataResponse.data) {
        const { user: userData, profile } = userDataResponse.data;

        // Update user data in context if it's different
        if (
          userData &&
          (userData.name !== user.name || userData.email !== user.email)
        ) {
          await setUser(userData);
        }

        // Set profile data
        if (profile) {
          setUserProfile(profile);
        }
      }

      // Load nutrition plan
      await loadNutritionPlan();
    } catch (error) {
      console.error("Error loading user data:", error);
      setError("Failed to load your data");
    } finally {
      setLoading(false);
    }
  };

  const loadNutritionPlan = async () => {
    try {
      // First try to get existing plan
      const planResponse = await getUserPlan(user!.id, token);

      // Check if there was an actual error (not just "no plans found")
      if (planResponse.error) {
        console.error("Error getting user plan:", planResponse.error);
        setError("Failed to load your nutrition plan");
        return;
      }

      if (planResponse.data && planResponse.data.plans) {
        setPlan(planResponse.data.plans.plan_data);
      } else {
        // No plan exists (normal for new users), generate one
        console.log("No existing plan found, generating new plan...");
        await generateNewPlan();
      }
    } catch (error) {
      console.error("Error loading plan:", error);
      setError("Failed to load your nutrition plan");
    }
  };

  const generateNewPlan = async () => {
    try {
      const generateResponse = await generatePlan(user!.id, token);

      if (generateResponse.data && generateResponse.data.plan) {
        setPlan(generateResponse.data.plan.plan_data);
      } else {
        console.error("Plan generation failed:", generateResponse.error);
        setError(generateResponse.error || "Failed to generate plan retry");
      }
    } catch (error) {
      console.error("Error generating plan:", error);
      setError("Failed to generate your nutrition plan retry");
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

  const handleUpdateUser = async () => {
    // Load current user data first
    setUserValues({
      name: user?.name || "",
      email: user?.email || "",
    });
    setShowUpdateUserModal(true);
  };

  const handleSaveUser = async () => {
    try {
      setLoading(true);

      // Update the user data
      const response = await updateUserData(userValues, token);

      if (response.data) {
        // User updated successfully
        Alert.alert(
          "User Info Updated",
          "Your user information has been updated successfully.",
          [
            {
              text: "OK",
              onPress: async () => {
                setShowUpdateUserModal(false);
                // Update the user in context
                if (response.data.user) {
                  await setUser(response.data.user);
                }
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", response.error || "Failed to update user info");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      Alert.alert("Error", "Failed to update your user information");
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
      <View className="flex-1 justify-center items-center bg-gray-300">
        <ActivityIndicator size="large" color="#BB2121" />
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
        <View className="space-y-3">
          <TouchableOpacity
            className="bg-blue-600 px-6 py-3 rounded-lg"
            onPress={() => loadUserData()}
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-green-600 px-6 py-3 rounded-lg"
            onPress={async () => {
              setLoading(true);
              await refreshAuthState();
              setTimeout(() => loadUserData(), 1000);
            }}
          >
            <Text className="text-white font-medium">Refresh Auth & Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-red-600 px-6 py-3 rounded-lg"
            onPress={handleLogout}
          >
            <Text className="text-white font-medium">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <LinearGradient
        colors={["#BB2121", "#BB2121"]}
        className="px-6 py-8 pb-12"
      >
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">
              Hello, {user?.name || "User"}!
            </Text>
            <Text className="text-blue-100 text-sm">
              {user?.email || "user@example.com"}
            </Text>
            <Text className="text-blue-100">
              Welcome to your nutrition plan
            </Text>
          </View>
          <View className="space-y-2 flex gap-2">
            <TouchableOpacity
              className="bg-white px-3 py-2 rounded-lg"
              onPress={handleUpdateUser}
            >
              <Text className="text-[#BB2121] text-base">Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white/20 px-4 py-2 rounded-lg flex items-center"
              onPress={handleLogout}
            >
              <Text className="text-white text-sm">Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {plan && (
          <View className="bg-white/10 rounded-2xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-xl font-medium">Your Goal</Text>
              <TouchableOpacity
                className="bg-white px-3 py-2 rounded-lg"
                onPress={handleUpdateProfile}
              >
                <Text className="text-[#BB2121] text-xs">Update Profile</Text>
              </TouchableOpacity>
            </View>
            <View className="bg-white/2 rounded-xl p-4 items-center">
              <Text className="text-white font-bold text-lg capitalize">
                Goal : {plan.goal}
              </Text>
            </View>
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
                  {userProfile?.age || plan?.age || "N/A"} years
                </Text>
              </View>
              <View className="w-1/2 mb-4">
                <Text className="text-gray-500 text-sm">Height</Text>
                <Text className="text-gray-800 text-xl font-bold">
                  {userProfile?.height || plan?.height || "N/A"} cm
                </Text>
              </View>
              <View className="w-1/2 mb-4">
                <Text className="text-gray-500 text-sm">Weight</Text>
                <Text className="text-gray-800 text-xl font-bold">
                  {userProfile?.weight || plan?.weight || "N/A"} kg
                </Text>
              </View>
              <View className="w-1/2 mb-4">
                <Text className="text-gray-500 text-sm">Goal</Text>
                <Text className="text-gray-800 text-xl font-bold capitalize">
                  {userProfile?.goal || plan?.goal || "N/A"}
                </Text>
              </View>
              {plan?.bmi && (
                <View className="w-full mb-4">
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
              )}
            </View>
          </View>

          {/* Daily Calories */}
          <View className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <Text className="text-gray-800 text-lg font-semibold mb-4">
              Daily Calorie Target
            </Text>
            <View className="items-center">
              <Text className="text-4xl font-bold text-[#BB2121] mb-2">
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
                className="flex-1 bg-[#BB2121] py-3 rounded-lg ml-2"
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

      {/* User Info Update Modal */}
      <Modal
        visible={showUpdateUserModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowUpdateUserModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-xl font-bold text-gray-800 mb-6 text-center">
              Update User Info
            </Text>

            {/* Name */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Name</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
                value={userValues.name}
                onChangeText={(text: string) =>
                  setUserValues({
                    ...userValues,
                    name: text,
                  })
                }
                placeholder="Enter your name"
              />
            </View>

            {/* Email */}
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">Email</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
                value={userValues.email}
                onChangeText={(text: string) =>
                  setUserValues({
                    ...userValues,
                    email: text,
                  })
                }
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Buttons */}
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 bg-gray-300 py-3 rounded-lg mr-2"
                onPress={() => setShowUpdateUserModal(false)}
              >
                <Text className="text-gray-700 font-medium text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-[#BB2121] py-3 rounded-lg ml-2"
                onPress={handleSaveUser}
              >
                <Text className="text-white font-medium text-center">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
