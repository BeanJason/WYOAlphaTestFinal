import { DataStore, Auth, Storage } from "aws-amplify"
import { getNotificationToken } from "./notifications";
import {User, Provider, Manager, Blacklist} from "./src/models"

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
        let found = await DataStore.query(Blacklist, person => person.subID('eq', authUser.sub))
        if(found.length != 0){
            return {authUser: authUser, userInfo: 'invalid'}
        }
        else{
            userInfo = await getProviderData(authUser);
        }
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
       let userInfo = userData[0]
       console.log('found user');
       let token = await getNotificationToken();
       if(userInfo.expoToken != token){
        if(token != "" && token != null){
            userInfo = await DataStore.save(User.copyOf(userData[0], (updated) => {
                updated.expoToken = token
            }))
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
        let userInfo = userData[0]
        //check if background check is expired
        let date = new Date(userInfo.backgroundCheckDate)
        date.setFullYear(date.getFullYear() + 1)
        let today = new Date()
        if(userInfo.backgroundCheckStatus == true && (today >= date)){
            userInfo = await DataStore.save(Provider.copyOf(userData[0], (updated) => {
                updated.backgroundCheckStatus = false
            }))
        }
        let token = await getNotificationToken();
        if(userInfo.expoToken != token){
        if(token != "" && token != null){
           userInfo = await DataStore.save(Provider.copyOf(userData[0], (updated) => {
                updated.expoToken = token
            }))
        }
       }
        return userInfo
     } catch (error) {
         console.log(error);
         return null
     }
}

//get profile pic
export const getProviderPicture = async(profilePictureURL) => {
    //check profile picture
    let pictureUrl = ""
    if(profilePictureURL != null && profilePictureURL != ''){
        pictureUrl = await Storage.get(profilePictureURL, {
            level: 'public',
        })
    }
    return pictureUrl
}

const getManagerData = async(attributes) => {
    try {
        const userData = await DataStore.query(Manager, user => user.subID("eq", attributes.sub))
        if(userData[0] == null || userData[0] == undefined){
         return null
        }
        let userInfo = userData[0]

        let token = await getNotificationToken();
        if(userInfo.expoToken != token){
        if(token != "" && token != null){
            userInfo = await DataStore.save(Manager.copyOf(userData[0], (updated) => {
                updated.expoToken = token
            }))
        }
       }
        return userInfo
     } catch (error) {
         console.log(error);
         return null
     }
}