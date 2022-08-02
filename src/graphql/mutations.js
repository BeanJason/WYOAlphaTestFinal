/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createPaymentIntent = /* GraphQL */ `
  mutation CreatePaymentIntent(
    $amount: Int!
    $email: String!
    $jobID: String!
  ) {
    createPaymentIntent(amount: $amount, email: $email, jobID: $jobID) {
      clientSecret
      id
    }
  }
`;
export const refundPayment = /* GraphQL */ `
  mutation RefundPayment($isCancel: Boolean!, $jobID: String!) {
    refundPayment(isCancel: $isCancel, jobID: $jobID)
  }
`;
export const sendNotification = /* GraphQL */ `
  mutation SendNotification(
    $token: String!
    $title: String!
    $message: String!
    $data: String
  ) {
    sendNotification(
      token: $token
      title: $title
      message: $message
      data: $data
    )
  }
`;
export const sendEmail = /* GraphQL */ `
  mutation SendEmail(
    $userEmail: String!
    $subject: String!
    $message: String!
  ) {
    sendEmail(userEmail: $userEmail, subject: $subject, message: $message)
  }
`;
export const contactUsFunction = /* GraphQL */ `
  mutation ContactUsFunction(
    $name: String!
    $email: String!
    $message: String!
  ) {
    contactUsFunction(name: $name, email: $email, message: $message)
  }
`;
export const sendJobUpdates = /* GraphQL */ `
  mutation SendJobUpdates(
    $tokens: [String!]
    $title: String!
    $message: String!
    $data: String
  ) {
    sendJobUpdates(
      tokens: $tokens
      title: $title
      message: $message
      data: $data
    )
  }
`;
export const createJob = /* GraphQL */ `
  mutation CreateJob(
    $input: CreateJobInput!
    $condition: ModelJobConditionInput
  ) {
    createJob(input: $input, condition: $condition) {
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
export const updateJob = /* GraphQL */ `
  mutation UpdateJob(
    $input: UpdateJobInput!
    $condition: ModelJobConditionInput
  ) {
    updateJob(input: $input, condition: $condition) {
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
export const deleteJob = /* GraphQL */ `
  mutation DeleteJob(
    $input: DeleteJobInput!
    $condition: ModelJobConditionInput
  ) {
    deleteJob(input: $input, condition: $condition) {
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
export const createProvider = /* GraphQL */ `
  mutation CreateProvider(
    $input: CreateProviderInput!
    $condition: ModelProviderConditionInput
  ) {
    createProvider(input: $input, condition: $condition) {
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
export const updateProvider = /* GraphQL */ `
  mutation UpdateProvider(
    $input: UpdateProviderInput!
    $condition: ModelProviderConditionInput
  ) {
    updateProvider(input: $input, condition: $condition) {
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
export const deleteProvider = /* GraphQL */ `
  mutation DeleteProvider(
    $input: DeleteProviderInput!
    $condition: ModelProviderConditionInput
  ) {
    deleteProvider(input: $input, condition: $condition) {
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
export const createReview = /* GraphQL */ `
  mutation CreateReview(
    $input: CreateReviewInput!
    $condition: ModelReviewConditionInput
  ) {
    createReview(input: $input, condition: $condition) {
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
export const updateReview = /* GraphQL */ `
  mutation UpdateReview(
    $input: UpdateReviewInput!
    $condition: ModelReviewConditionInput
  ) {
    updateReview(input: $input, condition: $condition) {
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
export const deleteReview = /* GraphQL */ `
  mutation DeleteReview(
    $input: DeleteReviewInput!
    $condition: ModelReviewConditionInput
  ) {
    deleteReview(input: $input, condition: $condition) {
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
export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
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
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
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
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
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
export const createCode = /* GraphQL */ `
  mutation CreateCode(
    $input: CreateCodeInput!
    $condition: ModelCodeConditionInput
  ) {
    createCode(input: $input, condition: $condition) {
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
export const updateCode = /* GraphQL */ `
  mutation UpdateCode(
    $input: UpdateCodeInput!
    $condition: ModelCodeConditionInput
  ) {
    updateCode(input: $input, condition: $condition) {
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
export const deleteCode = /* GraphQL */ `
  mutation DeleteCode(
    $input: DeleteCodeInput!
    $condition: ModelCodeConditionInput
  ) {
    deleteCode(input: $input, condition: $condition) {
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
export const createManager = /* GraphQL */ `
  mutation CreateManager(
    $input: CreateManagerInput!
    $condition: ModelManagerConditionInput
  ) {
    createManager(input: $input, condition: $condition) {
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
export const updateManager = /* GraphQL */ `
  mutation UpdateManager(
    $input: UpdateManagerInput!
    $condition: ModelManagerConditionInput
  ) {
    updateManager(input: $input, condition: $condition) {
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
export const deleteManager = /* GraphQL */ `
  mutation DeleteManager(
    $input: DeleteManagerInput!
    $condition: ModelManagerConditionInput
  ) {
    deleteManager(input: $input, condition: $condition) {
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
export const createBlacklist = /* GraphQL */ `
  mutation CreateBlacklist(
    $input: CreateBlacklistInput!
    $condition: ModelBlacklistConditionInput
  ) {
    createBlacklist(input: $input, condition: $condition) {
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
export const updateBlacklist = /* GraphQL */ `
  mutation UpdateBlacklist(
    $input: UpdateBlacklistInput!
    $condition: ModelBlacklistConditionInput
  ) {
    updateBlacklist(input: $input, condition: $condition) {
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
export const deleteBlacklist = /* GraphQL */ `
  mutation DeleteBlacklist(
    $input: DeleteBlacklistInput!
    $condition: ModelBlacklistConditionInput
  ) {
    deleteBlacklist(input: $input, condition: $condition) {
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
