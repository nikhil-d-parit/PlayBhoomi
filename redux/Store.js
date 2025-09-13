import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/slices/AuthSlice';
import userReducer from '../redux/slices/UserSlice';
import dashboardReducer from './slices/DashboardSlice';
import ruleReducer from './slices/RulesSlice';
import amenitiesReducer from './slices/AmenitiesSlice';
import venderReducer from './slices/VenderSlice';
import venuesReducer from "./slices/VenuesSlice";
const Store = configureStore({
  reducer: {
    auth: authReducer,
    user:userReducer,
    dashboard:dashboardReducer,
    rules:ruleReducer,
    amenities:amenitiesReducer,
    vender: venderReducer,
    venues: venuesReducer,

  },
});

export default Store;
