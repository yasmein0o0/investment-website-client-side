import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const signupThunk = createAsyncThunk(
    'auth/signup',
    async (userdata, thunkAPI) => {
        const url = import.meta.env.VITE_APP_SERVER_URL
        console.log(url)

        try {
            const res = await axios.post(`${url}register`, {
                name: userdata.name,
                email: userdata.email,
                password: userdata.password,
            }, {
                withCredentials: true
            });
            console.log(res.data)
            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Signup failed"
            );
        }
    }
)

const signupSlice = createSlice(
    {
        name: 'signup',
        initialState: {
            loading: false,
            error: null,
            data: null
        },

        reducers: {
            setData: (state, action) => {
                state.data = action.payload
            }
        },


        extraReducers: (builder) => {
            builder.addCase(signupThunk.pending, (state) => {
                state.loading = true
            })
            builder.addCase(signupThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload
                console.log(state.data)
            })
            builder.addCase(signupThunk.rejected, (state, action) => {
                state.loading = false;
                console.log(action.payload)
                state.error = action.payload || action.error.message;
            })
        }
    }
)

export const { setData } = signupSlice.actions;
export default signupSlice.reducer 
