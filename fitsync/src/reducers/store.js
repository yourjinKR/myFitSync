// store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storageSession from 'redux-persist/lib/storage/session'; // 세션 스토리지 사용
// import storage from 'redux-persist/lib/storage'; // 로컬 스토리지 사용 시

import userReducer from './userReducer'; // 사용자 Slice

// persist 설정
const persistConfig = {
  key: 'root',
  storage: storageSession, // 또는 storage (localStorage)
  whitelist: ['user']       // 저장할 리듀서 목록 (user만 저장)
};

// persistReducer로 감싸기
const persistedReducer = persistReducer(persistConfig, userReducer);

export const store = configureStore({
  reducer: {
    user: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // redux-persist가 사용하는 non-serializable 객체 허용
    }),
});

export const persistor = persistStore(store);
