import {
    addTodolistAC,
    changeTodolistEntityStatusAC,
    removeTodolistAC,
    setTodolistsAC,
} from './todolists-reducer'
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {AppRootStateType} from '../../app/store'
import {handleServerAppError, handleServerNetworkError} from "../../utils/error-utils";
import {setAppErrorAC, setAppStatusAC} from "../../app/app-reducer";
import {ThunkDispatch} from "redux-thunk";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState: TasksStateType = {}

const slice = createSlice({
    name: "tasks",
    reducers: {
        removeTaskAC(state, action: PayloadAction<{taskId: string, todolistId: string}>) {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(t => t.id === action.payload.taskId)
            tasks.splice(index, 1)
        },
        addTaskAC(state, action: PayloadAction<{task: TaskType}>) {
            const tasks = state[action.payload.task.todoListId]
            tasks.unshift(action.payload.task)
        },
        updateTaskAC(state, action: PayloadAction<{taskId: string, model: UpdateDomainTaskModelType, todolistId: string}>) {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(t => t.id === action.payload.taskId)
            tasks[index] = {...tasks[index], ...action.payload.model}
        },
        setTasksAC(state, action: PayloadAction<{tasks: Array<TaskType>, todolistId: string}>) {
            state[action.payload.todolistId] = action.payload.tasks
        },
    },
    initialState: initialState,
    extraReducers: (builder) => {
        builder.addCase(addTodolistAC, (state, action) => {
            state[action.payload.todolist.id] = []
        })
        builder.addCase(removeTodolistAC, (state, action) => {
            delete state[action.payload.id]
        })
        builder.addCase(setTodolistsAC, (state, action) => {
            action.payload.todolists.forEach((tl: any) => {
                state[tl.id] = []
            })
        })
    }
})

export const tasksReducer = slice.reducer
export const {removeTaskAC, addTaskAC, updateTaskAC, setTasksAC} = slice.actions

// thunks
export const fetchTasksTC = (todolistId: string) => (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status: "loading"}))
    todolistsAPI.getTasks(todolistId)
        .then((res) => {
            dispatch(setTasksAC({tasks: res.data.items, todolistId: todolistId}))
            dispatch(setAppStatusAC({status: "succeeded"}))
        })
}
export const removeTaskTC = (taskId: string, todolistId: string) => (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status: "loading"}))
    dispatch(changeTodolistEntityStatusAC({id: todolistId, entityStatus: "loading"}))
    todolistsAPI.deleteTask(todolistId, taskId)
        .then(res => {
            dispatch(setAppStatusAC({status: "succeeded"}))
                dispatch(removeTaskAC({taskId: taskId, todolistId: todolistId}))
            dispatch(changeTodolistEntityStatusAC({id: todolistId, entityStatus: "succeeded"}))
        })
}
export const addTaskTC = (title: string, todolistId: string) => (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status: "loading"}))
    dispatch(changeTodolistEntityStatusAC({id: todolistId, entityStatus: "loading"}))
    todolistsAPI.createTask(todolistId, title)
        .then(res => {
            if (res.data.resultCode === 0) {
                dispatch(addTaskAC({task: res.data.data.item}))
                dispatch(setAppStatusAC({status: "succeeded"}))
                dispatch(changeTodolistEntityStatusAC({id: todolistId, entityStatus: "succeeded"}))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}

export const updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
    (dispatch: ThunkDispatch<any, any, any>, getState: () => AppRootStateType) => {
        const state = getState()
        const task = state.tasks[todolistId].find(t => t.id === taskId)
        if (!task) {
            //throw new Error("task not found in the state");
            console.warn('task not found in the state')
            return
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...domainModel
        }
        dispatch(setAppStatusAC({status: "loading"}))
        todolistsAPI.updateTask(todolistId, taskId, apiModel)
            .then(res => {
                const action = updateTaskAC({taskId, model: domainModel, todolistId})
                dispatch(action)
                dispatch(setAppStatusAC({status: "succeeded"}))
            })
            .catch((error) => {
                dispatch(setAppErrorAC(error.message))
                dispatch(setAppStatusAC({status: 'failed'}))
            })
    }

// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}

