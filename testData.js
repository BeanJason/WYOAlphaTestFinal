export const getLoggedIn = () => {
    return true
}

export const getUser = () => {
    let authUser = {
        "custom:type": "User",
        "email": "kassimballout@gmail.com",
        "email_verified": true,
        "sub": "5dfc329e-8231-4fa3-b045-aad293ac531b",
    }
    let address = {
        street: '123 Main',
        city: 'Dearborn',
        zipCode: '48126'
    }
    let userInfo = {
        userID: '1',
        firstName: 'John',
        lastName: 'Doe',
        address: [JSON.stringify(address)]
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
        id: '1',
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
        id: '1',
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
        id: '2',
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
        id: '3',
        jobTitle: 'Roofing',
        jobDescription: 'It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
        address: '123 Main',
        city: 'Dearborn',
        zipCode: '48126',
        duration: 5,
        requestDateTime: c,
        backupProviders: null,
        currentStatus: 'REQUESTED'
    },
    {
        id: '4',
        jobTitle: 'Plumbing',
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
        id: '1',
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
        id: '2',
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
        id: '3',
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
        id: '4',
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


export const getManyProviders = () => {
    let date = new Date()
    date.setDate(date.getDate() + 3)
    date.setHours(10)
    date.setMinutes(0)
    let d = date.toString()

    let employees = [{
        id: '1',
        firstName: 'Harry',
        lastName: 'Potter',
        createdAt: date,
        biography: 'My name is harry potter',
        email: 'harryPotter@yahoo.com',
        phone: '111-222-3333',
        offenses: 0,
        overallRating: 4.5,
    },
    {
        id: '2',
        firstName: 'Ron',
        lastName: 'Weasley',
        createdAt: date,
        biography: 'My name is harry potter',
        email: 'harryPotter@yahoo.com',
        phone: '111-222-3333',
        offenses: 3,
        overallRating: 4.1,
    },
    {
        id: '3',
        firstName: 'Hermione',
        lastName: 'Granger',
        createdAt: date,
        biography: 'My name is harry potter',
        email: 'harryPotter@yahoo.com',
        phone: '111-222-3333',
        offenses: 5,
        overallRating: 3.1,
    },
    {
        id: '4',
        firstName: 'Albus',
        lastName: 'Dumbledore',
        createdAt: date,
        biography: 'My name is harry potter',
        email: 'harryPotter@yahoo.com',
        phone: '111-222-3333',
        offenses: 0,
        overallRating: 5,
    },
    {
        id: '5',
        firstName: 'Severus',
        lastName: 'Snape',
        createdAt: date,
        biography: 'My name is harry potter',
        email: 'harryPotter@yahoo.com',
        phone: '111-222-3333',
        offenses: 1,
        overallRating: 3.8,
    }
]

    return employees
}


export const getManyReviews = () => {
    let date = new Date()
    let reviews = [
        {
            comment: 'Great work',
            jobDate: date.toString(),
            jobID: '1ajfhi13fjen',
            jobTitle: 'Cable',
            rating: 4.5
        },
        {
            comment: 'Must have again',
            jobDate: date.toString(),
            jobID: '1ajfhi13fjasdsen',
            jobTitle: 'Cable',
            rating: 4.5
        },
        {
            comment: 'strong worker',
            jobDate: date.toString(),
            jobID: '1ajfhi13fja1e31en',
            jobTitle: 'Cable',
            rating: 5
        },
        {
            comment: 'decent',
            jobDate: date.toString(),
            jobID: '1ajfhi13fj90en',
            jobTitle: 'Cable',
            rating: 3.5
        },
        {
            comment: 'okay',
            jobDate: date.toString(),
            jobID: '1ajfhi13fjen9009',
            jobTitle: 'Cable',
            rating: 3
        },
        {
            comment: 'Great work',
            jobDate: date.toString(),
            jobID: '1ajfhi13fjesfasd2wn',
            jobTitle: 'Cable',
            rating: 4.5
        },
        {
            comment: 'Great work',
            jobDate: date.toString(),
            jobID: '1ajfhi13fjf2u4hf82hfen',
            jobTitle: 'Cable',
            rating: 4.5
        },
        {
            comment: 'Great work',
            jobDate: date.toString(),
            jobID: '1ajfhi13fjijsfn2f24f2en',
            jobTitle: 'Cable',
            rating: 5
        },
    ]

    return reviews
}