import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authReducer";
import jobsProviderReducer from "./jobsProviderReducer";
import jobsReducer  from "./jobsReducer";

//Initialize the state management store with the reducer
const Store = configureStore({
    reducer: {
       auth: authReducer,
       jobs: jobsReducer,
       providerJobs: jobsProviderReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
})

export default Store