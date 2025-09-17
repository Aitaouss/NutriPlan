// API service for NutriPlan backend
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://8bcf4f6c26b0.ngrok-free.app"; // Change this to your backend URL

// Constants for storage keys
const TOKEN_KEY = "userToken";
const USER_KEY = "userData";
const DUMMY_PROFILE_KEY = "dummyProfile";
const DUMMY_PLAN_KEY = "dummyPlan";

// Enable dummy mode when backend is not available
const ENABLE_DUMMY_MODE = true; // Set to false when backend is hosted

// Dummy data for offline testing
const DUMMY_USER = {
  id: 1,
  name: "test",
  email: "test@gmail.com",
};

const DUMMY_TOKEN = "dummy-jwt-token-for-testing";

const DUMMY_PROFILE = {
  id: 1,
  user_id: 1,
  age: 25,
  height: 175, // cm
  weight: 70, // kg
  goal: "lose weight",
};

const DUMMY_PLAN = {
  goal: "lose weight",
  age: 25,
  height: 175,
  weight: 70,
  bmi: 22.9,
  bmi_category: "Normal",
  calories_target: 1500,
  macros: {
    protein: 112, // 30% of calories
    carbs: 150, // 40% of calories
    fat: 50, // 30% of calories
  },
  tips: [
    "Focus on creating a moderate calorie deficit",
    "Prioritize protein to maintain muscle mass",
    "Include plenty of vegetables for nutrients and satiety",
    "Stay hydrated and get adequate sleep",
  ],
};

// Helper function to check if we should use dummy mode
const shouldUseDummyMode = () => {
  return ENABLE_DUMMY_MODE;
};

// Helper function to simulate network delay
const simulateNetworkDelay = (ms = 500) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Dummy storage helpers
const storeDummyProfile = async (profile: any) => {
  try {
    await AsyncStorage.setItem(DUMMY_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Error storing dummy profile:", error);
  }
};

const getDummyProfile = async () => {
  try {
    const profile = await AsyncStorage.getItem(DUMMY_PROFILE_KEY);
    return profile ? JSON.parse(profile) : DUMMY_PROFILE;
  } catch (error) {
    console.error("Error getting dummy profile:", error);
    return DUMMY_PROFILE;
  }
};

const storeDummyPlan = async (plan: any) => {
  try {
    await AsyncStorage.setItem(DUMMY_PLAN_KEY, JSON.stringify(plan));
  } catch (error) {
    console.error("Error storing dummy plan:", error);
  }
};

const getDummyPlan = async () => {
  try {
    const plan = await AsyncStorage.getItem(DUMMY_PLAN_KEY);
    return plan ? JSON.parse(plan) : DUMMY_PLAN;
  } catch (error) {
    console.error("Error getting dummy plan:", error);
    return DUMMY_PLAN;
  }
};

// Function to calculate nutrition plan from profile data
const calculateNutritionPlan = (profile: any) => {
  const { age, height, weight, goal } = profile;

  // Calculate BMI
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  // Determine BMI category
  let bmi_category = "Normal";
  if (bmi < 18.5) bmi_category = "Underweight";
  else if (bmi >= 25 && bmi < 30) bmi_category = "Overweight";
  else if (bmi >= 30) bmi_category = "Obese";

  // Calculate BMR (using Mifflin-St Jeor Equation for average)
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5; // Using male formula as average

  // Adjust calories based on goal
  let calories_target = bmr * 1.2; // Sedentary activity level

  switch (goal) {
    case "lose weight":
      calories_target = bmr * 1.2 - 500;
      break;
    case "gain weight":
      calories_target = bmr * 1.2 + 500;
      break;
    case "build muscle":
      calories_target = bmr * 1.4 + 300; // Higher activity + surplus
      break;
    case "maintain weight":
    default:
      calories_target = bmr * 1.2;
      break;
  }

  // Ensure minimum calories
  calories_target = Math.max(calories_target, 1200);

  // Calculate macros based on goal
  let proteinPercent = 0.25;
  let carbsPercent = 0.45;
  let fatPercent = 0.3;

  switch (goal) {
    case "lose weight":
      proteinPercent = 0.3;
      carbsPercent = 0.4;
      fatPercent = 0.3;
      break;
    case "gain weight":
      proteinPercent = 0.25;
      carbsPercent = 0.5;
      fatPercent = 0.25;
      break;
    case "build muscle":
      proteinPercent = 0.35;
      carbsPercent = 0.4;
      fatPercent = 0.25;
      break;
  }

  const protein = Math.round((calories_target * proteinPercent) / 4); // 4 cal per gram
  const carbs = Math.round((calories_target * carbsPercent) / 4); // 4 cal per gram
  const fat = Math.round((calories_target * fatPercent) / 9); // 9 cal per gram

  // Generate goal-specific tips
  const tips = generateTips(goal, bmi_category);

  return {
    goal,
    age,
    height,
    weight,
    bmi: Math.round(bmi * 10) / 10,
    bmi_category,
    calories_target: Math.round(calories_target),
    macros: {
      protein,
      carbs,
      fat,
    },
    tips,
  };
};

const generateTips = (goal: string, bmiCategory: string) => {
  const baseTips = [
    "Stay hydrated by drinking at least 8 glasses of water daily",
    "Get 7-9 hours of quality sleep each night",
    "Include regular physical activity in your routine",
  ];

  const goalTips: { [key: string]: string[] } = {
    "lose weight": [
      "Create a moderate calorie deficit for sustainable weight loss",
      "Focus on whole, unprocessed foods",
      "Eat plenty of protein to maintain muscle mass",
      "Include fiber-rich vegetables to help you feel full",
    ],
    "gain weight": [
      "Eat frequent, nutrient-dense meals",
      "Include healthy fats like nuts, avocados, and olive oil",
      "Focus on strength training to build muscle",
      "Add healthy snacks between meals",
    ],
    "build muscle": [
      "Prioritize protein intake throughout the day",
      "Time protein consumption around workouts",
      "Include compound exercises in your training",
      "Allow adequate recovery time between workouts",
    ],
    "maintain weight": [
      "Focus on balanced, nutritious meals",
      "Practice portion control",
      "Maintain consistent eating patterns",
      "Listen to your body's hunger and fullness cues",
    ],
  };

  return [...baseTips, ...(goalTips[goal] || goalTips["maintain weight"])];
};

// Types
interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface OnboardingData {
  age: number;
  height: number;
  weight: number;
  goal: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// 1. Register Route
export const registerUser = async (
  userData: RegisterData
): Promise<ApiResponse<any>> => {
  // Check if we should use dummy mode
  if (shouldUseDummyMode()) {
    console.log("🔧 DUMMY MODE: Using offline registration");
    await simulateNetworkDelay();

    // Simulate registration logic
    console.log("✅ DUMMY MODE: Registration successful");
    return {
      data: {
        user: { ...DUMMY_USER, name: userData.username, email: userData.email },
        token: DUMMY_TOKEN,
        message: "User registered successfully (dummy mode)",
      },
    };
  }

  try {
    console.log("Attempting to register user:", userData.email);
    console.log("API URL:", `${API_BASE_URL}/signup`);

    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true", // Skip ngrok browser warning
      },
      body: JSON.stringify(userData),
    });

    console.log("Response status:", response.status);
    const data = await response.json();
    console.log("Response data:", data);

    if (!response.ok) {
      return { error: data.error || "Registration failed" };
    }

    return { data };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Network error. Please try again." };
  }
};

