const {Expo} = require('expo-server-sdk');
let expo = new Expo();

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    let tokens = event.arguments?.tokens
    if (!tokens) {
        throw new Error("Tokens are required");
      }
      if (!event.arguments?.message) {
        throw new Error("Message is required");
      }
      if (!event.arguments?.title) {
        throw new Error("Title is required");
      }
    
      let isValid
      let messages = [];
      for(let pushToken of tokens){
        isValid = true
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            isValid = false;
            continue;
          }
          if(isValid){
            messages.push({
                to: pushToken,
                sound: "default",
                title: event.arguments.title,
                body: event.arguments.message,
                data: event.arguments.data ? JSON.parse(event.arguments.data) : {},
                "content-available": "1",
            })
          }
      }
      if(messages.length != 0){
          let chunks = expo.chunkPushNotifications(messages);
          let tickets = [];
          for(let chunk of chunks){
              try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk)
              } catch (error) {
                console.log(error);
              }
            }
        }
        else{
            throw new Error("Nothing to send");
        }
};
