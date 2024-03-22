import { BrowserRouter, Routes, Route, Navigate, } from "react-router-dom";
import Login from './Login';
import App from './App';
import AuthWrapper from "./AuthWrapper";
import React, { useEffect, useState } from "react";
import { loginWithToken } from "./utils/api";
import { useDispatch, useSelector } from "react-redux";
import Game from "./Game";
import Home from "./Home";
import User from "./User";

function AuthRouter() {
  const { authenticated } = useSelector(({ auth }) => auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [, setAmbiguity] = useState(true);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !authenticated) {
      loginWithToken(token).then((user) => {
        dispatch({ type: 'LOGIN', user });
        setLoading(false);
      });
    }
    setLoading(false);
    setAmbiguity(false);
    return () => null;
  }, [authenticated, dispatch]);

  return !loading && (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />

        <Route path='/app' element={
          <AuthWrapper>
            <App />
          </AuthWrapper>
        } >
          <Route index element={
            <AuthWrapper>
              <Home />
            </AuthWrapper>
          } />

          <Route path='game/:gameId' element={
            <AuthWrapper>
              <Game />
            </AuthWrapper>
          } />

          <Route path="user-profile/:displayName" element={
            <AuthWrapper>
              <User />
            </AuthWrapper>
          } />
        </Route>

        <Route path='*' element={<Navigate to={"/app"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AuthRouter;
