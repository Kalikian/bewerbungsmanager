export interface NewUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
export interface LoginUser {
  email: string;
  password: string;
}
export interface UserDB {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  // Add more fields if needed
}
export interface UpdateUserName {
  id: number;
  firstName?: string;
  lastName?: string;
}
export interface ChangePasswordData {
  id: number;
  oldPassword: string;
  newPassword: string;
}
