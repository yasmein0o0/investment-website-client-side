import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authAxios } from "../utils/api";

export const deleteThunk = createAsyncThunk(
    "delete/account",
    async (_, { rejectWithValue }) => {
        try {
            const response = await authAxios.delete("delete-account");
            return response.data
        }
        catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed delet account'
            )
        }
    }
)

const deleteSlice = createSlice({
    name: 'delete',
    initialState: {
        data: null,
        loading: false,
        error: null
    },

    extraReducers: (builder) => {
        builder.addCase(deleteThunk.pending, (state) => {
            state.loading = true
        })
        builder.addCase(deleteThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload
        })
        builder.addCase(deleteThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || action.error.message;
        })
    }
}
)

export default deleteSlice.reducer