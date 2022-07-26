const { Expo } = require("expo-server-sdk");
let expo = new Expo();

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  
  if (!event.arguments?.token) {
    throw new Error("Token is required");
  }
  if (!event.arguments?.message) {
    throw new Error("Message is required");
  }
  if (!event.arguments?.title) {
    throw new Error("Title is required");
  }

  if (!Expo.isExpoPushToken(event.arguments.token)) {
    throw new Error("Token is invalid");
  }

  let messages = [];
  console.log(event.arguments)
  messages.push({
    to: event.arguments.token,
    sound: "default",
    title: event.arguments.title,
    body: event.arguments.message,
    data: event.arguments.data ? JSON.parse(event.arguments.data) : {},
    "content-available": "1",
  });
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  try {
    let ticketChunk = await expo.sendPushNotificationsAsync(chunks[0]);
    console.log(ticketChunk);
    tickets.push(...ticketChunk)
    return true
  } catch (error) {
    console.log(error);
  }
  return false
};
