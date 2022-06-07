import { Auth } from "aws-amplify";
import { DataStore } from "aws-amplify";
import {User} from "../src/models"

//Register logic
const register = async (data) => {
    const {email, password} = data

    const authUser = await Auth.signUp({username: email, password, attributes:{email, 'custom:type': data.type}});
    let userInfo
    if(authUser.userSub){
        userInfo = await DataStore.save(
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
    const userData = {authUser, userInfo}
    return userData
  }


  const authService = {
    register,
  }
  
  export default authService