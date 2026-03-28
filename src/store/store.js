import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducer';

// Main Redux store: mirrors stock-dashboard shape so
// master controllers/views/grid can work the same way.
export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;

