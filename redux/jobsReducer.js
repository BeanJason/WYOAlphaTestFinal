import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { DataStore} from "aws-amplify";
import { Job } from "../src/models";


const initialState = {
    activeJobs: [],
    jobHistory: [],
    newJobID: "",
    message: "",
    initialized: false
}

//ASYNC FUNCTIONS
export const initializeJobs = createAsyncThunk("jobs/initialize", async (data, thunkAPI) => {
    const {userID} = data;
    try {
        let response = await DataStore.query(Job, job => job.requestOwner("eq", userID))
        let jobsToBeRemoved = response.filter(job => job.markedToRemove != "")
        if(jobsToBeRemoved.length != 0){
            for(let next of jobsToBeRemoved){
                if(next.userNotificationID.length != 0){
                    await cancelNotificationByID(next.userNotificationID[0])
                    await cancelNotificationByID(next.userNotificationID[1])
                }
                if(next.providerNotificationID.length == 0){
                    await DataStore.delete(Job, next.id)
                }
            }
        }
        let validJobs = response.filter(job => job.markedToRemove == "")
        return {allJobs: validJobs}
    } catch (error) {
        return thunkAPI.rejectWithValue('Error getting job list ' + error.message)
    }
})

//State management for jobs active and old
export const jobsReducer = createSlice({
    name: 'jobs',
    initialState,
    reducers: {
        addOrRemoveJob: (state, action) => {
            switch (action.payload.type) {
                case 'ADD_ACTIVE_JOB' :
                    state.activeJobs.push(action.payload.jobInfo)
                    break;
                case 'REMOVE_ACTIVE_JOB':
                    state.activeJobs = state.activeJobs.filter(job => job.id != action.payload.jobInfo.id)
                    console.log('removed');
                    break;
                case 'ADD_OLD_JOB' :
                    state.jobHistory.push(action.payload.jobInfo)
                    break;
                default:
            }
        },
        reinitialize: (state) => {
            state.initialized = false;
        },
        resetState: (state) => {
            state.activeJobs = []
            state.jobHistory = []
            state.initialized = false;
        },
        storeNewJobID: (state, action) => {
            state.newJobID = action.payload.jobID
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(initializeJobs.fulfilled, (state, action) => {
                state.initialized = true;
                state.activeJobs = action.payload.allJobs.filter(j => j.currentStatus != 'COMPLETED')
                state.jobHistory = action.payload.allJobs.filter(j => j.currentStatus == 'COMPLETED')
            })
            .addCase(initializeJobs.rejected, (state) => {
                state.message = action.payload;
                state.activeJobs = [];
                state.jobHistory = [];
            })
    }

})

export const {addOrRemoveJob, resetState, reinitialize, storeNewJobID} = jobsReducer.actions
export default jobsReducer.reducer