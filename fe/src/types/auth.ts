export type UserRole = "user" | "admin"

export interface AuthUser {
  id: number
  name: string
  email: string
  role: UserRole
}

export interface SignupPayload {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface LoginPayload {
  email: string
  password: string
  role: UserRole
}

export interface AuthResponse {
  message: string
  token: string
  user: AuthUser
}