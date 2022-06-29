import { DataStore } from "aws-amplify"
import { useDispatch } from "react-redux"
import { storeNewJobID } from "../redux/jobsReducer"
import { Job } from "../src/models"

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

//delete job if user changes tab or payment ID is not found
export const checkUnverifiedJob = async (job) => {
    if(job.paymentID == null){
        const dispatch = useDispatch();
        dispatch(storeNewJobID(""))
        await DataStore.delete(Job, job.id)
    }
    else{
        console.log(job.paymentID);
        if(job.paymentID == '' || job.paymentID == undefined || job.paymentID == null){
            const dispatch = useDispatch();
            dispatch(storeNewJobID(""))
            await DataStore.delete(Job, job.id)
        }
    }
}