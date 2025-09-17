# NutriPlan - Personal Nutrition and Meal Planning App

A comprehensive mobile application built with React Native (Expo) and Node.js backend that provides personalized nutrition plans based on user profiles and goals.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Application Flow](#application-flow)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Development](#development)
- [API Documentation](#api-documentation)

## 🌟 Overview

NutriPlan is a mobile-first nutrition planning application that creates personalized meal plans and tracks nutritional goals. The app calculates BMI, determines caloric needs based on user goals, and provides macro breakdowns with goal-specific nutritional advice.

## ✨ Features

### User Management
- **User Registration & Authentication**: JWT-based authentication system
- **Profile Management**: Update personal information (name, email)
- **Secure Password Management**: Bcrypt password hashing

### Nutrition Planning
- **Personalized Plans**: Generated based on age, height, weight, and fitness goals
- **BMI Calculation**: Automatic BMI calculation and categorization
- **Caloric Target**: BMR-based calorie calculation with goal adjustments
- **Macro Distribution**: Protein, carbohydrates, and fat breakdown
- **Goal-Specific Tips**: Customized advice based on user objectives

### Profile & Onboarding
- **Comprehensive Onboarding**: Collect user physical stats and goals
- **Profile Updates**: Modify physical stats and regenerate nutrition plans
- **Goal Setting**: Support for weight loss, weight gain, muscle building, and maintenance

## 🛠 Technology Stack

### Frontend (Mobile App)
- **React Native** with Expo SDK 54
- **Expo Router** for navigation
- **TypeScript** for type safety
- **NativeWind** (Tailwind CSS for React Native) for styling
- **Expo Linear Gradient** for UI enhancements
- **AsyncStorage** for local data persistence

### Backend (API Server)
- **Node.js** with TypeScript
- **Fastify** web framework
- **SQLite3** database with sqlite driver
- **JWT** for authentication
- **Bcrypt** for password hashing
- **CORS** enabled for cross-origin requests

## 📁 Project Structure

```
NutriPlan/
├── backend/                    # Node.js API Server
│   ├── db/
│   │   ├── database.db        # SQLite database file
│   │   └── struct.sql         # Database schema
│   ├── routes/
│   │   ├── registerRoutes.ts  # Auth endpoints (login/signup)
│   │   ├── UserRoutes.ts      # User management endpoints
│   │   ├── onboardingRoutes.ts # Profile management
│   │   ├── PlanRoutes.ts      # Nutrition plan endpoints
│   │   └── admin.ts           # Admin utilities
│   ├── server.ts              # Main server file
│   └── package.json
│
└── front/MyApp/               # React Native Mobile App
    ├── app/
    │   ├── (tabs)/
    │   │   ├── index.tsx      # Home screen with nutrition dashboard
    │   │   └── _layout.tsx    # Tab navigation layout
    │   ├── index.tsx          # Welcome screen
    │   ├── login.tsx          # Login screen
    │   ├── signup.tsx         # Registration screen
    │   └── onboarding.tsx     # Profile setup screen
    ├── contexts/
    │   └── AuthContext.tsx    # Authentication state management
    ├── services/
    │   └── api.ts             # API communication layer
    └── package.json
```

## 🗄 Database Schema

### Users Table
```sql
users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT (bcrypt hashed)
)
```

### Profiles Table
```sql
profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER FOREIGN KEY,
  height REAL (cm),
  weight REAL (kg),
  goal TEXT,
  age INTEGER
)
```

### Plans Table
```sql
plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER FOREIGN KEY,
  plan_data TEXT (JSON),
  bmi REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## 🚀 API Endpoints

### Authentication Routes (`/`)
| Method | Endpoint | Description | Body Parameters |
|--------|----------|-------------|-----------------|
| POST | `/signup` | Register new user | `username`, `email`, `password` |
| POST | `/login` | User login | `email`, `password` |

### User Management (`/user`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/user` | Get current user info | ✅ |
| GET | `/user/profile` | Get user with profile data | ✅ |
| PUT | `/user` | Update user info (name/email) | ✅ |
| PUT | `/user/password` | Update user password | ✅ |

### Profile Management (`/onboarding`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/onboarding` | Create user profile | ✅ |
| GET | `/onboarding` | Get user profile | ✅ |
| PUT | `/onboarding` | Update user profile | ✅ |

### Nutrition Plans (`/plans`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/plans` | Generate nutrition plan | ✅ |
| GET | `/plans?user_id={id}&latest=true` | Get user's plans | ✅ |
| PUT | `/plans/:id` | Update specific plan | ✅ |

### Admin Routes (`/admin`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/users` | List all users (admin only) | ✅ |

## 🔐 Authentication Flow

1. **Registration**: User provides username, email, password
2. **Email Validation**: Backend validates email domain via DNS lookup
3. **Password Hashing**: Bcrypt hashes password before storage
4. **JWT Token**: Server generates JWT token upon successful auth
5. **Token Storage**: Frontend stores token in AsyncStorage
6. **Request Authentication**: Token sent in Authorization header for protected routes

## 📱 Application Flow

### New User Journey
1. **Welcome Screen** → Choose "Sign Up"
2. **Registration** → Provide credentials
3. **Onboarding** → Input physical stats and goals
4. **Plan Generation** → Automatic nutrition plan creation
5. **Dashboard** → View personalized nutrition information

### Returning User Journey
1. **Auto-login** → Check stored credentials
2. **Profile Check** → Verify onboarding completion
3. **Dashboard** → Load existing nutrition plan

### Core Features Flow
```
User Login → Profile Check → Plan Generation → Dashboard Display
                ↓
         Profile Updates → Plan Regeneration → Updated Dashboard
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Backend Setup
```bash
cd backend
npm install
npm run dev  # Development server on port 9000
```

### Frontend Setup
```bash
cd front/MyApp
npm install
npx expo start  # Start Expo development server
```

## 🌍 Environment Variables

### Backend (.env)
```env
PORT=9000
JWT_SECRET=supersecret
DB_PATH=./db/database.db
```

### Frontend
Update `API_BASE_URL` in `services/api.ts`:
```typescript
const API_BASE_URL = "http://your-backend-url:9000";
```

## 📖 Usage

### Starting the Application

1. **Start Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Mobile App**:
   ```bash
   cd front/MyApp
   npx expo start
   ```

3. **Access the App**:
   - Scan QR code with Expo Go app
   - Or run on simulator/emulator

### User Workflow

1. **Registration/Login**: Create account or sign in
2. **Onboarding**: Complete profile with physical stats
3. **View Dashboard**: See personalized nutrition plan
4. **Update Profile**: Modify stats to regenerate plan
5. **User Settings**: Update personal information

## 🔧 Development

### Backend Development
- **Hot Reload**: `nodemon` watches for TypeScript changes
- **Database**: SQLite with automatic schema creation
- **API Testing**: Use Postman or similar tools

### Frontend Development
- **Hot Reload**: Expo development server
- **Debugging**: React Native debugger
- **Styling**: NativeWind (Tailwind CSS)

### Key Development Commands

```bash
# Backend
npm run dev        # Start development server
npm run build      # Build TypeScript
npm run start      # Start production server

# Frontend
npx expo start     # Start development server
npx expo start --android  # Run on Android
npx expo start --ios      # Run on iOS
npx expo start --web      # Run on web
```

## 📚 API Documentation

### Authentication Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Response Format
```json
{
  "message": "Success message",
  "data": { ... },
  "error": "Error message (if applicable)"
}
```

### Nutrition Plan Data Structure
```json
{
  "goal": "lose weight",
  "age": 25,
  "height": 175,
  "weight": 70,
  "bmi": 22.9,
  "calories_target": 2000,
  "macros": {
    "protein": 150,
    "carbs": 200,
    "fat": 67
  }
}
```

### Error Codes
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Invalid or missing token
- `404`: Not Found - Resource doesn't exist
- `500`: Internal Server Error - Server-side error

## 🎯 Key Features Explained

### BMI Calculation
Uses the standard formula: `weight(kg) / (height(m))²`

### Calorie Calculation
Based on Mifflin-St Jeor Equation:
- **Men**: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
- **Women**: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161

### Goal-Based Adjustments
- **Weight Loss**: -500 calories from BMR
- **Weight Gain**: +500 calories from BMR
- **Muscle Building**: +500 calories from BMR
- **Maintenance**: BMR × activity factor (1.2 for sedentary)

### Macro Distribution
Varies by goal:
- **Weight Loss**: 30% protein, 40% carbs, 30% fat
- **Weight Gain**: 25% protein, 50% carbs, 25% fat
- **Muscle Building**: 35% protein, 40% carbs, 25% fat
- **Maintenance**: 25% protein, 45% carbs, 30% fat

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**NutriPlan** - Your Personal Nutrition Planning Assistant
