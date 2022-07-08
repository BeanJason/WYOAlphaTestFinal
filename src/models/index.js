// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const Jobstatus = {
  "REQUESTED": "REQUESTED",
  "ACCEPTED": "ACCEPTED",
  "IN_SERVICE": "IN_SERVICE",
  "COMPLETED": "COMPLETED"
};

const { Job, Provider, User, Code, Manager, PaymentIntent } = initSchema(schema);

export {
  Job,
  Provider,
  User,
  Code,
  Manager,
  Jobstatus,
  PaymentIntent
};