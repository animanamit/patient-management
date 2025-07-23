import { apiHandlers } from './api-handlers'
import { authHandlers } from './auth-handlers'

export const handlers = [
  ...authHandlers,
  ...apiHandlers,
]