// config.js - Load environment variables
// For Expo apps, we can use a simple approach

// Read from .env file during development
// You can change this manually or use environment-specific builds
const getEnvVars = () => {
  // Default to local development
  return {
    API_URL: process.env.EXPO_PUBLIC_API_URL  || 'http://localhost:5000/api/admin',
  };
};

export default getEnvVars();
