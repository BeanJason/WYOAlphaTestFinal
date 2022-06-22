import { DataStore } from "aws-amplify"
import {User, Provider} from "./src/models"
import { Auth } from "aws-amplify"

export async function checkCredentials(){
    let userData, userInfo, authUser
    try {
        authUser = await Auth.currentAuthenticatedUser({bypassCache: true})
    } catch (error) {
        console.log(error);
        return {authUser, userInfo}
    }
    if(authUser == undefined){
        return {authUser, userInfo}
    }
    try {
        if(authUser?.attributes['custom:type'] === 'User'){
            await DataStore.query(User, u => u.subID('eq', authUser?.attributes.sub)).then((foundUser) => userData = foundUser[0])
        }
        else if(authUser?.attributes['custom:type' === 'Provider']){
            await DataStore.query(Provider, u => u.subID('eq', authUser?.attributes.sub)).then((foundUser) => userData = foundUser[0])
        }
        //If success
        if(userData != undefined){
            userInfo = {
              userID: userData.id,
              firstName: userData.firstName,
              lastName: userData.lastName,
              address: userData.address,
              phoneNumber: userData.phoneNumber
            }
            return {authUser: authUser.attributes, userInfo}
          }

    } catch (error) {
        console.log(error);
        return {authUser, userInfo}
    }
}

export function getStripeKey(){
    return "pk_test_51LAbv7GUC6WuR4axP3o28XT3NNuJW1Reiy10HWN33J35I6hAaEEs18ZVnmUVbCSwmv4sLic0KdI6ZnFnjkl1B5yW00IAMz9BzM";
}