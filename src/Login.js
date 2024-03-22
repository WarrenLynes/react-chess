import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {login} from './utils/api';
import {useDispatch, useSelector} from "react-redux";

export default function Login() {
  const navigate = useNavigate();
  const {authenticated} = useSelector(({auth}) => auth);
  const [newUser, setNewUser] = useState(false);
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

    if(newUser)
      return /*authService.register()*/

    login({email, password}).then((user) => {
      localStorage.setItem('email', email);
      dispatch({type: 'LOGIN', user});
      navigate('/', {replace: true});
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
            defaultValue={localStorage.email ? localStorage.email : 'testuser@gmail.com'}
            style={{display: 'block',marginBottom: '2rem'}}
          />

          <input
            type="password"
            name="password"
            autoComplete="password"
            label="password"
            variant="outlined"
            defaultValue="12345"
            style={{display: 'block',marginBottom: '2rem'}}
          />
        </div>

        <button type='submit' variant="outlined" className='btn'>{newUser ? 'Register' : 'Login'}</button>
        {/*<Button variant="text" onClick={() => setNewUser(!newUser)} >{newUser ? 'Login' : 'Register'}</Button>*/}
      </div>
    </form>
  )
}