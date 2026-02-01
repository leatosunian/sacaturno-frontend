export interface IUser {
  name?: string;
  email: string;
  phone?: string | number;
  password?: string;
  profileImage?: string;
  _id?: string;
  verified?: boolean;
  isFirstLogin?: boolean;
}
