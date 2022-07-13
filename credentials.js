import { DataStore, Auth, Storage } from "aws-amplify"
import { getNotificationToken, updateExpoToken } from "./notifications";
import {User, Provider, Manager} from "./src/models"

export async function checkCredentials(){
    let authUser = await getAuthData();
    if(authUser == null){
        return {authUser: null, userInfo: null}
    }
    console.log('auth user success: ' + authUser);
    let userInfo = null
    if(authUser['custom:type'] == 'User'){
        userInfo = await getUserData(authUser);
    }
    else if (authUser['custom:type'] == 'Provider'){
        userInfo = await getProviderData(authUser);
    }
    else if (authUser['custom:type'] == 'Manager'){
        userInfo = await getManagerData(authUser)
    }
    console.log('User Info: ' + userInfo);
    if(userInfo == null){
        return {authUser: authUser, userInfo: null}
    }
    return {authUser, userInfo}
}

//get login data, user type, sub id
const getAuthData = async () => {
    try {
       const {attributes} = await Auth.currentAuthenticatedUser({bypassCache: true})
       if(attributes == undefined){
        return null
       }
       return attributes
    } catch (error) {
        console.log(error);
        return null
    }
}

//get user personal data
const getUserData = async (attributes) => {
    try {
       const userData = await DataStore.query(User, user => user.subID("eq", attributes.sub))
       if(userData[0] == null || userData[0] == undefined){
        return null
       }
       console.log('found user');
       const userInfo = {
            userID: userData[0].id,
            firstName: userData[0].firstName,
            lastName: userData[0].lastName,
            address: userData[0].address,
            phoneNumber: userData[0].phoneNumber,
            contactMethod: userData[0].contactMethod,
            expoToken: userData[0].expoToken
       }
       if(userInfo.expoToken == "" || userInfo.expoToken == null){
        let token = await getNotificationToken();
        if(token != "" && token != null){
            updateExpoToken('User', userInfo.userID, token)
            userInfo.expoToken = token
        }
       }
       return userInfo
    } catch (error) {
        console.log(error);
        return null
    }
}

//get provider personal data
const getProviderData = async (attributes) => {
    try {
        const userData = await DataStore.query(Provider, user => user.subID("eq", attributes.sub))
        if(userData[0] == null || userData[0] == undefined){
            return null
        }
        let pictureUrl
        if(userData[0].profilePictureURL != null && userData[0].profilePictureURL != ''){
            pictureUrl = await Storage.get(userData[0].profilePictureURL, {
                level: 'public',
            })
        }
        const userInfo = {
            userID: userData[0].id,
            firstName: userData[0].firstName,
            lastName: userData[0].lastName,
            address: userData[0].address,
            phoneNumber: userData[0].phoneNumber,
            biography: userData[0].biography,
            backgroundCheck: userData[0].backgroundCheckStatus,
            profilePicture: pictureUrl ? pictureUrl : '',
            expoToken: userData[0].expoToken,
            isBan: userData[0].isBan,
            employeeID: userData[0].employeeID
        }
        if(userInfo.expoToken == "" || userInfo.expoToken == null){
            let token = await getNotificationToken();
            if(token != "" && token != null){
                updateExpoToken('Provider', userInfo.userID, token)
                userInfo.expoToken = token
            }
        }
        return userInfo
     } catch (error) {
         console.log(error);
         return null
     }
}

const getManagerData = async(attributes) => {
    try {
        const userData = await DataStore.query(Manager, user => user.subID("eq", attributes.sub))
        if(userData[0] == null || userData[0] == undefined){
         return null
        }
        console.log('found user');
        const userInfo = {
             userID: userData[0].id,
             firstName: userData[0].firstName,
             lastName: userData[0].lastName,
             expoToken: userData[0].expoToken
        }
        if(userInfo.expoToken == "" || userInfo.expoToken == null){
         let token = await getNotificationToken();
         if(token != "" && token != null){
             updateExpoToken('Manager', userInfo.userID, token)
             userInfo.expoToken = token
         }
        }
        return userInfo
     } catch (error) {
         console.log(error);
         return null
     }
}