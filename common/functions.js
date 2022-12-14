import { API, DataStore, graphqlOperation } from "aws-amplify"
import { Code, Job } from "../src/models"
import { cancelNotificationByID, sendNotificationToProvider, sendNotificationToUser } from "../notifications"
import { sendEmail } from "../src/graphql/mutations"
import * as queries from "../src/graphql/queries"
import * as Notifications from "expo-notifications"

export const getEmailRegex = () => {
    return new RegExp("([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])");
}
//check if employee is banned
export const checkIfBanned = async (id) => {
    let response = await API.graphql(graphqlOperation(queries.getProvider, {id: id}))
    return response.data.getProvider.isBan
}

//format hours
export const formatTime = (formatDate) => {
    let hours = formatDate.getHours() % 12 || 12;
    let min = (formatDate.getMinutes() < 10 ? "0" : "") + formatDate.getMinutes();
    let amOrPm = "AM";
    if (formatDate.getHours() >= 12) {
        amOrPm = "PM";
    }
    return `${hours}:${min}${amOrPm}`
}

//fire employee
export const removeJobsFromProvider = async(employee) => {
    if(!employee){
        return false
    }
    let jobs = await DataStore.query(Job, job => job.or(
        job => job.mainProvider("eq", employee.id).backupProviders('contains', employee.id)
      ))
      for(let next of jobs){
            if(next){
            //if provider was the main get the next backup and set as main if available
            if(next.mainProvider == employee.id){
                if(next.backupProviders.length != 0){
                let newMain = next.backupProviders[0]
                //cancel notifications
                if(next.providerNotificationID){
                    await cancelNotificationByID(next.providerNotificationID[0])
                    await cancelNotificationByID(next.providerNotificationID[1])
                }
                try {
                    await DataStore.save(Job.copyOf(next, updated => {
                        updated.mainProvider = newMain
                        updated.backupProviders = updated.backupProviders.filter(id => id != newMain)
                        updated.providerNotificationID = []
                    }))
                    let success = true
                    //send notification to new main provider
                    let request = new Date(next.requestDateTime);
                    let hour = request.getHours() % 12 || 12;
                    let min = (request.getMinutes() < 10 ? "0" : "") + request.getMinutes();
                    let amOrPm = "AM";
                    if (request.getHours() >= 12) {
                    amOrPm = "PM";
                    }
                    let messageInfo = {
                    title: 'New Provider',
                    message: `You have been appointed to be the new main provider of the ${next.jobTitle} job on ${request.toLocaleDateString()} at ${hour}:${min}${amOrPm}`,
                    data: {jobID: next.id}
                    }
                    await sendNotificationToProvider(newMain, messageInfo)
                    //send notification to user about new provider
                    let messageInfo2 = {
                    title: 'Provider Switch',
                    message: `${userInfo.firstName} is now the main provider for your job request`
                    }
                    await sendNotificationToUser(next.requestOwner, messageInfo2)
                } catch (error) {
                    console.log(error);
                }
                }
                //if no backups remove main provider only
                else{
                console.log('No backups available');
                //cancel notifications
                if(next.providerNotificationID){
                    await cancelNotificationByID(next.providerNotificationID[0])
                    await cancelNotificationByID(next.providerNotificationID[1])
                }
                try {
                    await DataStore.save(Job.copyOf(next, updated => {
                        updated.currentStatus = 'REQUESTED'
                        updated.mainProvider = null
                        updated.providerNotificationID = []
                    }))
                    success = true
                    //send notification to user about provider cancellation
                    let messageInfo = {
                    title: 'Job Cancelled',
                    message: 'The main provider has cancelled your job request'
                    }
                    await sendNotificationToUser(next.requestOwner, messageInfo)
                    console.log('returned from notifyinng');
                } catch (error) {
                    console.log(error);
                }
                }
            }
            //If provider was a backup
            else if(next.backupProviders.includes(employee.id)){
                try {
                await DataStore.save(Job.copyOf(next, updated => {
                    updated.backupProviders = updated.backupProviders.filter(id => id != employee.id)
                }))
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }
    let notifications = await Notifications.getAllScheduledNotificationsAsync()
    if(notifications.length != 0){
        await Notifications.cancelAllScheduledNotificationsAsync()
    }
    return true
}

//decrement zip code count
export const decrementZipCodeCount = async(code) => {
    if(code.id){
        let original = await DataStore.query(Code, code.id)
        let count = original.count
        if(count != 0){
            count--;
        }
        await DataStore.save(Code.copyOf(original, updated => {
            updated.count = count
        }))
    }
    else if (code.zipCode) {
        let original = await DataStore.query(Code, c => c.zipCode("eq", code.zipCode))
        let count = original[0].count
        if(count != 0){
            count--;
        }
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



//emails
export const sendPaymentEmail = async (jobInfo, user, email) => {
    let date = new Date(jobInfo.requestDateTime)
    let total = (jobInfo.price + jobInfo.tip) / 100
    total = total.toFixed(2)
    
    let html = 
    `<html>
        <head>
            <h1>
                WYO Payment Confirmation,
            </h1>
            <body>
                <p>
                    Hello ${user}
                </p>
                <p>
                    This email confirms your payment of $${total} for your job request ${jobInfo.jobTitle} 
                    that is scheduled for ${date.toLocaleDateString()} at ${formatTime(date)}. 
                    You have 24 hours to cancel this job for a refund. Note that the $2.50 service fee will not be refunded 
                    if the job is cancelled. Please contact us if you have any problems.
                </p>
                <p>
                    Your Payment ID: ${jobInfo.paymentID}
                </p>
                <p>
                    Thank you.
                </p>
            </body>
        </head>
    </html>`

    await API.graphql(graphqlOperation(sendEmail, {
        userEmail: email,
        subject: 'Payment Confirmation',
        message: html
    }))

}

export const sendRefundEmail = async (jobInfo, user, email) => {
    let date = new Date(jobInfo.requestDateTime)
    let total = (jobInfo.price + jobInfo.tip - 250) / 100
    total = total.toFixed(2)
    
    let html = 
    `<html>
        <head>
            <h1>
                WYO Refund Confirmation
            </h1>
            <body>
                <p>
                    Hello ${user},
                </p>
                <p>
                    This email confirms your refund of $${total} for your job request ${jobInfo.jobTitle} 
                    that was scheduled for ${date.toLocaleDateString()} at ${formatTime(date)}.
                    The refund will be sent to your original payment method.
                    Note that the $2.50 service fee will not be refunded.
                </p>
                <p>
                    Your Payment ID: ${jobInfo.paymentID}
                </p>
                <p>
                    Thank you.
                </p>
            </body>
        </head>
    </html>`

    await API.graphql(graphqlOperation(sendEmail, {
        userEmail: email,
        subject: 'Refund Confirmation',
        message: html
    }))

}

//send provider email after registration
export const sendProviderEmail = async (email) => {
    let html = 
    `<html>
        <head>
            <h1>
                WYO Provider Sign Up
            </h1>
            <body>
                <p>
                    Welcome Provider,
                </p>
                <p>
                    This email confirms that your application as a WYO Provider has been successfully sent in to be processed.
                    The next step is to complete an annual background check by visiting www.michigan.gov/ichat and following the 
                    instructions. The cost of using this service is $10.00 and will be at the expense of the applicant.
                </p>
                <p>
                    Once you have completed this, please upload all your results and a picture of your driver's license to info@wyoservices.com. 
                    If you are accepted, you will receive another email and then be able to search for jobs as a provider.
                </p>
                <p>
                    Thank you, We are excited to possibly welcome you to the team of WYO's!
                </p>
            </body>
        </head>
    </html>`

    await API.graphql(graphqlOperation(sendEmail, {
        userEmail: email,
        subject: 'WYO Provider Application',
        message: html
    }))

}

export const sendChangePasswordEmail = async (email, user = "") => {
    let html = 
    `<html>
        <head>
            <h1>
                WYO Password Change
            </h1>
            <body>
                <p>
                   Hello ${user},
                </p>
                <p>
                    This email confirms that you have successfully changed your password. 
                </p>
                <p>
                    Thank you, we hope to hear from you soon!
                </p>
            </body>
        </head>
    </html>`

    await API.graphql(graphqlOperation(sendEmail, {
        userEmail: email,
        subject: 'WYO Password Change',
        message: html
    }))

}

export const sendProviderAcceptedEmail = async (user, email) => {
    let html = 
    `<html>
        <head>
            <h1>
                WYO Provider Acceptance
            </h1>
            <body>
                <p>
                    Hello ${user},
                </p>
                <p>
                    You have been accepted as a WYO Provider. You may now begin searching for jobs and accepting requests.
                    Please make sure to read the terms and conditions of providers before you start.
                </p>
                <p>
                    Welcome!
                </p>
            </body>
        </head>
    </html>`

    await API.graphql(graphqlOperation(sendEmail, {
        userEmail: email,
        subject: 'Provider Registration',
        message: html
    }))

}

export const sendProviderRejectEmail = async (user, email) => {
    let html = 
    `<html>
        <head>
            <h1>
                WYO Provider Rejected
            </h1>
            <body>
                <p>
                    Hello ${user},
                </p>
                <p>
                    We are sorry to inform you that you have not been accepted as a WYO service Provider. Thank you for applying.
                </p>
            </body>
        </head>
    </html>`

    await API.graphql(graphqlOperation(sendEmail, {
        userEmail: email,
        subject: 'Provider Registration',
        message: html
    }))
}

export const sendBanStatusEmail = async (user, email, status) => {
    let html
    if(status == 'ban'){
        html = `<html>
        <head>
            <h1>
                WYO Provider Ban
            </h1>
            <body>
                <p>
                    Hello ${user},
                </p>
                <p>
                    You have just been banned from your services as a WYO Provider. During this time you will not be able
                    to search for or accept job requests. Please review the terms and conditions in the meantime. You will 
                    receive an email if the ban has been lifted.
                </p>
            </body>
        </head>
    </html>`
    } else{
        html = `<html>
        <head>
            <h1>
                WYO Provider Unban
            </h1>
            <body>
                <p>
                    Hello ${user},
                </p>
                <p>
                    You are now unbanned and can continue your services as a WYO Provider. Please follow the terms and 
                    conditions for being a provider carefully in the future.
                </p>
                <p>
                    Thank you.
                </p>
            </body>
        </head>
    </html>`
    }
    

    await API.graphql(graphqlOperation(sendEmail, {
        userEmail: email,
        subject: 'Ban Status',
        message: html
    }))
}

export const sendProviderFiredEmail = async (user, email) => {
    let html = 
    `<html>
        <head>
            <h1>
                WYO Provider Termination
            </h1>
            <body>
                <p>
                    Hello ${user},
                </p>
                <p>
                    As of this moment you can no longer continue your services as a WYO Provider. All your job requests
                    have been removed and your account is currently terminated.
                </p>
            </body>
        </head>
    </html>`

    await API.graphql(graphqlOperation(sendEmail, {
        userEmail: email,
        subject: 'Termination',
        message: html
    }))
}

export const sendProviderJobSignupEmail = async (jobInfo, user, email, owner) => {
    let date = new Date(jobInfo.requestDateTime)
    let total = (jobInfo.price + jobInfo.tip) / 100
    total = total.toFixed(2)
    
    let html = 
    `<html>
        <head>
            <h1>
                WYO Job Sign-Up,
            </h1>
            <body>
                <p>
                    Hello ${user},
                </p>
                <p>
                    This email confirms you have signed up for the job titled ${jobInfo.jobTitle} that was requested by ${owner}. 
                    This job is scheduled on ${date.toLocaleDateString()} at ${formatTime(date)}. Please remember to check 
                    in on the WYO App as soon as you arrive at the job location.
                </p>
                <p>
                    If you wish to cancel your services for this job, please do so at least 72 hours before the job date. Failure to 
                    do so will result in an offense added to your account.
                </p>
                <p>
                    Thank you.
                </p>
            </body>
        </head>
    </html>`

    await API.graphql(graphqlOperation(sendEmail, {
        userEmail: email,
        subject: 'Job Sign Up',
        message: html
    }))

}

export const sendProviderOffenseEmail = async (user, email, isBan) => {
    let html
    if(isBan){
        html = `<html>
        <head>
            <h1>
                WYO Provider Ban
            </h1>
            <body>
                <p>
                    Hello ${user},
                </p>
                <p>
                    You have received 2 offenses on your account and therefore have been banned from your services as a WYO Provider
                    During this time you will not be able to search for or accept job requests. Please review the terms and conditions
                    for WYO Providers. If you think there was an error or would like to provide documentation for good cause of the 
                    offense, contact us.
                </p>
            </body>
        </head>
    </html>`
    }
    else{
        html = `<html>
        <head>
            <h1>
                WYO Provider Offense
            </h1>
            <body>
                <p>
                    Hello ${user},
                </p>
                <p>
                    You have received an offense on your account as a WYO Provider. This is due to your cancellation of a job
                    less than 72 hours away. Please review the terms and conditions of a WYO Provider. A second offense could 
                    result in a termination of your account.
                </p>
            </body>
        </head>
    </html>`
    }
    await API.graphql(graphqlOperation(sendEmail, {
        userEmail: email,
        subject: 'Offense',
        message: html
    }))
}