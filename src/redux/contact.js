import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
export const contactThunk = createAsyncThunk(
    "contact",
    async (form, thunkAPI) => {
        const url = import.meta.env.VITE_APP_SERVER_URL
        try {
            const response = await axios.post(`${url}contact-us`,
                {
                    name: form.name,
                    email: form.email,
                    subject: form.subject,
                    message: form.message
                },
                {
                    withCredentials: true
                })
            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "failed"
            );
        }
    }
)

const ContentSlice = createSlice({
    name: "contact",
    initialState: {
        loading: false,
        data: null,
        error: null
    },
    extraReducers: (builder) => {
        builder.addCase(contactThunk.pending, (state) => {
            state.loading = true
        })
        builder.addCase(contactThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload
        })
        builder.addCase(contactThunk.rejected, (state, action) => {
            state.loading = false;
            console.log(action.payload)
            state.error = action.payload || action.error.message;
        })
    }
})

export default ContentSlice.reducer