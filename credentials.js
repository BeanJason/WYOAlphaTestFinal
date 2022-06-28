import { DataStore, Auth } from "aws-amplify"
import {User, Provider} from "./src/models"

export async function checkCredentials(){
    let userData, userInfo, attributes
    await Auth.currentAuthenticatedUser({bypassCache: true}).then( async (res) => {
        attributes = res.attributes;
        if(attributes == undefined){
            return {authUser: null, userInfo}
        }
        try {
            if(attributes['custom:type'] == 'User'){
                await DataStore.query(User, u => u.subID('eq', attributes.sub)).then((foundUser) => userData = foundUser[0])
            }
            else if(attributes['custom:type'] == 'Provider'){
                await DataStore.query(Provider, u => u.subID('eq', attributes.sub)).then((foundUser) => userData = foundUser[0])
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
                return {authUser: attributes, userInfo}
              }
    
        } catch (error) {
            console.log(error);
            return {authUser: null, userInfo: null}
        }
    })
    return {authUser: null, userInfo: null}    
}

export function getStripeKey(){
    return "pk_test_51LAbv7GUC6WuR4axP3o28XT3NNuJW1Reiy10HWN33J35I6hAaEEs18ZVnmUVbCSwmv4sLic0KdI6ZnFnjkl1B5yW00IAMz9BzM";
}