import React, { ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import Loading from "../../components/Loading";

type contextType = {
    currentUser: User | undefined | null;
    signedIn: boolean;
    loading: boolean;
};

type ProviderProps = {
    children: ReactNode;
}

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthContext = React.createContext<contextType>({
    currentUser: null,
    signedIn: false,
    loading: false
});

export function AuthProvider({ children }: ProviderProps) {
    const [currentUser, setCurrentUser] = useState<User | null | undefined>(null);
    const [signedIn, setSignedIn] = useState(false);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe;
    });

    const value = useMemo(() => ({ currentUser, signedIn: !!currentUser, loading }), [currentUser]);

    if(loading){
        return <Loading />
    }

    return <AuthContext.Provider value={value}>
        {!loading && children}
    </AuthContext.Provider>
}