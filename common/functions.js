import { DataStore } from "aws-amplify"
import * as Device from "expo-device"
import { Code, Job, Provider, User } from "../src/models"
import * as Notifications from "expo-notifications"
import { Platform } from "react-native"
import { cancelNotificationByID } from "../notifications"

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
        //remove reminders
        for(let next of job.userNotificationID){
            await cancelNotificationByID(next)
        }
        await DataStore.delete(Job, job.id)
        //decrement zipcode job
        await decrementZipCodeCount(code)
    }
    else{
        console.log(job.paymentID);
        if(job.paymentID == '' || job.paymentID == undefined || job.paymentID == null){
            //remove reminders
            for(let next of job.userNotificationID){
                await cancelNotificationByID(next)
            }
            await DataStore.delete(Job, job.id)
            //decrement zipcode job
            await decrementZipCodeCount(code)
            //remove reminders
        }
    }
}