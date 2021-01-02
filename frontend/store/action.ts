import { CaseReducer, PayloadAction, Draft } from '@reduxjs/toolkit'
import { StatusState } from '~/store/type'

export const wrapPendingReducer = <
  S extends StatusState,
  P = void,
  A extends PayloadAction<any> = PayloadAction<P>
>(
  key: string,
  reducer?: CaseReducer<S, A>,
) => (state: Draft<S>, action: A) => {
  state.status[key].pending = true
  state.status[key].resolved = false
  state.status[key].rejected = false
  reducer?.(state, action)
}

export const wrapSuccessReducer = <
  S extends StatusState,
  P = void,
  A extends PayloadAction<any> = PayloadAction<P>
>(
  key: string,
  reducer?: CaseReducer<S, A>,
) => (state: Draft<S>, action: A) => {
  state.status[key].pending = false
  state.status[key].resolved = true
  state.status[key].rejected = false
  reducer?.(state, action)
}

export const wrapFailureReducer = <
  S extends StatusState,
  P = void,
  A extends PayloadAction<any> = PayloadAction<P>
>(
  key: string,
  reducer?: CaseReducer<S, A>,
) => (state: Draft<S>, action: A) => {
  state.status[key].pending = false
  state.status[key].resolved = false
  state.status[key].rejected = action.payload?.error ?? action.payload
  reducer?.(state, action)
}
