
export default function authReducer(state={}, action) {
  switch(action.type) {
    case 'LOGIN':
      return {
        user: action.user,
        token: action.user.token,
        authenticated: true,
      }
      break;
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        authenticated: false,
      }
      break;
    default:
      return state
  }
}