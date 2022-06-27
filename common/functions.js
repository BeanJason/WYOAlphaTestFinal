
export const getUnacceptedJobs = (activeJobs) => {
    //get requested jobs
    let jobsToReturn = []
    if(activeJobs.length == 0){
        return jobsToReturn
    }
    //check date
    let today = new Date()
    let requestDate
    for(let job of activeJobs){
        requestDate = new Date(job.requestDateTime)
        if(today.toLocaleDateString() >= requestDate.toLocaleDateString()){
            //check if two hours or less
            if((today.getHours() - requestDate.getHours()) <= 2){
                jobsToReturn.push(job)
            }
        }
    }
    return jobsToReturn
}