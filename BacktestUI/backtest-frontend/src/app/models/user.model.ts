export interface User {
    id: number;
    username: string;
    email: string;
    profilePicture?: string;
    createdAt: Date;
    lastLogin: Date;
  }
  
  export interface AuthResponse {
    token: string;
  }
  
  export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
  }
  
  export interface LoginRequest {
    email: string;
    password: string;
  }