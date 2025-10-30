import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const verifyEmailThunk = createAsyncThunk(
    "auth/verifyEmail",
    async (verifyData, thunkAPI) => {
        const url = import.meta.env.VITE_APP_SERVER_URL;
        try {
            const response = await axios.post(`${url}verify-email`, {
                email: verifyData.email,
                otp: verifyData.otp,
            }, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.error || "Email verification failed"
            );
        }
    }
);

export const resendOtpThunk = createAsyncThunk(
    "auth/resendOtp",
    async (email, thunkAPI) => {
        const url = import.meta.env.VITE_APP_SERVER_URL;
        try {
            const response = await axios.post(`${url}resend-otp`, {
                email: email,
            });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.error || "Failed to resend OTP"
            );
        }
    }
);

const verifyEmailSlice = createSlice({
    name: "verifyEmail",
    initialState: {
        loading: false,
        data: null,
        error: null,
        resendLoading: false,
        resendError: null,
        resendSuccess: false,
    },
    reducers: {
        clearVerifyEmailState: (state) => {
            state.loading = false;
            state.data = null;
            state.error = null;
            state.resendLoading = false;
            state.resendError = null;
            state.resendSuccess = false;
        },
    },
    extraReducers: (builder) => {
        // Verify Email cases
        builder.addCase(verifyEmailThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(verifyEmailThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload;
        });
        builder.addCase(verifyEmailThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Resend OTP cases
        builder.addCase(resendOtpThunk.pending, (state) => {
            state.resendLoading = true;
            state.resendError = null;
            state.resendSuccess = false;
        });
        builder.addCase(resendOtpThunk.fulfilled, (state, action) => {
            state.resendLoading = false;
            state.resendSuccess = true;
        });
        builder.addCase(resendOtpThunk.rejected, (state, action) => {
            state.resendLoading = false;
            state.resendError = action.payload;
        });
    },
});

export const { clearVerifyEmailState } = verifyEmailSlice.actions;
export default verifyEmailSlice.reducer;