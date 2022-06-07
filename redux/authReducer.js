import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

//Initial values
const initialState = {
  loggedIn: false,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
  authUser: null,
  userInfo: null,
};

//ASYNC FUNCTIONS
//Register
export const register = createAsyncThunk("auth/register", async (data, thunkAPI) => {
    //TODO
  }
);

//Login
export const login = createAsyncThunk("auth/login", async (data, thunkAPI) => {
    //TODO
  }
);

//Logout
export const logout = createAsyncThunk("auth/logout", () => {
    //TODO
  }
);

//State management for variables associated with auth, login, and user information
export const authReducer = createSlice({
  name: "auth",
  initialState,
  reducers: {
    //Updates the user session, user information, and logged in variable
    changeUserStatus: (state, action) => {
      state.authUser = action.payload.authUser;
      state.userInfo = action.payload.userInfo;
      state.loggedIn = true;
    },
    //Updates user email verification status to true
    setUserVerified: (state) => {
      //change email verification
      state.user.verified = true;
    },
    //Resets the response states after the server responds
    resetState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      //register is loading
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      //Successful register
      .addCase(register.fulfilled, (state, action) => {
        console.log("successful register");
        state.isLoading = false;
        state.isSuccess = true;
        state.loggedIn = true;
        state.authUser = action.payload.authUser;
        state.userInfo = action.payload.userInfo;
      })
      //Failed register
      .addCase(register.rejected, (state, action) => {
        console.log('register failed');
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.authUser = null;
        state.userInfo = null;
      })

      //Login is loading
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      //Successful login
      .addCase(login.fulfilled, (state, action) => {
        console.log("login success");
        state.isLoading = false;
        state.isSuccess = true;
        state.loggedIn = true;
        state.authUser = action.payload.authUser;
        state.userInfo = action.payload.userInfo;
      })
      //Failed login
      .addCase(login.rejected, (state, action) => {
        console.log("login fail");
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.accessToken = null;
      })

      //Successful logout
      .addCase(logout.fulfilled, (state) => {
        console.log("logout");
        state.authUser = null;
        state.userInfo = null;
        state.loggedIn = false;
      });
  },
});

export const { changeUserStatus, resetState, setUserVerified } = authReducer.actions;
export default authReducer.reducer;