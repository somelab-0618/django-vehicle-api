import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import vehicleReducer from '../features/vehicleSlice';

export const store = configureStore({
  reducer: {
    // 'auth'はauthSliceのnameと一致していないといけない
    auth: authReducer,
    vehicle: vehicleReducer,
  },
});
