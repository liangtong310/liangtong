import { createContext } from "react";

// 用户角色类型
export type UserRole = 'teacher' | 'student' | null;

// 用户信息接口
export interface UserInfo {
  id: string;
  name: string;
  role: UserRole;
}

// 认证上下文接口
interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo | null;
  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: UserInfo | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  setIsAuthenticated: (value: boolean) => {},
  setUser: (user: UserInfo | null) => {},
  logout: () => {},
});