import {Dispatch} from "redux";
import {authAPI} from "../api/todolists-api";
import {setIsLoggedInAC} from "../features/Login/auth-reducer";

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'

const initialState = {
    status: 'idle' as RequestStatusType,
    error: null as string | null,
    isInitialized: false
}

type InitialStateType = typeof initialState

export const appReducer = (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
    switch (action.type) {
        case 'APP/SET-STATUS':
            return {...state, status: action.status}
        case "APP/SET-ERROR":
            return {...state, error: action.error}
        case "APP/SET-IS-INITIALIZED":
            return {...state, isInitialized: action.isInitialized}
        default:
            return state
    }
}

export const setAppStatusAC = (status: RequestStatusType) => {
    return {
        type: "APP/SET-STATUS", status
    } as const
}
export const setAppErrorAC = (error: string | null) => {
    return {
        type: 'APP/SET-ERROR', error
    } as const
}
export const setIsInitializedAC = (isInitialized: boolean) => {
    return {
        type: 'APP/SET-IS-INITIALIZED', isInitialized
    } as const
}

export const initializeAppTC = () => (dispatch: Dispatch) => {
    authAPI.me().then(res => {
        if (res.data.resultCode === 0) {
            dispatch(setIsLoggedInAC(true));
            dispatch(setIsInitializedAC(true))
        } else {
        }
    })
}
export type SetAppStatusActionType = ReturnType<typeof setAppStatusAC>
export type SetAppErrorActionType = ReturnType<typeof setAppErrorAC>
export type SetIsInitializedActionType = ReturnType<typeof setIsInitializedAC>
type ActionsType = SetAppStatusActionType
    | SetAppErrorActionType
    | SetIsInitializedActionType