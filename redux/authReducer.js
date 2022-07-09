import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Auth } from "aws-amplify";
import { DataStore } from "aws-amplify";
import { checkCredentials } from "../credentials";
import {User, Provider} from "../src/models"

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
    const {email, password} = data
    let authUser, userData, userInfo
    let message = ''    
    //Try to make a user session
    try {
      authUser = await Auth.signUp({username: email, password, attributes:{email, 'custom:type': data.type}});
    } catch (error) {
      message = error.message;
      return thunkAPI.rejectWithValue(message);
    }

    //Try to store in DB if successful
    if(message == ''){
        try {
          //If User
          if(data.type === 'User'){
            userData = await DataStore.save(
                new User({
                "subID": authUser?.userSub,
                "expoToken": data.expoToken,
                "firstName": data.firstName,
                "lastName": data.lastName,
                "email": email,
                "phoneNumber": data.phoneNumber,
                "dateOfBirth": data.dateOfBirth,
                "address": data.address,
                "contactMethod": "phone"
              })
            );
          }
          //If Provider
          else if(data.type === 'Provider'){
            console.log('Registering provider');
            userData = await DataStore.save(
              new Provider({
                  "subID": authUser?.userSub,
                  "expoToken": data.expoToken,
                  "firstName": data.firstName,
                  "lastName": data.lastName,
                  "email": email,
                  "phoneNumber": data.phoneNumber,
                  "dateOfBirth": data.dateOfBirth,
                  "address": data.address,
                  "biography": data.biography,
                  "backgroundCheckStatus": false,
                  "employeeID": '-1',
                  "offenses": 0,
                  "overallRating": 0.0
              })
            )
          }
          //If success
          if(userData != undefined){
            if(data.type == 'Provider'){
              userInfo = {
                userID: userData.id,
                firstName: userData.firstName,
                lastName: userData.lastName,
                address: userData.address,
                phoneNumber: userData.phoneNumber,
                biography: userData.biography,
                backgroundCheck: userData.backgroundCheckStatus,
                profilePicture: userData.profilePictureURL,
                expoToken: data.expoToken
              }
            }
            else{
              userInfo = {
                userID: userData.id,
                firstName: userData.firstName,
                lastName: userData.lastName,
                address: userData.address,
                phoneNumber: userData.phoneNumber,
                contactMethod: userData.contactMethod,
                expoToken: data.expoToken
              }
            }
            let attr = {
              sub: authUser.userSub,
              'custom:type': data.type,
            }
            return {authUser: attr , userInfo}
          }
          else{
            message = 'Error saving user';
            return thunkAPI.rejectWithValue(message);
          }
        } catch (error) {
          message = error.message;
          return thunkAPI.rejectWithValue(message);
        }      
    }
}
);

//Login
export const login = createAsyncThunk("auth/login", async (data, thunkAPI) => {
    let message = ''

    //try logging in
    try {
      await Auth.signIn({username: data.email, password: data.password})
    } catch (error) {
      message = error.message
      return thunkAPI.rejectWithValue(message);
    }
    

    //if sign in success get auth and data info
    const dataCheck = await checkCredentials();
    if(dataCheck.authUser == null){
      message = "Could not get authenticated user data"
      console.log(message);
      return thunkAPI.rejectWithValue(message);
    }
    else if(dataCheck.userInfo == null){
      message = "User data not found"
      console.log(message);
      return thunkAPI.rejectWithValue(message);
    }
    else if(dataCheck.authUser != null && dataCheck.userInfo != null){
      return {authUser: dataCheck.authUser, userInfo: dataCheck.userInfo}
    }
}
);

//Logout
export const logout = createAsyncThunk("auth/logout", async () => {
  try {
      await Auth.signOut();
      await DataStore.clear();
      await DataStore.start();
  } catch (error) {
      console.log('error signing out');
  }
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
    //Resets the response states after the server responds
    resetState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = "";
    },
    changeUserInfo: (state, action) => {
      state.userInfo = action.payload.userInfo
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
        state.authUser = null;
        state.userInfo = null;
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

export const { changeUserStatus, resetState, changeUserInfo } = authReducer.actions;
export default authReducer.reducer;