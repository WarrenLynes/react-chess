import {loginWithToken} from "../../utils/api";

export function authenticate() {
  return (dispatch, getState) => {
    const token = localStorage.getItem('token');
    if(token) {
      loginWithToken(token).then((user) =>
        dispatch({ type: 'LOGIN', user }));
    }
  }
}

export function logout() {
  return (dispatch, getState) => {
    const token = localStorage.getItem('token');
    localStorage.removeItem('token');
    try {
      fetch('api/logout', {
        'method': 'get',
        'headers': {
          'Content-Type': 'application/json',
          'Authentication': token
        }
      }).then(res => res.json())
        .then(res => {
          dispatch({type: 'LOGOUT'})
          return;
        });

    } catch(e) {
      throw new Error(e);
    }
  }
}

export function login() {

}
