import { configureStore } from "@reduxjs/toolkit"

import { errorMiddleware } from "./middlewares/error-middleware"
import rootReducer from "./root-reducer"

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ["meta.timestamp", "payload"],
        ignoredPaths: ["stocksReducer.status.error"],
      },
    }).concat(errorMiddleware()),
})

export type AppDispatch = typeof store.dispatch

export default store
