export const getLoggedIn = () => {
    return true
}

export const getUser = () => {
    let authUser = {
        sub: '1A',
        'custom:type': 'User'
    }
    let userInfo = {
        userID: '1',
        firstName: 'John',
        lastName: 'Doe',
        address: JSON.stringify([{
            count: 1,
            street: '123 Main',
            city: 'Dearborn',
            zipCode: '48126'
        }])
      }
      return {authUser, userInfo}
}

export const getProvider = () => {
    let authUser = {
        sub: '2A',
        'custom:type': 'Provider'
    }
    let userInfo = {
        userID: '2',
        firstName: 'Harry',
        lastName: 'Potter',
        address: JSON.stringify({
            count: 1,
            street: '456 Fake St',
            city: 'Dearborn',
            zipCode: '48126'
        })
      }
      return {authUser, userInfo}
}

export const get1Job = () => {
    let date = new Date()
    date.setDate(date.getDate() + 3)
    date.setHours(10)
    date.setMinutes(0)
    let d = date.toString()

    let job = [{
        jobTitle: 'Cable',
        jobDescription: 'I need someone to watch TV with the cable guy while he fixes the cable',
        address: '123 Main',
        city: 'Dearborn',
        zipCode: '48126',
        duration: 5,
        requestDateTime: d,
        backupProviders: null,
        currentStatus: 'REQUESTED'
    }]

    return job
}

export const getManyJobs = () => {
    let date = new Date()
    date.setDate(date.getDate() + 3)
    date.setHours(10)
    date.setMinutes(0)
    let a = date.toString()
    date.setDate(date.getDate() - 3)
    let c = date.toString()

    let jobs = [{
        jobTitle: 'Cable',
        jobDescription: 'I need someone to watch TV with the cable guy while he fixes the cable',
        address: '123 Main',
        city: 'Dearborn',
        zipCode: '48126',
        duration: 5,
        requestDateTime: a,
        backupProviders: null,
        currentStatus: 'REQUESTED'
    },
    {
        jobTitle: 'Plumbing',
        jobDescription: '',
        address: '123 Main',
        city: 'Dearborn',
        zipCode: '48126',
        duration: 8,
        requestDateTime: a,
        backupProviders: null,
        currentStatus: 'REQUESTED'
    },
    {
        jobTitle: 'Roofing',
        jobDescription: 'It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
        address: '123 Main',
        city: 'Dearborn',
        zipCode: '48126',
        duration: 5,
        requestDateTime: c,
        backupProviders: null,
        currentStatus: 'REQUESTED'
    }

]
    return jobs
}

export const getJobHistory = () => {
    let date = new Date()
    date.setDate(date.getDate() - 3)
    date.setHours(10)
    date.setMinutes(0)
    let a = date.toString()
    date.setDate(date.getDate() - 3)
    let b = date.toString()
    date.setDate(date.getDate() - 3)
    let c = date.toString()
    date.setDate(date.getDate() - 3)
    let d = date.toString()

    let jobs = [{
        jobTitle: 'Cable',
        jobDescription: 'I need someone to watch TV with the cable guy while he fixes the cable',
        address: '123 Main',
        city: 'Dearborn',
        zipCode: '48126',
        duration: 5,
        requestDateTime: a,
        backupProviders: null,
        currentStatus: 'COMPLETED',
        mainProvider: 'Jack'
    },
    {
        jobTitle: 'Plumbing',
        jobDescription: '',
        address: '123 Main',
        city: 'Dearborn',
        zipCode: '48126',
        duration: 8,
        requestDateTime: b,
        backupProviders: null,
        currentStatus: 'COMPLETED',
        mainProvider: 'Jack'
    },
    {
        jobTitle: 'Roofing',
        jobDescription: 'It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
        address: '123 Main',
        city: 'Dearborn',
        zipCode: '48126',
        duration: 5,
        requestDateTime: c,
        backupProviders: null,
        currentStatus: 'COMPLETED',
        mainProvider: 'Jason'
    },
    {
        jobTitle: 'Roofing',
        jobDescription: 'It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
        address: '123 Main',
        city: 'Dearborn',
        zipCode: '48126',
        duration: 5,
        requestDateTime: c,
        backupProviders: null,
        currentStatus: 'COMPLETED',
        mainProvider: 'Kassim'
    }

]
    return jobs
}