import {MOVE} from "./actions";

export default function gameReducer(state={}, action) {
   switch(action.type) {
    case MOVE:
      return {
        ...state,
        ...action.game
      }
      break;
    case 'AI_MOVE':
      return {
        ...state,
        ...action.config
      }
      break;
    case 'INITIALIZE_GAME':
      return action.game;
      break;
    case 'GAME_OVER':
      return {}
      break;
    case 'LOGOUT':
      return {}
      break;
     case 'UPDATE_TIME':
       return {
         ...state,
         [`${action.playerTeam}Time`]: action.time,
       }
    default:
      return state
  }
}