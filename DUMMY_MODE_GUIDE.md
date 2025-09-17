# NutriPlan Dummy Mode Guide

## Overview

The NutriPlan app now includes a **Dummy Mode** feature that allows you to test the application without needing a live backend server. This is perfect for development, testing, and demonstration purposes.

## How to Enable/Disable Dummy Mode

### Enable Dummy Mode

1. Open `front/MyApp/services/api.ts`
2. Find the line: `const ENABLE_DUMMY_MODE = true;`
3. Set it to `true` to enable dummy mode

### Disable Dummy Mode

1. Open `front/MyApp/services/api.ts`
2. Find the line: `const ENABLE_DUMMY_MODE = true;`
3. Set it to `false` to use the real backend

## Dummy User Credentials

When dummy mode is enabled, you can log in using these test credentials:

- **Email**: `test@gmail.com`
- **Password**: `test123@`
- **Name**: `test`

## What Works in Dummy Mode

### ✅ Fully Functional Features:

- **User Registration**: Creates a dummy user account
- **User Login**: Authenticates with test credentials
- **Onboarding**: Complete profile setup with age, height, weight, and goals
- **Profile Management**: View and update user profile information
- **User Data Updates**: Change name and email
- **Nutrition Plan Generation**: Automatic calculation based on profile data
- **Plan Viewing**: Display personalized nutrition plans with BMI, calories, and macros
- **Profile Updates**: Modify physical stats and automatically regenerate nutrition plans
- **Data Persistence**: Profile and plan data are stored locally and persist between app sessions

### 🔧 How It Works:

- **Local Storage**: All data is stored in AsyncStorage on your device
- **Real Calculations**: BMI, calorie targets, and macro distributions are calculated using real formulas
- **Network Simulation**: Includes realistic delays to simulate API responses
- **Automatic Plan Updates**: When you update your profile, the nutrition plan is automatically recalculated

## Dummy Data Structure

### Default Profile Data:

```json
{
  "age": 25,
  "height": 175,
  "weight": 70,
  "goal": "lose weight"
}
```

### Sample Nutrition Plan:

```json
{
  "goal": "lose weight",
  "bmi": 22.9,
  "bmi_category": "Normal",
  "calories_target": 1500,
  "macros": {
    "protein": 112,
    "carbs": 150,
    "fat": 50
  },
  "tips": [
    "Focus on creating a moderate calorie deficit",
    "Prioritize protein to maintain muscle mass",
    "Include plenty of vegetables for nutrients and satiety",
    "Stay hydrated and get adequate sleep"
  ]
}
```

## Testing Scenarios

### Complete User Journey:

1. **Registration**: Sign up with any credentials
2. **Onboarding**: Set your physical stats and fitness goals
3. **Dashboard**: View your personalized nutrition plan
4. **Profile Updates**: Change your stats and see the plan update automatically
5. **User Settings**: Update your name and email
6. **Logout**: Clear all data and start fresh

### Different Goals Testing:

You can test different fitness goals and see how the nutrition plan adapts:

- **Lose Weight**: Lower calories, higher protein ratio
- **Gain Weight**: Higher calories, higher carb ratio
- **Build Muscle**: Higher calories with high protein
- **Maintain Weight**: Balanced macro distribution

## Development Benefits

### 🚀 Faster Development:

- No need to start the backend server
- Instant API responses (with simulated delays)
- Work offline or without network connectivity

### 🧪 Reliable Testing:

- Consistent data for testing UI components
- No external dependencies
- Predictable responses for automated testing

### 📱 Demo Ready:

- Perfect for demonstrations
- No backend setup required for clients
- Realistic data and interactions

## Technical Implementation

### Smart Fallback System:

The dummy mode uses a intelligent fallback system that:

1. Checks if dummy mode is enabled
2. If enabled, returns dummy data with realistic delays
3. If disabled, makes real API calls to the backend
4. Handles all the same data structures as the real API

### Real Nutrition Calculations:

- **BMI Calculation**: `weight(kg) / (height(m))²`
- **BMR Calculation**: Uses Mifflin-St Jeor Equation
- **Calorie Adjustments**: Goal-based modifications (+/- 500 calories)
- **Macro Distribution**: Percentage-based protein/carbs/fat ratios

## Console Logging

When dummy mode is active, you'll see helpful console messages:

- `🔧 DUMMY MODE: Using offline [operation]`
- `✅ DUMMY MODE: [operation] successful`
- `❌ DUMMY MODE: [operation] failed`

This makes it easy to track when dummy mode is being used during development.

## Switching Between Modes

### For Development:

- Keep dummy mode **ON** when developing UI features
- Turn dummy mode **OFF** when testing backend integration

### For Production:

- Always set dummy mode to **OFF** before building for production
- The app will automatically use the real backend API

## Data Storage

### Dummy Mode Data Keys:

- `dummyProfile`: Stores user profile data
- `dummyPlan`: Stores nutrition plan data
- Standard `userToken` and `userData` keys are still used

### Clearing Data:

The logout function automatically clears both real and dummy data, ensuring a clean state when switching between modes.

---

**Note**: Dummy mode is designed for development and testing purposes. Always ensure it's disabled in production builds to use the real backend API.
