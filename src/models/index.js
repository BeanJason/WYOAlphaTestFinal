// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const Jobstatus = {
  "REQUESTED": "REQUESTED",
  "ACCEPTED": "ACCEPTED",
  "IN_SERVICE": "IN_SERVICE",
  "COMPLETED": "COMPLETED"
};

const { Job, Provider, Review, User, Code, Manager, Blacklist, PaymentIntent } = initSchema(schema);

export {
  Job,
  Provider,
  Review,
  User,
  Code,
  Manager,
  Blacklist,
  Jobstatus,
  PaymentIntent
};