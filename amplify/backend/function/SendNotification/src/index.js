const { Expo } = require("expo-server-sdk");
let expo = new Expo();

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  const { arguments } = event;

  if (!arguments?.token) {
    throw new Error("Token is required");
  }
  if (!arguments?.message) {
    throw new Error("Message is required");
  }
  if (!arguments?.title) {
    throw new Error("Title is required");
  }

  if (!Expo.isExpoPushToken(arguments?.token)) {
    throw new Error("Token is invalid");
  }

  let messages = [];
  messages.push({
    to: arguments?.token,
    sound: "default",
    title: arguments?.title,
    body: arguments?.message,
    data: arguments?.data || {}
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