// 2. Onboarding Route
export const submitOnboarding = async (
  onboardingData: OnboardingData,
  token: string | null
): Promise<ApiResponse<any>> => {
  // Check if we should use dummy mode
  if (shouldUseDummyMode()) {
    console.log("🔧 DUMMY MODE: Using offline onboarding");
    await simulateNetworkDelay();

    // Store the profile data locally
    const newProfile = { ...DUMMY_PROFILE, ...onboardingData };
    await storeDummyProfile(newProfile);

    // Generate and store nutrition plan
    const nutritionPlan = calculateNutritionPlan(newProfile);
    await storeDummyPlan(nutritionPlan);

    console.log("✅ DUMMY MODE: Onboarding complete");
    return {
      data: {
        message: "Onboarding complete (dummy mode)",
        profile: newProfile,
      },
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/onboarding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true", // Skip ngrok browser warning
      },
      body: JSON.stringify(onboardingData),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || "Onboarding failed" };
    }

    return { data };
  } catch (error) {
    console.error("Onboarding error:", error);
    return { error: "Network error. Please try again." };
  }
};

// 3. Generate Plan Route
export const generatePlan = async (
  userId: number,
  token?: string | null
): Promise<ApiResponse<any>> => {
  try {
    console.log("generatePlan - Starting request for user:", userId);
    console.log("generatePlan - Token available:", token ? "Yes" : "No");

    const headers: any = {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true", // Skip ngrok browser warning
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/plans`, {
      method: "POST",
      headers,
      body: JSON.stringify({ user_id: userId }),
    });

    const data = await response.json();
    console.log("generatePlan - Response status:", response.status);
    console.log("generatePlan - Response data:", data);

    if (!response.ok) {
      console.error("generatePlan - Request failed:", data.error);
      return { error: data.error || "Plan generation failed" };
    }

    console.log("generatePlan - Success");
    return { data };
  } catch (error) {
    console.error("generatePlan - Network error:", error);
    return { error: "Network error. Please try again." };
  }
};

// Get User Plan Route
export const getUserPlan = async (
  userId: number,
  token: string | null
): Promise<ApiResponse<any>> => {
  // Check if we should use dummy mode
  if (shouldUseDummyMode()) {
    console.log("🔧 DUMMY MODE: Using offline plan");
    await simulateNetworkDelay();

    const plan = await getDummyPlan();
    console.log("✅ DUMMY MODE: Plan retrieved");
    return {
      data: {
        plans: {
          plan_data: plan,
        },
      },
    };
  }

  try {
    console.log("getUserPlan - Starting request for user:", userId);
    console.log("getUserPlan - Token available:", token ? "Yes" : "No");

    if (!token) {
      console.error("getUserPlan - No token provided");
      return { error: "Authentication token not available" };
    }

    const response = await fetch(
      `${API_BASE_URL}/plans?user_id=${userId}&latest=true`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    const data = await response.json();
    console.log("getUserPlan - Response status:", response.status);
    console.log("getUserPlan - Response data:", data);

    if (!response.ok) {
      console.error("getUserPlan - Request failed:", data.error);
      return { error: data.error || "Failed to get plan" };
    }

    console.log("getUserPlan - Success");
    return { data };
  } catch (error) {
    console.error("getUserPlan - Network error:", error);
    return { error: "Network error. Please try again." };
  }
};

// Get User Profile Route
export const getUserProfile = async (
  token: string | null
): Promise<ApiResponse<any>> => {
  // Check if we should use dummy mode
  if (shouldUseDummyMode()) {
    console.log("🔧 DUMMY MODE: Using offline profile");
    await simulateNetworkDelay();

    const profile = await getDummyProfile();
    console.log("✅ DUMMY MODE: Profile retrieved");
    return {
      data: {
        onboardingData: profile,
      },
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/onboarding`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || "Failed to get profile" };
    }

    return { data };
  } catch (error) {
    console.error("Get profile error:", error);
    return { error: "Network error. Please try again." };
  }
};

