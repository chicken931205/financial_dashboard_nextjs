import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
    password: string;
    isLogin: boolean;
}

const initialState: AppState = {
    password: '',    
    isLogin: false,
};

export const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
      setPassword(state, action: PayloadAction<string>) {
          state.password = action.payload;
      },
      setIsLogin(state, action: PayloadAction<boolean>) {
          state.isLogin = action.payload;
      }
    },
  });
  
  export const { setPassword } = appSlice.actions;
  export const { setIsLogin } = appSlice.actions;