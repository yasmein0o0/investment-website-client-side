import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const qoutesThunk = createAsyncThunk(
    "data/qoutes",
    async (_, thunkAPI) => {
        const url = import.meta.env.VITE_APP_SERVER_URL
        console.log(url)
        try {
            const res = await axios.get(`${url}qoutes`)
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

const qoutesSlice = createSlice({
    name: "qoutes",
    initialState: {
        loading: false,
        movers: null,
        error: null
    },
    extraReducers: (builder) => {
        builder.addCase(qoutesThunk.pending, (state) => {
            state.loading = true
        })
        builder.addCase(qoutesThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload
            state.error = null
        })
        builder.addCase(qoutesThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || action.error.message;
            state.data = null
        })
    }
})

export default qoutesSlice.reducer