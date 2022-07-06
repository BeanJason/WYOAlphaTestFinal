import { DataStore, Auth, Storage } from "aws-amplify"
import {User, Provider} from "./src/models"

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
            contactMethod: userData[0].contactMethod
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
            pictureUrl = await Storage.get(userData[0].id + '.png')
        }
        const userInfo = {
            userID: userData[0].id,
            firstName: userData[0].firstName,
            lastName: userData[0].lastName,
            address: userData[0].address,
            city: userData[0].city,
            zipCode: userData[0].zipCode,
            phoneNumber: userData[0].phoneNumber,
            biography: userData[0].biography,
            backgroundCheck: userData[0].backgroundCheckStatus,
            profilePicture: pictureUrl ? pictureUrl : ''
        }
        return userInfo
     } catch (error) {
         console.log(error);
         return null
     }
}

export const stripeKey = "pk_test_51LAbv7GUC6WuR4axP3o28XT3NNuJW1Reiy10HWN33J35I6hAaEEs18ZVnmUVbCSwmv4sLic0KdI6ZnFnjkl1B5yW00IAMz9BzM"