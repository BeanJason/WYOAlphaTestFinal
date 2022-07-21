const stripe = require("stripe")(process.env.STRIPE_KEY);

exports.handler = async (event) => {
  const { typeName, arguments } = event;

  if (typeName != "Mutation") {
    throw new Error("Request is not a mutation");
  }

  if (!event.arguments?.amount) {
    throw new Error("Amount is required");
  }
  if (!event.arguments?.email) {
    throw new Error("Email is required");
  }
  if (!event.arguments?.jobID) {
    throw new Error("jobID is required");
  }


  const paymentIntent = await stripe.paymentIntents.create({
    amount: event.arguments.amount,
    currency: "usd",
    metadata: { Email: event.arguments.email, Job: event.arguments.jobID },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    id: event.arguments.jobID
  };
};
