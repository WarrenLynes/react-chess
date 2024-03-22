import React from 'react';
import { loginWithToken } from "./utils/api";

export const AuthContext = React.createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    async function auth(x) {
      const token = localStorage.getItem('token');
      if (token) {
        const user = await loginWithToken(token);
        setUser(user);
      }
    }
    auth();
    return () => null;
  }, []);

  const signIn = (user) => {
    setUser(user);
  }

  const signOut = () => {
    setUser(null);
  }

  const value = { user, signIn, signOut };

  return (
    <AuthContext.Provider value={value} >
      {children}
    </AuthContext.Provider>
  )
}