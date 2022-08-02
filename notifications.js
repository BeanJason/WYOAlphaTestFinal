import { API, DataStore, graphqlOperation } from "aws-amplify";
import * as Notifications from "expo-notifications";
import { sendJobUpdates, sendNotification } from "./src/graphql/mutations";
import { User, Provider, Job, Manager } from "./src/models";
import * as Device from "expo-device"



//handler settings
Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
    };
  },
});


//when the user clicks on the notification
Notifications.addNotificationResponseReceivedListener(async (response) => {
  if(response.notification.request.content.title == 'New Provider'){
    let data = response.notification.request.content.data
    let original = await DataStore.query(Job, data.jobID)
    let allNotifications = await Notifications.getAllScheduledNotificationsAsync()
    let check = false;
    for(let next of allNotifications){
      if(original.providerNotificationID.includes(next.identifier)){
        check = true;
        break;
      }
    }
    if(!check){
      try {
      let ids = await createProviderReminder(original)
      await DataStore.save(Job.copyOf(original, (updated) => {
        updated.providerNotificationID.push(ids[0])
        updated.providerNotificationID.push(ids[1])
      }))
    } catch (error) {
      console.log(error);
    }
    }
  }
});

//when the app is open and you receieve a notification
Notifications.addNotificationReceivedListener(async (notification) => {
  if(notification.request.content.title == 'New Provider'){
    let data = notification.request.content.data
    try {
      let original = await DataStore.query(Job, data.jobID)
      let ids = await createProviderReminder(original)
      await DataStore.save(Job.copyOf(original, (updated) => {
        updated.providerNotificationID.push(ids[0])
        updated.providerNotificationID.push(ids[1])
      }))
    } catch (error) {
      console.log(error);
    }
  }
  
});




//get all notifications
export const getAllNotifications = async () => {
  let notificationsList = await Notifications.getAllScheduledNotificationsAsync();
  console.log(notificationsList);
};

//cancel all notifications
export const cancelNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

//cancel one notification by id
export const cancelNotificationByID = async (id) => {
  if(id){
    try {
      await Notifications.cancelScheduledNotificationAsync(id)
    } catch (error) {
      console.log(error);
    }
  }
}

//check if token is unchanged
export const updateExpoToken = async (type, id, token) => {
  if (token == "" || token == null) {
    return "";
  }
  if (type == "Provider") {
    let original = await DataStore.query(Provider, id);
    if (original.expoToken == token) {
      return token;
    }
    await DataStore.save(
      Provider.copyOf(original, (updated) => {
        updated.expoToken = token;
      })
    );
    return token;
  } else if (type == "User") {
    let original = await DataStore.query(User, id);
    if (original.expoToken == token) {
      return token;
    }
    await DataStore.save(
      User.copyOf(original, (updated) => {
        updated.expoToken = token;
      })
    );
    return token;
  } else if (type == "Manager") {
    let original = await DataStore.query(Manager, id);
    if (original.expoToken == token) {
      return token;
    }
    await DataStore.save(
      User.copyOf(original, (updated) => {
        updated.expoToken = token;
      })
    );
    return token;
  }
};

//get the token for notifications
export const getNotificationToken = async () => {
  if (!Device.isDevice) {
    console.log("Physical device is not used so notifications will not work");
    return null;
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  console.log(existingStatus);
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    console.log("permissions not given");
    return null;
  }
  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }
    return token;
  } catch (error) {
    console.log(error);
  }
};



//create notifications
export const createUserReminder = async (job) => {
  let dayBeforeTime = new Date(job.requestDateTime);
  let hour = dayBeforeTime.getHours() % 12 || 12;
  let min = (dayBeforeTime.getMinutes() < 10 ? "0" : "") + dayBeforeTime.getMinutes();
  let amOrPm = "AM";
  if (dayBeforeTime.getHours() >= 12) {
    amOrPm = "PM";
  }

  let threeHrsTime = new Date(job.requestDateTime);
  let completeTime = new Date(job.requestDateTime);
  dayBeforeTime.setHours(dayBeforeTime.getHours() - 24)
  threeHrsTime.setHours(threeHrsTime.getHours() - 3)
  completeTime.setHours(completeTime.getHours() + job.duration)

  

  
  //a day before
  let dayBeforeReminder = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Job Reminder",
      body: `Reminder: Your job request is scheduled for ${dayBeforeTime.toLocaleDateString()} at ${hour}:${min}${amOrPm}`,
      data: {
        jobID: job.id,
        owner: job.requestOwner
      }
    },
    trigger: {
      date: dayBeforeTime,
    },
  });

  //3 hours before
  let threeHourReminder = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Job Reminder",
      body: `Reminder: Your job request is scheduled for today at ${hour}:${min}${amOrPm}`,
      data: {
        jobID: job.id,
        owner: job.requestOwner
      }
    },
    trigger: {
      date: threeHrsTime
    },
  });

  //completed reminder
  let completedReminder = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Job Complete",
      body: `Your job request titled ${job.jobTitle} has been completed`,
      data: {
        jobID: job.id,
        owner: job.requestOwner
      }
    },
    trigger: {
      date: completeTime,
    },
  });

  let ids = [];
  ids.push(dayBeforeReminder);
  ids.push(threeHourReminder);
  ids.push(completedReminder)
  return ids;
};

