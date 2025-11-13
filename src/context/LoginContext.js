"use client";
import { createContext, useContext, useEffect, useState } from "react";
import authService from "@/services/auth.service";

const LoginContext = createContext();

export function LoginProvider({ children }) {
    const [isLogin, setIsLogin] = useState(false);
    const [user, setUser] = useState({});

    const refreshUserInfo = () => {
        if (authService.isAuthenticated()) {
            setIsLogin(true);
            setUser(authService.getUserInfo());
        } else {
            setIsLogin(false);
            setUser({});
        }
    };

    useEffect(() => {
        refreshUserInfo();
    }, []);

    return (
        <LoginContext.Provider value={{ isLogin, setIsLogin, user, setUser, refreshUserInfo }}>
            {children}
        </LoginContext.Provider>
    );
}

export function useLogin() {
    return useContext(LoginContext);
}