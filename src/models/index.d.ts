import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";

export enum Jobstatus {
  REQUESTED = "REQUESTED",
  ACCEPTED = "ACCEPTED",
  IN_SERVICE = "IN_SERVICE",
  COMPLETED = "COMPLETED"
}

export declare class PaymentIntent {
  readonly clientSecret: string;
  readonly id: string;
  constructor(init: ModelInit<PaymentIntent>);
}

type JobMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type ProviderMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type UserMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type CodeMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type ManagerMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Job {
  readonly id: string;
  readonly jobTitle: string;
  readonly jobDescription?: string | null;
  readonly address: string;
  readonly city: string;
  readonly zipCode: string;
  readonly latitude: string;
  readonly longitude: string;
  readonly duration: number;
  readonly requestDateTime: string;
  readonly backupProviders?: string[] | null;
  readonly checkInTime?: string | null;
  readonly checkOutTime?: string | null;
  readonly currentStatus: Jobstatus | keyof typeof Jobstatus;
  readonly mainProvider?: string | null;
  readonly requestOwner: string;
  readonly paymentID?: string | null;
  readonly price?: number | null;
  readonly tip?: number | null;
  readonly userNotificationID?: string[] | null;
  readonly providerNotificationID?: string[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Job, JobMetaData>);
  static copyOf(source: Job, mutator: (draft: MutableModel<Job, JobMetaData>) => MutableModel<Job, JobMetaData> | void): Job;
}

export declare class Provider {
  readonly id: string;
  readonly subID: string;
  readonly expoToken?: string | null;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly dateOfBirth: string;
  readonly address: string;
  readonly biography: string;
  readonly profilePictureURL?: string | null;
  readonly backgroundCheckStatus: boolean;
  readonly employeeID: string;
  readonly offenses: number;
  readonly overallRating: number;
  readonly jobs?: (Job | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Provider, ProviderMetaData>);
  static copyOf(source: Provider, mutator: (draft: MutableModel<Provider, ProviderMetaData>) => MutableModel<Provider, ProviderMetaData> | void): Provider;
}

export declare class User {
  readonly id: string;
  readonly subID: string;
  readonly expoToken?: string | null;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly dateOfBirth?: string | null;
  readonly address?: string[] | null;
  readonly contactMethod?: string | null;
  readonly jobs?: (Job | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<User, UserMetaData>);
  static copyOf(source: User, mutator: (draft: MutableModel<User, UserMetaData>) => MutableModel<User, UserMetaData> | void): User;
}

export declare class Code {
  readonly id: string;
  readonly zipCode: string;
  readonly city: string;
  readonly count: number;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Code, CodeMetaData>);
  static copyOf(source: Code, mutator: (draft: MutableModel<Code, CodeMetaData>) => MutableModel<Code, CodeMetaData> | void): Code;
}

export declare class Manager {
  readonly id: string;
  readonly subID: string;
  readonly expoToken?: string | null;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Manager, ManagerMetaData>);
  static copyOf(source: Manager, mutator: (draft: MutableModel<Manager, ManagerMetaData>) => MutableModel<Manager, ManagerMetaData> | void): Manager;
}