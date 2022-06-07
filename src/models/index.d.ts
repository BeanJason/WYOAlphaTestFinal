import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





type ProviderMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type UserMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Provider {
  readonly id: string;
  readonly subID: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly dateOfBirth: string;
  readonly address: string;
  readonly city: string;
  readonly zipCode: string;
  readonly biography: string;
  readonly profilePictureURL?: string | null;
  readonly backgroundCheckStatus: boolean;
  readonly employeeID: string;
  readonly offenses: number;
  readonly overallRating: number;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Provider, ProviderMetaData>);
  static copyOf(source: Provider, mutator: (draft: MutableModel<Provider, ProviderMetaData>) => MutableModel<Provider, ProviderMetaData> | void): Provider;
}

export declare class User {
  readonly id: string;
  readonly subID: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly dateOfBirth?: string | null;
  readonly address: string;
  readonly city: string;
  readonly zipCode: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<User, UserMetaData>);
  static copyOf(source: User, mutator: (draft: MutableModel<User, UserMetaData>) => MutableModel<User, UserMetaData> | void): User;
}