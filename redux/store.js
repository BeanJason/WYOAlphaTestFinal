import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authReducer";
import jobsReducer  from "./jobsReducer";

//Initialize the state management store with the reducer
const Store = configureStore({
    reducer: {
       auth: authReducer,
       jobs: jobsReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
})

export default Store