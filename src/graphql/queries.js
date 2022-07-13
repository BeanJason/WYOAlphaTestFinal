/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getJob = /* GraphQL */ `
  query GetJob($id: ID!) {
    getJob(id: $id) {
      id
      jobTitle
      jobDescription
      address
      city
      zipCode
      latitude
      longitude
      duration
      requestDateTime
      backupProviders
      checkInTime
      checkOutTime
      currentStatus
      mainProvider
      requestOwner
      paymentID
      price
      tip
      userNotificationID
      providerNotificationID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const listJobs = /* GraphQL */ `
  query ListJobs(
    $filter: ModelJobFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listJobs(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        jobTitle
        jobDescription
        address
        city
        zipCode
        latitude
        longitude
        duration
        requestDateTime
        backupProviders
        checkInTime
        checkOutTime
        currentStatus
        mainProvider
        requestOwner
        paymentID
        price
        tip
        userNotificationID
        providerNotificationID
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncJobs = /* GraphQL */ `
  query SyncJobs(
    $filter: ModelJobFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncJobs(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        jobTitle
        jobDescription
        address
        city
        zipCode
        latitude
        longitude
        duration
        requestDateTime
        backupProviders
        checkInTime
        checkOutTime
        currentStatus
        mainProvider
        requestOwner
        paymentID
        price
        tip
        userNotificationID
        providerNotificationID
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getProvider = /* GraphQL */ `
  query GetProvider($id: ID!) {
    getProvider(id: $id) {
      id
      subID
      expoToken
      firstName
      lastName
      email
      phoneNumber
      dateOfBirth
      address
      biography
      profilePictureURL
      backgroundCheckStatus
      employeeID
      offenses
      overallRating
      ratingCount
      isBan
      jobs {
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const listProviders = /* GraphQL */ `
  query ListProviders(
    $filter: ModelProviderFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProviders(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        subID
        expoToken
        firstName
        lastName
        email
        phoneNumber
        dateOfBirth
        address
        biography
        profilePictureURL
        backgroundCheckStatus
        employeeID
        offenses
        overallRating
        ratingCount
        isBan
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncProviders = /* GraphQL */ `
  query SyncProviders(
    $filter: ModelProviderFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncProviders(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        subID
        expoToken
        firstName
        lastName
        email
        phoneNumber
        dateOfBirth
        address
        biography
        profilePictureURL
        backgroundCheckStatus
        employeeID
        offenses
        overallRating
        ratingCount
        isBan
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      subID
      expoToken
      firstName
      lastName
      email
      phoneNumber
      dateOfBirth
      address
      contactMethod
      jobs {
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        subID
        expoToken
        firstName
        lastName
        email
        phoneNumber
        dateOfBirth
        address
        contactMethod
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncUsers = /* GraphQL */ `
  query SyncUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncUsers(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        subID
        expoToken
        firstName
        lastName
        email
        phoneNumber
        dateOfBirth
        address
        contactMethod
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getCode = /* GraphQL */ `
  query GetCode($id: ID!) {
    getCode(id: $id) {
      id
      zipCode
      city
      count
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const listCodes = /* GraphQL */ `
  query ListCodes(
    $filter: ModelCodeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCodes(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        zipCode
        city
        count
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncCodes = /* GraphQL */ `
  query SyncCodes(
    $filter: ModelCodeFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncCodes(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        zipCode
        city
        count
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getManager = /* GraphQL */ `
  query GetManager($id: ID!) {
    getManager(id: $id) {
      id
      subID
      expoToken
      firstName
      lastName
      email
      phoneNumber
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const listManagers = /* GraphQL */ `
  query ListManagers(
    $filter: ModelManagerFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listManagers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        subID
        expoToken
        firstName
        lastName
        email
        phoneNumber
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncManagers = /* GraphQL */ `
  query SyncManagers(
    $filter: ModelManagerFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncManagers(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        subID
        expoToken
        firstName
        lastName
        email
        phoneNumber
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
