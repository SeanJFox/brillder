import types from '../types';

const MainPageInitialState = {
  data: null,
}

export default (state = MainPageInitialState, action: any) => {
  switch (action.type) {
    case types.FETCH_PRO_FORMA_FAILURE:
      return {
        data: null,
        error: action.payload
      }
    case types.FETCH_PRO_FORMA_SUCCESS:
      return {
        data: action.payload,
        error: ''
      }
    default: return state;
  }
}
