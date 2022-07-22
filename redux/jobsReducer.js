import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { API, DataStore} from "aws-amplify";
import { cancelNotificationByID } from "../notifications";
import { Job } from "../src/models";
import * as queries from "../src/graphql/queries"


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
        let filter = {
            and: [
              { _deleted: {ne: true} },
              {requestOwner: {eq: userID}},
            ]
          }
        const all = await API.graphql({query: queries.listJobs, variables: {filter: filter}})
        let response = all.data.listJobs.items
        let jobsToBeRemoved = response.filter(job => job.markedToRemove)
        if(jobsToBeRemoved.length != 0){
            for(let next of jobsToBeRemoved){
                if(next.userNotificationID.length != 0){
                    await cancelNotificationByID(next.userNotificationID[0])
                    await cancelNotificationByID(next.userNotificationID[1])
                    await cancelNotificationByID(next.userNotificationID[2])
                }
                if(next.providerNotificationID.length == 0){
                    await DataStore.delete(Job, next.id)
                }
            }
        }
        let validJobs = response.filter(job => !job.markedToRemove)
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
                case 'REMOVE_OLD_JOB' :
                    state.jobHistory = state.jobHistory.filter(job => job.id != action.payload.jobInfo.id)
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