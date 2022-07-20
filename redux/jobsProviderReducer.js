import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { DataStore } from "aws-amplify";
import { cancelNotificationByID, createProviderReminder } from "../notifications";
import { Job } from "../src/models";


const initialState = {
    activeJobs: [],
    jobHistory: [],
    newJobID: "",
    message: "",
    initialized: false,
    position: null
}

//ASYNC FUNCTIONS
export const initializeJobs = createAsyncThunk("jobs/initialize", async (data, thunkAPI) => {
    const {userID} = data;
    if(userID){
        try {
            let response = await DataStore.query(Job, job =>  job.or(job => job.mainProvider("eq", userID).backupProviders("contains", userID)))
            let jobsToBeRemoved = response.filter(job => job.markedToRemove)
            if(jobsToBeRemoved.length != 0){
                for(let next of jobsToBeRemoved){
                    if(next.providerNotificationID.length != 0){
                        await cancelNotificationByID(next.providerNotificationID[0])
                        await cancelNotificationByID(next.providerNotificationID[1])
                    }
                    await DataStore.delete(Job, next.id)
                }
            }
            let validJobs = response.filter(job => !job.markedToRemove)
            //check if all active jobs for provider contain reminders
            let active = validJobs.filter(job => job.currentStatus != "COMPLETED")
            for(let next of active){
                if(!next.providerNotificationID || next.providerNotificationID.length == 0){
                    await createProviderReminder(next)
                }
            }
            return {allJobs: validJobs, userID: userID}
        } catch (error) {
            return thunkAPI.rejectWithValue('Error getting job list ' + error.message)
        }
    }
})

//State management for jobs active and old
export const jobsProviderReducer = createSlice({
    name: 'jobsProvider',
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
                case 'ADD_COMPLETED_JOB' :
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
            state.position = null
        },
        updateLocation: (state, action) => {
            state.position = action.payload
        },
        resetLocation: (state) => {
            state.position = null
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

export const {addOrRemoveJob, resetState, reinitialize, updateLocation, resetLocation} = jobsProviderReducer.actions
export default jobsProviderReducer.reducer