// 永続化のため
import { applyMiddleware, createStore } from "redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import rootReducer from "./rootReducer";

const persistConf = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConf, rootReducer);

export const store = createStore(persistedReducer, applyMiddleware());

export const persistor = persistStore(store);
