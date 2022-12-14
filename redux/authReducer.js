import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Auth } from "aws-amplify";
import { DataStore } from "aws-amplify";
import { checkCredentials, getProviderPicture } from "../credentials";
import { cancelNotificationByID, createBackgroundCheckReminders } from "../notifications";
import {User, Provider, Manager} from "../src/models"

//Initial values
const initialState = {
  loggedIn: false,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
  authUser: null,
  userInfo: null,
  profilePicture: ""
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
                  "overallRating": 0.0,
                  "ratingCount": 0,
                  "isBan": false,
                  "isNotificationsOn": true
              })
            )
          }
          //If success
          if(userData != undefined){
            return
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
    else if(dataCheck.userInfo == 'invalid'){
      message = "Your account is banned"
      console.log(message);
      return thunkAPI.rejectWithValue(message);
    }
    else if(dataCheck.authUser != null && dataCheck.userInfo != null){
      let userInfo = dataCheck.userInfo
      if(dataCheck.authUser['custom:type'] == 'Provider'){
        //update provider reminders for background checks
        let ids = await createBackgroundCheckReminders(userInfo.backgroundCheckDate)
        if(ids.length != 0){
            userInfo = await DataStore.save(Provider.copyOf(dataCheck.userInfo, (updated) => {
              updated.backgroundCheckReminders = ids
            }))
        }
        let pic = await getProviderPicture(userInfo.profilePictureURL)
        return {authUser: dataCheck.authUser, userInfo: userInfo, profilePic: pic}
      }
      else{
        return {authUser: dataCheck.authUser, userInfo: dataCheck.userInfo, profilePic: ""}
      }
    }
}
);

//Logout
export const logout = createAsyncThunk("auth/logout", async (data) => {
  if(data.type == 'Manager'){
    let original = await DataStore.query(Manager, data.id);
        await DataStore.save(Manager.copyOf(original, (updated) => {
          updated.expoToken = ""
    }))
  } 
  else if(data.type == 'Provider'){
      let original = await DataStore.query(Provider, data.id);
      if(original.backgroundCheckReminders && original.backgroundCheckReminders.length != 0){
        for(let next of original.backgroundCheckReminders){
          await cancelNotificationByID(next)
        }
      }
      await DataStore.save(Provider.copyOf(original, (updated) => {
        updated.expoToken = ""
        updated.backgroundCheckReminders = []
    } ))
  } 
  else{
    let original = await DataStore.query(User, data.id);
        await DataStore.save(User.copyOf(original, (updated) => {
          updated.expoToken = ""
    }))
  }
  try {
      await Auth.signOut();
      await DataStore.stop()
      await DataStore.start();
      return
  } catch (error) {
      console.log('error signing out');
      return thunkAPI.rejectWithValue('error signing out');
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
    changeProviderPicture: (state, action) => {
      state.profilePicture = action.payload
    }
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
      })
      //Failed register
      .addCase(register.rejected, (state, action) => {
        console.log('register failed');
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.authUser = null;
        state.userInfo = null;
        state.isSuccess = false;
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
        state.profilePicture = action.payload.profilePic;
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
        state.profilePicture = "";
      });
  },
});

export const { changeUserStatus, resetState, changeUserInfo, changeProviderPicture } = authReducer.actions;
export default authReducer.reducer;