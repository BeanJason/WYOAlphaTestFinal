const stripe = require("stripe")(process.env.STRIPE_KEY);

exports.handler = async (event) => {
  const { typeName, arguments } = event;

  if (typeName != "Mutation") {
    throw new Error("Request is not a mutation");
  }

  if (!arguments?.amount) {
    throw new Error("Amount is required");
  }
  if (!arguments?.email) {
    throw new Error("Email is required");
  }
  if (!arguments?.jobID) {
    throw new Error("jobID is required");
  }


  const paymentIntent = await stripe.paymentIntents.create({
    amount: arguments.amount,
    currency: "usd",
    metadata: { Email: arguments.email, Job: arguments.jobID },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    id: arguments.jobID
  };
};
