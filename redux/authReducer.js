import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Auth } from "aws-amplify";
import { DataStore } from "aws-amplify";
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
  type: null
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
      console.log(message);
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
                "city": data.city,
                "zipCode": data.zipCode
              })
            );
          }
          //If Provider
          else if(data.type === 'Provider'){
            userData = DataStore.save(
              new Provider({
                  "subID": authUser?.userSub,
                  "firstName": data.firstName,
                  "lastName": data.lastName,
                  "email": email,
                  "phoneNumber": data.phoneNumber,
                  "dateOfBirth": data.dateOfBirth,
                  "address": data.address,
                  "city": data.city,
                  "zipCode": data.zipCode,
                  "biography": data.biography,
                  "profilePictureURL":  data.profilePictureURL,
                  "backgroundCheckStatus": false,
                  "employeeID": '-1',
                  "offenses": 0,
                  "overallRating": 0.0
              })
            )
          }
          //If success
          if(userData != undefined){
            userInfo = {
              firstName: userData.firstName,
              lastName: userData.lastName,
              address: userData.address,
              city: userData.city,
              zipCode: userData.zipCode,
            }
            return {authUser: authUser.user.getUserAttributes() , userInfo}
          }
          else{
            message = 'Error saving user';
            return thunkAPI.rejectWithValue(message);
          }
        } catch (error) {
          message = error.message;
          console.log(message);
          return thunkAPI.rejectWithValue(message);
        }      
    }
}
);

//Login
export const login = createAsyncThunk("auth/login", async (data, thunkAPI) => {
    let user, userData, userInfo
    let message = ''

    //try logging in
    try {
      await Auth.signIn({username: data.email, password: data.password})
    } catch (error) {
      message = error.message
      return thunkAPI.rejectWithValue(message);
    }
    try {
      user = await Auth.currentUserInfo();
    } catch (error) {
      message = error.message
      return thunkAPI.rejectWithValue(message);
    }
    

    //if successful try to get user info from DB
    if(message == ''){
      try {
        //get from User table
        if(user?.attributes['custom:type'] === 'User'){
          await DataStore.query(User, u => u.subID('eq', user?.attributes.sub)).then((foundUser) => userData = foundUser[0])
        }
        //get from Provider table
        else if(user.attributes['custom:type'] === 'Provider'){
          await DataStore.query(Provider, u => u.subID('eq', user?.attributes.sub)).then((foundUser) => userData = foundUser[0])
        }
        //If success
        if(userData != undefined){
          userInfo = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            address: userData.address,
            city: userData.city,
            zipCode: userData.zipCode,
          }
          return {authUser: user.attributes, userInfo}
        }
        else{
          message = 'User not found';
          return thunkAPI.rejectWithValue(message);
        }
      } catch (error) {
        message = error.message;
        console.log(error);
        return thunkAPI.rejectWithValue(message);
      }
    }
}
);

//Logout
export const logout = createAsyncThunk("auth/logout", async () => {
  try {
      await Auth.signOut();
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

export const { changeUserStatus, resetState } = authReducer.actions;
export default authReducer.reducer;