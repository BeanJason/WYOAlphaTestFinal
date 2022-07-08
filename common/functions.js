import { DataStore } from "aws-amplify"
import * as Device from "expo-device"
import { Code, Job, Provider, User } from "../src/models"
import * as Notifications from "expo-notifications"
import { Platform } from "react-native"

export const getUnacceptedJobs = (activeJobs) => {
    //get requested jobs
    let jobsToReturn = []
    if(activeJobs.length == 0){
        return jobsToReturn
    }
    //check date
    let today = new Date()
    let requestDate
    for(let job of activeJobs){
        requestDate = new Date(job.requestDateTime)
        if(today.toLocaleDateString() >= requestDate.toLocaleDateString()){
            //check if two hours or less
            if((today.getHours() - requestDate.getHours()) <= 2){
                jobsToReturn.push(job)
            }
        }
    }
    return jobsToReturn
}

//check if token is unchanged
export const updateExpoToken = async (type, id, token) => {
    if(token == "" || token == null){
        return ""
    }
    if(type == 'Provider'){
       let original = await DataStore.query(Provider, id)
       if(original.expoToken == token){
        return token
       }
       await DataStore.save(Provider.copyOf(original, updated => {
        updated.expoToken = token
       }))
       return token

    } else if (type == 'User'){
        let original = await DataStore.query(User, id)
        if(original.expoToken == token){
            return token
        }
        await DataStore.save(User.copyOf(original, updated => {
            updated.expoToken = token
        }))
        return token
    }
}

//get the token for notifications
export const registerForNotifications = async () => {
    if(!Device.isDevice){
        console.log('Physical device is not used so notifications will not work');
        return null;
    }
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    console.log(existingStatus);
    if(existingStatus !== "granted"){
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        console.log('permissions not given');
        return null;
      }
    try {
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        if(Platform.OS === "android"){
            Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX
            })
        }
        return token
    } catch (error) {
        console.log(error);
    }
}

//decrement zip code count
export const decrementZipCodeCount = async(code) => {
    if(code.id){
        let original = await DataStore.query(Code, code.id)
        let count = original.count
        count--;
        await DataStore.save(Code.copyOf(original, updated => {
            updated.count = count
        }))
    }
    else if (code.zipCode) {
        let original = await DataStore.query(Code, c => c.zipCode("eq", code.zipCode))
        let count = original[0].count
        count--;
        await DataStore.save(Code.copyOf(original[0], updated => {
            updated.count = count
        }))
    }
}

//delete job if user changes tab or payment ID is not found
export const checkUnverifiedJob = async (job, code) => {
    if(job.paymentID == null){
        await DataStore.delete(Job, job.id)
        //decrement zipcode job
        await decrementZipCodeCount(code)
    }
    else{
        console.log(job.paymentID);
        if(job.paymentID == '' || job.paymentID == undefined || job.paymentID == null){
            await DataStore.delete(Job, job.id)
            //decrement zipcode job
            await decrementZipCodeCount(code)
        }
    }
}