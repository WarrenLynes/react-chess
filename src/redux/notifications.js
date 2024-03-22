
export function addNotification(notification) {
  return (dispatch, getState) => {
    const id = Math.floor(Math.random() * 100000);
    const now = new Date();

    now.setSeconds(now.getSeconds() + 3);
    dispatch({ type: 'NOTIFICATION_ADD', notification: { ...notification, id, duration: now.getTime() } });

    let timerId;

    new Promise(() => {
      timerId = setTimeout(() => {
        dispatch({ type: 'NOTIFICATION_REMOVE', id });
      }, notification.duration);
    }).then(() => clearTimeout(timerId))

  }
}
export default function Notifications(state = [], action) {
  switch (action.type) {
    case 'NOTIFICATION_ADD':
      return state.indexOf(action.notification.id) > -1 ?
        [action.notification, ...state,] : state;
      break;
    case 'NOTIFICATION_REMOVE':
      return state.filter(({ id }) => id !== action.id)
      break;
    default:
      return state
  }
}