"use client";

import { configureStore } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { useSelector, TypedUseSelectorHook, useDispatch } from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';
import { appSlice  } from './slice';

const persistConfig = {
    key: 'root',
    storage,
};

const persistedReducer = persistReducer(persistConfig, appSlice.reducer);

export const store = configureStore({
  reducer: {
    app: persistedReducer,
  },
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
