import {Dispatch} from "redux";
import {authAPI} from "../api/todolists-api";
import {setIsLoggedIn} from "../features/Login/auth-reducer";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'

const initialState = {
    status: 'idle' as RequestStatusType,
    error: null as string | null,
    isInitialized: false
}

const slice = createSlice({
    name: 'app',
    reducers: {
        setAppStatusAC(state, action: PayloadAction<{status: RequestStatusType}>) {
            state.status = action.payload.status
        },
        setAppErrorAC(state, action: PayloadAction<{error: string | null}>) {
            state.error = action.payload.error
        },setIsInitializedAC(state, action: PayloadAction<{isInitialized: boolean}>) {
            state.isInitialized = action.payload.isInitialized
        },
    },
    initialState: initialState
})

export const appReducer = slice.reducer;
export const {setAppStatusAC, setAppErrorAC, setIsInitializedAC} = slice.actions

export const initializeAppTC = () => (dispatch: Dispatch) => {
    authAPI.me().then(res => {
        if (res.data.resultCode === 0) {
            dispatch(setIsLoggedIn({value: true}));

        } else {
        }
        dispatch(setIsInitializedAC({isInitialized: true}))
    })
}
