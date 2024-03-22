
export default function OpenGames(state=[], action) {
  switch(action.type) {
    case 'OPEN_GAMES_SET':
      return action.data
      break;
    default:
      return state
  }
}