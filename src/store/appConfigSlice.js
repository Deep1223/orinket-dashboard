import { createSlice } from '@reduxjs/toolkit';
import IISMethods from '../utils/IISMethods';

// Slice that reflects IISMethods.js config into Redux state
const appConfigSlice = createSlice({
  name: 'appConfig',
  initialState: {
    baseUrl: IISMethods.getBaseUrl(),     // resolved domain from IISMethods
  },
  reducers: {
    // If you change IISMethods.js and reload, this stays in sync automatically.
    // Use this action only if you ever change IISMethods at runtime.
    refreshFromConfig(state) {
      state.baseUrl = IISMethods.getBaseUrl();
    },
  },
});

export const { refreshFromConfig } = appConfigSlice.actions;

export default appConfigSlice.reducer;