export const createProviderReminder = async (jobInfo) => {
  let dayBefore = new Date(jobInfo.requestDateTime);
  let hour = dayBefore.getHours() % 12 || 12;
  let min = (dayBefore.getMinutes() < 10 ? "0" : "") + dayBefore.getMinutes();
  let amOrPm = "AM";
  if (dayBefore.getHours() >= 12) {
    amOrPm = "PM";
  }
  let threeHrsTime = new Date(jobInfo.requestDateTime);
  dayBefore.setHours(dayBefore.getHours() - 24)
  threeHrsTime.setHours(threeHrsTime.getHours() - 3)

  //a day before
  let dayBeforeReminder = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Job Reminder: " + jobInfo.jobTitle,
      body: `Reminder: You have a job scheduled for ${dayBefore.toLocaleDateString()} at ${hour}:${min}${amOrPm}`,
      data: {
        jobID: jobInfo.id,
        owner: jobInfo.requestOwner
      }
    },
    trigger: {
      date: dayBefore,
    },
  });

  //3 hours before
  let threeHourReminder = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Job Reminder: " + jobInfo.jobTitle,
      body: `Reminder: You have a job scheduled for today at ${hour}:${min}${amOrPm}`,
      data: {
        jobID: jobInfo.id,
        owner: jobInfo.requestOwner
      }
    },
    trigger: {
      date: threeHrsTime,
    },
  });

  let ids = [];
  ids.push(dayBeforeReminder);
  ids.push(threeHourReminder);
  return ids;
};

export const createBackgroundCheckReminders = async (expirationDate) => {
  let ids = [];
  if(!expirationDate){
    return ids
  }
  let original = new Date(expirationDate)
  original.setFullYear(original.getFullYear() + 1)
  let oneMonth = new Date(original.toString())
  let twoWeeks = new Date(original.toString())
  oneMonth.setMonth(oneMonth.getMonth() - 1)
  twoWeeks.setDate(twoWeeks.getDate() - 14)

  let oneMonthReminder = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Background Check",
      body: `Reminder, your background check will expire one month from today on ${original.toDateString()}`,
    },
    trigger: {
      date: oneMonth,
    },
  });

  let twoWeeksReminder = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Background Check",
      body: `Reminder, your background check will expire 2 weeks from today on ${original.toDateString()}`,
    },
    trigger: {
      date: oneMonth,
    },
  });

  
  ids.push(oneMonthReminder);
  ids.push(twoWeeksReminder);
  return ids;
};

export const sendNotificationToUser = async(userID, messageInfo) => {
  let user = await DataStore.query(User, userID)
  let token = user.expoToken
  if(token != ""){
    try {
      await API.graphql(graphqlOperation(sendNotification, {
        token: token,
        title: messageInfo.title,
        message: messageInfo.message,
        data: messageInfo.data ? JSON.stringify(messageInfo.data) : {}
      }))
    } catch (error) {
      console.log(error);
    }
  }
}

//send job update notification to providers in an area
export const sendJobUpdateNotifications = async(zipCode, messageInfo) => {
  let zip = parseInt(zipCode)
  //get all providers at the zipCode
  let providers = await DataStore.query(Provider, provider => 
      provider.or( provider =>
          provider.address("contains", `"zipCode":"${zip}"`)
          .address("contains", `"zipCode":"${zip + 1}"`)
          .address("contains", `"zipCode":"${zip - 1}"`)
      ) 
  )
  //get all tokens
  let allTokens = []
  for(let next of providers){
      if(next.expoToken && next.isNotificationsOn){
          allTokens.push(next.expoToken)
      }
  }

  //send notifications to server
  if(allTokens.length != 0){
      try {
        await API.graphql(graphqlOperation(sendJobUpdates, {
          tokens: allTokens,
          title: messageInfo.title,
          message: messageInfo.message,
          data: messageInfo.data ? JSON.stringify(messageInfo.data) : {}
        }))
      } catch (error) {
        console.log(error);
      }
  }
}

export const sendNotificationToProvider = async(userID, messageInfo) => {
  let user = await DataStore.query(Provider, userID)
  let token = user.expoToken
  if(token != ""){
    try {
      await API.graphql(graphqlOperation(sendNotification, {
        token: token,
        title: messageInfo.title,
        message: messageInfo.message,
        data: messageInfo.data ? JSON.stringify(messageInfo.data) : {}
      }))
    } catch (error) {
      console.log(error);
    }
  }
}


export const sendNotificationToManager = async(token, messageInfo) => {
  if(token){
    try {
      await API.graphql(graphqlOperation(sendNotification, {
        token: token,
        title: messageInfo.title,
        message: messageInfo.message,
        data: messageInfo.data ? JSON.stringify(messageInfo.data) : {}
      }))
    } catch (error) {
      console.log(error);
    }
  }
}


