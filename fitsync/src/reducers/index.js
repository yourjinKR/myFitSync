import {combineReducers} from 'redux';
import userReducer from './userReducer';

// 여러 reducer를 사용하는 경우 reducer를 하나로 묶어주는 함수
const rootReducer = combineReducers({
  user: userReducer,
})

export default rootReducer;