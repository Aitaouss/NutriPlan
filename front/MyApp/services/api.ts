// API service for NutriPlan backend
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://348969df1460.ngrok-free.app"; // Change this to your backend URL

// Constants for storage keys
const TOKEN_KEY = "userToken";
const USER_KEY = "userData";

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
  token?: string
): Promise<ApiResponse<any>> => {
  try {
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

    if (!response.ok) {
      return { error: data.error || "Plan generation failed" };
    }

    return { data };
  } catch (error) {
    return { error: "Network error. Please try again." };
  }
};

// Get User Plan Route
export const getUserPlan = async (
  userId: number,
  token: string | null
): Promise<ApiResponse<any>> => {
  try {
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

    if (!response.ok) {
      return { error: data.error || "Failed to get plan" };
    }

    return { data };
  } catch (error) {
    console.error("Get plan error:", error);
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
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    console.log("All stored data cleared");
  } catch (error) {
    console.error("Error clearing stored data:", error);
  }
};

// Login Route (add this to your backend routes)
export const loginUser = async (credentials: {
  email: string;
  password: string;
}): Promise<ApiResponse<any>> => {
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
