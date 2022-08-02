/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateJob = /* GraphQL */ `
  subscription OnCreateJob($filter: ModelSubscriptionJobFilterInput) {
    onCreateJob(filter: $filter) {
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
      markedToRemove
      isRated
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onUpdateJob = /* GraphQL */ `
  subscription OnUpdateJob($filter: ModelSubscriptionJobFilterInput) {
    onUpdateJob(filter: $filter) {
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
      markedToRemove
      isRated
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onDeleteJob = /* GraphQL */ `
  subscription OnDeleteJob($filter: ModelSubscriptionJobFilterInput) {
    onDeleteJob(filter: $filter) {
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
      markedToRemove
      isRated
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onCreateProvider = /* GraphQL */ `
  subscription OnCreateProvider($filter: ModelSubscriptionProviderFilterInput) {
    onCreateProvider(filter: $filter) {
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
      backgroundCheckDate
      backgroundCheckReminders
      employeeID
      offenses
      overallRating
      isBan
      currentLocation
      isNotificationsOn
      jobs {
        nextToken
        startedAt
      }
      review {
        id
        reviews
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      providerReviewId
    }
  }
`;
export const onUpdateProvider = /* GraphQL */ `
  subscription OnUpdateProvider($filter: ModelSubscriptionProviderFilterInput) {
    onUpdateProvider(filter: $filter) {
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
      backgroundCheckDate
      backgroundCheckReminders
      employeeID
      offenses
      overallRating
      isBan
      currentLocation
      isNotificationsOn
      jobs {
        nextToken
        startedAt
      }
      review {
        id
        reviews
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      providerReviewId
    }
  }
`;
export const onDeleteProvider = /* GraphQL */ `
  subscription OnDeleteProvider($filter: ModelSubscriptionProviderFilterInput) {
    onDeleteProvider(filter: $filter) {
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
      backgroundCheckDate
      backgroundCheckReminders
      employeeID
      offenses
      overallRating
      isBan
      currentLocation
      isNotificationsOn
      jobs {
        nextToken
        startedAt
      }
      review {
        id
        reviews
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      providerReviewId
    }
  }
`;
export const onCreateReview = /* GraphQL */ `
  subscription OnCreateReview($filter: ModelSubscriptionReviewFilterInput) {
    onCreateReview(filter: $filter) {
      id
      reviews
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onUpdateReview = /* GraphQL */ `
  subscription OnUpdateReview($filter: ModelSubscriptionReviewFilterInput) {
    onUpdateReview(filter: $filter) {
      id
      reviews
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onDeleteReview = /* GraphQL */ `
  subscription OnDeleteReview($filter: ModelSubscriptionReviewFilterInput) {
    onDeleteReview(filter: $filter) {
      id
      reviews
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser($filter: ModelSubscriptionUserFilterInput) {
    onCreateUser(filter: $filter) {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser($filter: ModelSubscriptionUserFilterInput) {
    onUpdateUser(filter: $filter) {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser($filter: ModelSubscriptionUserFilterInput) {
    onDeleteUser(filter: $filter) {
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
export const onCreateCode = /* GraphQL */ `
  subscription OnCreateCode($filter: ModelSubscriptionCodeFilterInput) {
    onCreateCode(filter: $filter) {
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
export const onUpdateCode = /* GraphQL */ `
  subscription OnUpdateCode($filter: ModelSubscriptionCodeFilterInput) {
    onUpdateCode(filter: $filter) {
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
export const onDeleteCode = /* GraphQL */ `
  subscription OnDeleteCode($filter: ModelSubscriptionCodeFilterInput) {
    onDeleteCode(filter: $filter) {
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
export const onCreateManager = /* GraphQL */ `
  subscription OnCreateManager($filter: ModelSubscriptionManagerFilterInput) {
    onCreateManager(filter: $filter) {
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
export const onUpdateManager = /* GraphQL */ `
  subscription OnUpdateManager($filter: ModelSubscriptionManagerFilterInput) {
    onUpdateManager(filter: $filter) {
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
export const onDeleteManager = /* GraphQL */ `
  subscription OnDeleteManager($filter: ModelSubscriptionManagerFilterInput) {
    onDeleteManager(filter: $filter) {
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
export const onCreateBlacklist = /* GraphQL */ `
  subscription OnCreateBlacklist(
    $filter: ModelSubscriptionBlacklistFilterInput
  ) {
    onCreateBlacklist(filter: $filter) {
      id
      subID
      email
      phoneNumber
      type
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onUpdateBlacklist = /* GraphQL */ `
  subscription OnUpdateBlacklist(
    $filter: ModelSubscriptionBlacklistFilterInput
  ) {
    onUpdateBlacklist(filter: $filter) {
      id
      subID
      email
      phoneNumber
      type
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onDeleteBlacklist = /* GraphQL */ `
  subscription OnDeleteBlacklist(
    $filter: ModelSubscriptionBlacklistFilterInput
  ) {
    onDeleteBlacklist(filter: $filter) {
      id
      subID
      email
      phoneNumber
      type
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
