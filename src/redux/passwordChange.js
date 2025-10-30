import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Request password change OTP
export const requestPasswordChangeThunk = createAsyncThunk(
    "auth/requestPasswordChange",
    async (email, thunkAPI) => {
        const url = import.meta.env.VITE_APP_SERVER_URL;
        try {
            const response = await axios.post(`${url}password/request-change`, {
                email: email
            });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.error || "Failed to request password change"
            );
        }
    }
);

// Verify OTP for password change
export const verifyPasswordOtpThunk = createAsyncThunk(
    "auth/verifyPasswordOtp",
    async (verifyData, thunkAPI) => {
        const url = import.meta.env.VITE_APP_SERVER_URL;
        try {
            const response = await axios.post(`${url}password/verify-otp`, {
                email: verifyData.email,
                otp: verifyData.otp
            });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.error || "Failed to verify OTP"
            );
        }
    }
);

// Change password with token
export const changePasswordThunk = createAsyncThunk(
    "auth/changePassword",
    async (passwordData, thunkAPI) => {
        const url = import.meta.env.VITE_APP_SERVER_URL;
        try {
            const response = await axios.post(`${url}password/change`, {
                passwordChangeToken: passwordData.token,
                newPassword: passwordData.newPassword
            });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.error || "Failed to change password"
            );
        }
    }
);

// Change password when authenticated
export const changePasswordAuthenticatedThunk = createAsyncThunk(
    "auth/changePasswordAuthenticated",
    async (passwordData, thunkAPI) => {
        const url = import.meta.env.VITE_APP_SERVER_URL;
        try {
            const response = await axios.post(`${url}password/reset`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.error || "Failed to change password"
            );
        }
    }
);

const passwordChangeSlice = createSlice({
    name: "passwordChange",
    initialState: {
        requestLoading: false,
        requestError: null,
        requestSuccess: false,
        verifyLoading: false,
        verifyError: null,
        verifySuccess: false,
        changeLoading: false,
        changeError: null,
        changeSuccess: false,
        token: null,
        email: null
    },
    reducers: {
        clearPasswordState: (state) => {
            state.requestLoading = false;
            state.requestError = null;
            state.requestSuccess = false;
            state.verifyLoading = false;
            state.verifyError = null;
            state.verifySuccess = false;
            state.changeLoading = false;
            state.changeError = null;
            state.changeSuccess = false;
            state.token = null;
            state.email = null;
        },
        setPasswordToken: (state, action) => {
            state.token = action.payload.token;
            state.email = action.payload.email;
        }
    },
    extraReducers: (builder) => {
        // Request password change
        builder
            .addCase(requestPasswordChangeThunk.pending, (state) => {
                state.requestLoading = true;
                state.requestError = null;
                state.requestSuccess = false;
            })
            .addCase(requestPasswordChangeThunk.fulfilled, (state, action) => {
                state.requestLoading = false;
                state.requestSuccess = true;
                state.email = action.payload.email;
            })
            .addCase(requestPasswordChangeThunk.rejected, (state, action) => {
                state.requestLoading = false;
                state.requestError = action.payload;
            })
            // Verify OTP
            .addCase(verifyPasswordOtpThunk.pending, (state) => {
                state.verifyLoading = true;
                state.verifyError = null;
                state.verifySuccess = false;
            })
            .addCase(verifyPasswordOtpThunk.fulfilled, (state, action) => {
                state.verifyLoading = false;
                state.verifySuccess = true;
                state.token = action.payload.passwordChangeToken;
            })
            .addCase(verifyPasswordOtpThunk.rejected, (state, action) => {
                state.verifyLoading = false;
                state.verifyError = action.payload;
            })
            // Change password
            .addCase(changePasswordThunk.pending, (state) => {
                state.changeLoading = true;
                state.changeError = null;
                state.changeSuccess = false;
            })
            .addCase(changePasswordThunk.fulfilled, (state) => {
                state.changeLoading = false;
                state.changeSuccess = true;
            })
            .addCase(changePasswordThunk.rejected, (state, action) => {
                state.changeLoading = false;
                state.changeError = action.payload;
            })
            // Authenticated password change
            .addCase(changePasswordAuthenticatedThunk.pending, (state) => {
                state.changeLoading = true;
                state.changeError = null;
                state.changeSuccess = false;
            })
            .addCase(changePasswordAuthenticatedThunk.fulfilled, (state) => {
                state.changeLoading = false;
                state.changeSuccess = true;
            })
            .addCase(changePasswordAuthenticatedThunk.rejected, (state, action) => {
                state.changeLoading = false;
                state.changeError = action.payload;
            });
    }
});

export const { clearPasswordState, setPasswordToken } = passwordChangeSlice.actions;
export default passwordChangeSlice.reducer;