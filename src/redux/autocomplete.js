import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { searchThunk } from "./ticker";
export const autocompleteThunk = createAsyncThunk(
    "searc/autocomplete",
    async (prefix, thunkAPI) => {
        const url = import.meta.env.VITE_APP_SERVER_URL
        console.log(prefix)
        try {
            const response = await axios.post(`${url}autocomplete`,
                {
                    prefix
                })
            console.log(response.data)
            return response.data
        } catch (error) {
            console.log(error)
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "failed"
            );
        }
    }
)

const autocompleteSlice = createSlice({
    name: "autocomplete",
    initialState: {
        loading: false,
        data: null,
        error: null
    },
    extraReducers: (builder) => {
        builder.addCase(autocompleteThunk.pending, (state) => {
            state.loading = true
        })
        builder.addCase(autocompleteThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload
        })
        builder.addCase(autocompleteThunk.rejected, (state, action) => {
            state.loading = false;
            console.log(action.payload)
            state.error = action.payload || action.error.message;
        })
    }
})

export default autocompleteSlice.reducer