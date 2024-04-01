import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {register} from './utils/api';
import {useDispatch, useSelector} from "react-redux";

export default function Signup() {
  const navigate = useNavigate();
  const {authenticated} = useSelector(({auth}) => auth);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    if(authenticated) {
      if(location && location.state && location.state.from) {
        return navigate(location.state.from.pathname, {replace: true});
      }
      navigate('/', {replace: true});
    }
  }, [authenticated])

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get('email');
    const password = form.get('password');
    const displayName = form.get('name');

    register({email, password, displayName}).then((user) => {
      localStorage.setItem('email', email);
      navigate('/login', {replace: true});
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form">
        <div style={{marginBottom: '2rem'}}>
          <input
            type="text"
            name="email"
            label="Email"
            variant="outlined"
            placeholder="email"
            style={{display: 'block',marginBottom: '2rem'}}
          />

          <input
            required
            type="text"
            name="name"
            label="name"
            variant="outlined"
            placeholder="name"
            style={{display: 'block',marginBottom: '2rem'}}
          />

          <input
            type="password"
            name="password"
            autoComplete="password"
            label="password"
            variant="outlined"
            placeholder="password"
            style={{display: 'block',marginBottom: '2rem'}}
          />
        </div>

        <button type='submit' variant="outlined" className='btn'>Register</button>
      </div>
    </form>
  )
}