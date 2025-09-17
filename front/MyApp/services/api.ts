// API service for NutriPlan backend
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://8bcf4f6c26b0.ngrok-free.app"; // Change this to your backend URL

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