// Update User Plan Route
export const updatePlan = async (
  planId: number,
  planData: any,
  token: string | null
): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/plans/${planId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ plan_data: planData }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || "Failed to update plan" };
    }

    return { data };
  } catch (error) {
    console.error("Update plan error:", error);
    return { error: "Network error. Please try again." };
  }
};

// Update User Profile Route
export const updateProfile = async (
  profileData: {
    age: number;
    height: number;
    weight: number;
    goal: string;
  },
  token: string | null
): Promise<ApiResponse<any>> => {
  // Check if we should use dummy mode
  if (shouldUseDummyMode()) {
    console.log("🔧 DUMMY MODE: Using offline profile update");
    await simulateNetworkDelay();

    // Update the profile data locally
    const updatedProfile = { ...DUMMY_PROFILE, ...profileData };
    await storeDummyProfile(updatedProfile);

    // Recalculate and store nutrition plan
    const newNutritionPlan = calculateNutritionPlan(updatedProfile);
    await storeDummyPlan(newNutritionPlan);

    console.log("✅ DUMMY MODE: Profile updated and plan regenerated");
    return {
      data: {
        message: "Profile updated successfully (dummy mode)",
        profile: updatedProfile,
      },
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/onboarding`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || "Failed to update profile" };
    }

    return { data };
  } catch (error) {
    console.error("Update profile error:", error);
    return { error: "Network error. Please try again." };
  }
};

// Get User Data Route (from UserRoutes)
export const getUserData = async (
  token: string | null
): Promise<ApiResponse<any>> => {
  // Check if we should use dummy mode
  if (shouldUseDummyMode()) {
    console.log("🔧 DUMMY MODE: Using offline user data");
    await simulateNetworkDelay();

    console.log("✅ DUMMY MODE: User data retrieved");
    return {
      data: {
        user: DUMMY_USER,
      },
    };
  }

  try {
    console.log("getUserData - Starting request");
    console.log("getUserData - Token available:", token ? "Yes" : "No");

    if (!token) {
      console.error("getUserData - No token provided");
      return { error: "Authentication token not available" };
    }

    const response = await fetch(`${API_BASE_URL}/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    const data = await response.json();
    console.log("getUserData - Response status:", response.status);
    console.log("getUserData - Response data:", data);

    if (!response.ok) {
      console.error("getUserData - Request failed:", data.error);
      return { error: data.error || "Failed to get user data" };
    }

    console.log("getUserData - Success");
    return { data };
  } catch (error) {
    console.error("getUserData - Network error:", error);
    return { error: "Network error. Please try again." };
  }
};

// Get User Data with Profile Route (from UserRoutes)
export const getUserDataWithProfile = async (
  token: string | null
): Promise<ApiResponse<any>> => {
  // Check if we should use dummy mode
  if (shouldUseDummyMode()) {
    console.log("🔧 DUMMY MODE: Using offline user data with profile");
    await simulateNetworkDelay();

    const profile = await getDummyProfile();
    console.log("✅ DUMMY MODE: User data with profile retrieved");
    return {
      data: {
        user: DUMMY_USER,
        profile: profile,
      },
    };
  }

  try {
    console.log("getUserDataWithProfile - Starting request");
    console.log(
      "getUserDataWithProfile - Token available:",
      token ? "Yes" : "No"
    );

    if (!token) {
      console.error("getUserDataWithProfile - No token provided");
      return { error: "Authentication token not available" };
    }

    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    const data = await response.json();
    console.log("getUserDataWithProfile - Response status:", response.status);
    console.log("getUserDataWithProfile - Response data:", data);

    if (!response.ok) {
      console.error("getUserDataWithProfile - Request failed:", data.error);
      return { error: data.error || "Failed to get user data with profile" };
    }

    console.log("getUserDataWithProfile - Success");
    return { data };
  } catch (error) {
    console.error("getUserDataWithProfile - Network error:", error);
    return { error: "Network error. Please try again." };
  }
};

// Update User Data Route (from UserRoutes)
export const updateUserData = async (
  userData: {
    name?: string;
    email?: string;
  },
  token: string | null
): Promise<ApiResponse<any>> => {
  // Check if we should use dummy mode
  if (shouldUseDummyMode()) {
    console.log("🔧 DUMMY MODE: Using offline user data update");
    await simulateNetworkDelay();

    // Update the dummy user data in memory (you could store it locally if needed)
    const updatedUser = { ...DUMMY_USER, ...userData };
    console.log("✅ DUMMY MODE: User data updated", updatedUser);
    return {
      data: {
        user: updatedUser,
        message: "User updated successfully (dummy mode)",
      },
    };
  }

  try {
    console.log("updateUserData - Starting request");
    console.log("updateUserData - Token available:", token ? "Yes" : "No");
    console.log("updateUserData - Data:", userData);

    if (!token) {
      console.error("updateUserData - No token provided");
      return { error: "Authentication token not available" };
    }

    const response = await fetch(`${API_BASE_URL}/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log("updateUserData - Response status:", response.status);
    console.log("updateUserData - Response data:", data);

    if (!response.ok) {
      console.error("updateUserData - Request failed:", data.error);
      return { error: data.error || "Failed to update user data" };
    }

    console.log("updateUserData - Success");
    return { data };
  } catch (error) {
    console.error("updateUserData - Network error:", error);
    return { error: "Network error. Please try again." };
  }
};

// Helper function to store token
export const storeToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    console.log("Token stored successfully");
    return token;
  } catch (error) {
    console.error("Error storing token:", error);
    return token;
  }
};

export const getStoredToken = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

// Helper function to store user data
export const storeUserData = async (userData: any) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    console.log("User data stored successfully");
  } catch (error) {
    console.error("Error storing user data:", error);
  }
};

export const getStoredUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

// Helper function to clear all stored data (logout)
export const clearStoredData = async () => {
  try {
    await AsyncStorage.multiRemove([
      TOKEN_KEY,
      USER_KEY,
      DUMMY_PROFILE_KEY,
      DUMMY_PLAN_KEY,
    ]);
    console.log("All stored data cleared (including dummy data)");
  } catch (error) {
    console.error("Error clearing stored data:", error);
  }
};

// Helper function to toggle dummy mode
export const setDummyMode = (enabled: boolean) => {
  // Note: This would require modifying the ENABLE_DUMMY_MODE constant
  // For now, users can manually change the constant at the top of the file
  console.log(`Dummy mode should be ${enabled ? "enabled" : "disabled"}`);
  console.log(
    "To change dummy mode, modify ENABLE_DUMMY_MODE constant in api.ts"
  );
};

// Helper function to check current dummy mode status
export const isDummyModeEnabled = () => {
  return shouldUseDummyMode();
};

// Login Route (add this to your backend routes)
export const loginUser = async (credentials: {
  email: string;
  password: string;
}): Promise<ApiResponse<any>> => {
  // Check if we should use dummy mode
  if (shouldUseDummyMode()) {
    console.log("🔧 DUMMY MODE: Using offline login");
    await simulateNetworkDelay();

    // Check dummy credentials
    if (
      credentials.email === "test@gmail.com" &&
      credentials.password === "test123@"
    ) {
      console.log("✅ DUMMY MODE: Login successful");
      return {
        data: {
          user: DUMMY_USER,
          token: DUMMY_TOKEN,
          message: "Login successful (dummy mode)",
        },
      };
    } else {
      console.log("❌ DUMMY MODE: Invalid credentials");
      return { error: "Invalid email or password" };
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true", // Skip ngrok browser warning
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || "Login failed" };
    }

    return { data };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Network error. Please try again." };
  }
};
