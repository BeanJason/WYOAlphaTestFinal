// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Provider, User } = initSchema(schema);

export {
  Provider,
  User
};