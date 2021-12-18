import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {
    RequestStatusType,
    setAppErrorAC,
    setAppStatusAC,
} from "../../app/app-reducer";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState: Array<TodolistDomainType> = []

const slice = createSlice({
    name: 'todolists',
    reducers: {
        removeTodolistAC(state, action: PayloadAction<{id: string}>) {
            state.splice((state.findIndex(tl => tl.id !== action.payload.id)), 1)
        },
        addTodolistAC(state, action: PayloadAction<{todolist: TodolistType}>) {
            state.unshift({...action.payload.todolist, filter: 'all', entityStatus: "idle"})
        },
        changeTodolistTitleAC(state, action: PayloadAction<{id: string, title: string}>) {
            const index = state.findIndex(tl => tl.id !== action.payload.id)
            state[index].title = action.payload.title
        },
        changeTodolistFilterAC(state, action: PayloadAction<{id: string, filter: FilterValuesType}>) {
            const index = state.findIndex(tl => tl.id !== action.payload.id)
            state[index].filter = action.payload.filter
        },
        setTodolistsAC(state, action: PayloadAction<{todolists: Array<TodolistType>}>) {
            return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: "idle"}))
        },
        changeTodolistEntityStatusAC(state, action: PayloadAction<{id: string, entityStatus: RequestStatusType}>) {
            const index = state.findIndex(tl => tl.id !== action.payload.id)
            state[index].entityStatus = action.payload.entityStatus
        },
    },
    initialState: initialState
})

export const todolistsReducer = slice.reducer
export const {removeTodolistAC, addTodolistAC, changeTodolistTitleAC, changeTodolistFilterAC, setTodolistsAC, changeTodolistEntityStatusAC} = slice.actions


export const fetchTodolistsTC = () => {
    return (dispatch: Dispatch) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        todolistsAPI.getTodolists()
            .then((res) => {
                dispatch(setTodolistsAC({todolists: res.data}))
                dispatch(setAppStatusAC({status: 'succeeded'}))
            })
    }
}
export const removeTodolistTC = (todolistId: string) => {
    return (dispatch: Dispatch) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        dispatch((changeTodolistEntityStatusAC({id: todolistId, entityStatus: "loading"})))
        todolistsAPI.deleteTodolist(todolistId)
            .then((res) => {
                if (res.data.resultCode === 0) {
                    dispatch(setAppStatusAC({status: 'succeeded'}))
                    dispatch(removeTodolistAC({id: todolistId}))
                } else {
                    if (res.data.messages.length) {
                        dispatch(setAppErrorAC({error: res.data.messages[0]}))
                    } else {
                        dispatch(setAppErrorAC({error: "Some error occurred"}))
                    }
                    dispatch(setAppStatusAC({status: 'failed'}))
                }

            })
    }
}
export const addTodolistTC = (title: string) => {
    return (dispatch: Dispatch) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        todolistsAPI.createTodolist(title)
            .then((res) => {
                if (res.data.resultCode === 0) {
                    dispatch(addTodolistAC({todolist: res.data.data.item}))
                    dispatch(setAppStatusAC({status: 'succeeded'}))
                } else {
                    if (res.data.messages.length) {
                        dispatch(setAppErrorAC({error: res.data.messages[0]}))
                    } else {
                        dispatch(setAppErrorAC({error: "Some error occurred"}))
                    }
                    dispatch(setAppStatusAC({status: 'failed'}))
                }

            })
    }
}
export const changeTodolistTitleTC = (id: string, title: string) => {
    return (dispatch: Dispatch) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                dispatch(changeTodolistTitleAC({id: id,title: title}))
                dispatch(setAppStatusAC({status: 'succeeded'}))
            })
    }
}

// types
export type AddTodolistActionType = ReturnType<typeof addTodolistAC>;
export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>;
export type SetTodolistsActionType = ReturnType<typeof setTodolistsAC>;
export type ChangeTodolistEntityStatusActionType = ReturnType<typeof changeTodolistEntityStatusAC>;

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
