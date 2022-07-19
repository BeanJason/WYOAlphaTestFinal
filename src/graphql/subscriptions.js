/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateJob = /* GraphQL */ `
  subscription OnCreateJob {
    onCreateJob {
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
  subscription OnUpdateJob {
    onUpdateJob {
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
  subscription OnDeleteJob {
    onDeleteJob {
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
  subscription OnCreateProvider {
    onCreateProvider {
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
      currentLocation
      jobs {
        nextToken
        startedAt
      }
      reviews
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onUpdateProvider = /* GraphQL */ `
  subscription OnUpdateProvider {
    onUpdateProvider {
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
      currentLocation
      jobs {
        nextToken
        startedAt
      }
      reviews
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onDeleteProvider = /* GraphQL */ `
  subscription OnDeleteProvider {
    onDeleteProvider {
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
      currentLocation
      jobs {
        nextToken
        startedAt
      }
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
  subscription OnCreateUser {
    onCreateUser {
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
  subscription OnUpdateUser {
    onUpdateUser {
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
  subscription OnDeleteUser {
    onDeleteUser {
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
  subscription OnCreateCode {
    onCreateCode {
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
  subscription OnUpdateCode {
    onUpdateCode {
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
  subscription OnDeleteCode {
    onDeleteCode {
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
  subscription OnCreateManager {
    onCreateManager {
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
  subscription OnUpdateManager {
    onUpdateManager {
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
  subscription OnDeleteManager {
    onDeleteManager {
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
  subscription OnCreateBlacklist {
    onCreateBlacklist {
      id
      subID
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
export const onUpdateBlacklist = /* GraphQL */ `
  subscription OnUpdateBlacklist {
    onUpdateBlacklist {
      id
      subID
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
export const onDeleteBlacklist = /* GraphQL */ `
  subscription OnDeleteBlacklist {
    onDeleteBlacklist {
      id
      subID
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
