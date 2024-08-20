import React, { ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import Loading from "../../components/Loading";

type contextType = {
    currentUser: User | undefined | null;
    userType: string | undefined | null;
    signedIn: boolean;
    loading: boolean;
    updateUserType: (type: string | undefined | null) => void;
};

type ProviderProps = {
    children: ReactNode;
}

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthContext = React.createContext<contextType>({
    currentUser: null,
    userType: null,
    signedIn: false,
    loading: false,
    updateUserType: () => {}
});

export function AuthProvider({ children }: ProviderProps) {
    const [currentUser, setCurrentUser] = useState<User | null | undefined>(null);
    const [signedIn, setSignedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userType, setUserType] = useState<string | undefined | null>(() => {
        return localStorage.getItem('userType')
    });

    const initializeUser = (user: User | undefined | null) => {
        setLoading(true);
        if(user) {
            setCurrentUser(user);
            setSignedIn(true);
        } else {
            setCurrentUser(undefined);
            setSignedIn(false);
        }
        setLoading(false);
    }

    const updateUserType = (type: string | undefined | null) => {
        setUserType(type);
        if(type) {
            localStorage.setItem('userType', type || '');
        } else {
            localStorage.removeItem('userType')
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe;
    }, []);

    const value = useMemo(() => ({ currentUser, userType, signedIn: !!currentUser, loading, updateUserType }), [currentUser, userType]);

    if(loading){
        return <Loading />
    }

    return <AuthContext.Provider value={value}>
        {!loading && children}
    </AuthContext.Provider>
}