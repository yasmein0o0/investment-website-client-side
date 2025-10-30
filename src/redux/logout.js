import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authAxios } from "../utils/api";

export const logoutThunk = createAsyncThunk(
    "logout/account",
    async (_, { rejectWithValue }) => {
        try {
            const response = await authAxios.post("logout");
            return response.data
        }
        catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to log out'
            )
        }
    }
)

const logoutSlice = createSlice({
    name: 'logout',
    initialState: {
        data: null,
        loading: false,
        error: null
    },

    extraReducers: (builder) => {
        builder.addCase(logoutThunk.pending, (state) => {
            state.loading = true
        })
        builder.addCase(logoutThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload
        })
        builder.addCase(logoutThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || action.error.message;
        })
    }
}
)

export default logoutSlice.reducer