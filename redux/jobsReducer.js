import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { API, DataStore, graphqlOperation } from "aws-amplify";
import { refundPayment } from "../src/graphql/mutations";
import { getUnacceptedJobs } from "../common/functions";
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
    const userID = data;
    try {
        let response = await DataStore.query(Job, job => job.requestOwner("eq", userID))
        let filteredArray = getUnacceptedJobs(response.filter((job) => job.currentStatus == "REQUESTED"))
        if(filteredArray.length != 0){
            let refundStatus
            for(let job of filteredArray){
                //refund any unaccepted jobs
                try {
                    refundStatus = await API.graphql( graphqlOperation(refundPayment, {
                          isCancel: false,
                          jobID: job.id
                        })
                    )
                    if(refundStatus){
                       response = response.filter((j) => j.id != job.id)
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }
        return {allJobs: response}
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