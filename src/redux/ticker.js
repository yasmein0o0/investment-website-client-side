import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
export const searchThunk = createAsyncThunk(
    "searc/submit",
    async ({ symbol, interval }, thunkAPI) => {
        console.log({ symbol, interval })
        const url = import.meta.env.VITE_APP_SERVER_URL
        try {
            const response = await axios.get(`${url}index`,
                {
                    params: {
                        symbol: symbol || null,
                        interval: interval || null
                    }
                })
            console.log(response.data)
            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "failed"
            );
        }
    }
)
// redux/searchSlice.js

const searchSlice = createSlice({
    name: 'search',
    initialState: {
        data: null,
        info: { name: 'Apple Inc Index', symbol: 'AAPL' },
        loading: false,
        error: null
    },
    reducers: {
        setInfo: (state, action) => {
            console.log(action)
            state.info = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(searchThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(searchThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { setInfo } = searchSlice.actions;
export default searchSlice.reducer