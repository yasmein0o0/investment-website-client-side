import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const googleAuthThunk = createAsyncThunk(
    "auth/google",
    async (googleData, thunkAPI) => {
        console.log(googleData)
        const url = import.meta.env.VITE_APP_SERVER_URL;
        try {
            const response = await axios.post(`${url}google`, {
                google_token: googleData.accessToken,
                email: googleData.email,
                name: googleData.name,
                google_id: googleData.googleId
            }, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.error || "Google authentication failed"
            );
        }
    }
);

const googleAuthSlice = createSlice({
    name: "googleAuth",
    initialState: {
        loading: false,
        data: null,
        error: null
    },
    reducers: {
        clearGoogleAuth: (state) => {
            state.loading = false;
            state.data = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(googleAuthThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(googleAuthThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(googleAuthThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearGoogleAuth } = googleAuthSlice.actions;
export default googleAuthSlice.reducer;