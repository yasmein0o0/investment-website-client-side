import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const calendersThunk = createAsyncThunk(
    "data/calenders",
    async (_, thunkAPI) => {
        const url = import.meta.env.VITE_APP_SERVER_URL
        console.log(url)
        try {
            const res = await axios.get(`${url}calenders`)
            console.log(res.data)
            return res.data
        } catch (error) {
            console.log(error)
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "failed"
            );
        }

    }
)

const calendersSlice = createSlice({
    name: "calenders",
    initialState: {
        loading: false,
        data: null,
        error: null
    },
    extraReducers: (builder) => {
        builder.addCase(calendersThunk.pending, (state) => {
            state.loading = true
        })
        builder.addCase(calendersThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload
            state.error = null
        })
        builder.addCase(calendersThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || action.error.message;
            state.data = null
        })
    }
})

export default calendersSlice.reducer