export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: string;
    token: string;
    token_type: string;
    authenticated?: boolean;
}

export interface AuthCheckResponse {
  authenticated: boolean;
  user: {
    id: number;
    name: string;
    email: string;
  };
//   token: {
//     name: string;
//     last_used_at: string;
//     expires_at: string | null;
//   };
}