import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Auth } from "aws-amplify";
import { DataStore } from "aws-amplify";
import {User} from "../src/models"

//Initial values
const initialState = {
  loggedIn: false,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
  authID: null,
  userInfo: null,
  type: null
};

//ASYNC FUNCTIONS
//Register
export const register = createAsyncThunk("auth/register", async (data, thunkAPI) => {
    const {email, password} = data
    let authUser, userData
    let message = ''    
    
    //Try to make a user session
    try {
      authUser = await Auth.signUp({username: email, password, attributes:{email, 'custom:type': data.type}});
    } catch (error) {
      message = error.message;
      console.log(message);
      return thunkAPI.rejectWithValue(message);
    }

    //Try to store in DB if successful
    if(message == ''){
      if(data.type === 'User'){
        try {
          userData = await DataStore.save(
              new User({
              "subID": authUser?.userSub,
              "firstName": data.firstName,
              "lastName": data.lastName,
              "email": email,
              "phoneNumber": data.phoneNumber,
              "dateOfBirth": data.dateOfBirth,
              "address": data.address,
              "city": data.city,
              "zipCode": data.zipCode
            })
          );
        } catch (error) {
          message = error.message;
          console.log(message);
          return thunkAPI.rejectWithValue(message);
        }
      }
      else if(data.type === 'Provider'){
        //TODO
      }
      
    }

    //if everything succeeds
    let userInfo = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      address: userData.address,
      city: userData.city,
      zipCode: userData.zipCode,
      type: authUser.user.getUserAttributes['custom:type']
    }
    return {authUser , userInfo}
  }
);

//Login
export const login = createAsyncThunk("auth/login", async (data, thunkAPI) => {

    try {
      const authUser = await Auth.signIn({username: data.email, password: data.password})
      const user = await Auth.currentUserInfo();
      //get user info from db
      const userData = await DataStore.query(User, u => u.subID('eq', user.attributes.sub))
      const userInfo = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        address: userData.address,
        city: userData.city,
        zipCode: userData.zipCode,
        type: user.attributes['custom:type']
      }
      return {authUser: user, userInfo}
    } catch (error) {
      const message = error.message;
      console.log(error);
      return thunkAPI.rejectWithValue(message);
    }

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
      state.authID = action.payload.authUser.userSub;
      state.userInfo = action.payload.userInfo;
      state.type = action.payload.authUser
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
        state.authID = action.payload.authUser.userSub;
        state.userInfo = action.payload.userInfo;
        state.type = action.payload.userInfo.type;
      })
      //Failed register
      .addCase(register.rejected, (state, action) => {
        console.log('register failed');
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.authID = null;
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
        state.authID = action.payload.authUser.sub;
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
        state.authID = null;
        state.userInfo = null;
        state.loggedIn = false;
      });
  },
});

export const { changeUserStatus, resetState, setUserVerified } = authReducer.actions;
export default authReducer.reducer;