export type UserRole = "user" | "admin"

export interface AuthUser {
  id: number
  name: string
  email: string
  role: UserRole
}

export interface LoginPayload {
  email: string
  password: string
}

export interface UserSignupPayload {
  name: string
  email: string
  password: string
  role: "user"
}

export interface AdminSignupPayload {
  name: string
  email: string
  password: string
  role: "admin"
  karaokeName: string
  address: string
  city: string
  phone: string
  description: string
  openingTime: string
  closingTime: string
}

export interface AuthResponse {
  message: string
  token: string
  user: AuthUser
}