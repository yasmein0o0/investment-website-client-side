import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { loginThunk } from './login';
import { signupThunk } from './signup';
import { deleteThunk } from './deleteaccount';
import { logoutThunk } from './logout';
export const refreshTokenThunk = createAsyncThunk(
    'auth/refresh',
    async (_, { rejectWithValue }) => {

        const url = import.meta.env.VITE_APP_SERVER_URL
        try {
            const response = await axios.post(`${url}refresh`,
                {},
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Refresh failed');
        }
    }
);
// authSlice.js - JUST ADD THIS REDUCER
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        accessToken: null,
        user: null,
        loading: false,
        error: null,
        shouldRefresh: true,
        refreshAttempted: false
    },
    reducers: {
        setShouldRefresh: (state, action) => {
            state.shouldRefresh = action.payload;
        },
        setRefreshAttempted: (state, action) => {
            state.refreshAttempted = action.payload;
        },
        // ADD THIS REDUCER
        clearAuth: (state) => {
            state.accessToken = null;
            state.user = null;
            state.shouldRefresh = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(refreshTokenThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.refreshAttempted = true;
            })
            .addCase(refreshTokenThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.accessToken = action.payload.accessToken;
                state.user = action.payload.user;
                console.log(state.user)
                state.shouldRefresh = true;
                state.refreshAttempted = false;
            })
            .addCase(refreshTokenThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.accessToken = null;
                state.user = null;
                state.shouldRefresh = false;
                state.refreshAttempted = true;
            })
            .addCase(signupThunk.fulfilled, (state, action) => {
                if (action.payload.accessToken) {
                    state.accessToken = action.payload.accessToken;
                    state.user = action.payload.user; // if user data is returned
                }
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                if (action.payload.accessToken) {
                    state.accessToken = action.payload.accessToken;
                    state.user = action.payload.user; // if user data is returned
                }
            })
            .addCase(deleteThunk.fulfilled, (state, action) => {
                state.accessToken = null;
                state.user = null;
                state.shouldRefresh = false;
            })
            .addCase(logoutThunk.fulfilled, (state, action) => {
                state.accessToken = null;
                state.user = null;
                state.shouldRefresh = false;
            })

    }
});

export const { setShouldRefresh, setRefreshAttempted, clearAuth } = authSlice.actions;
export default authSlice.reducer;