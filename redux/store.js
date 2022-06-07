import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authReducer";

//Initialize the state management store with the reducer
export const Store = configureStore({
    reducer: {
       auth: authReducer
    }
})