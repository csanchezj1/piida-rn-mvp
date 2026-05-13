import {
  PROGRESS_VISIBLE_CHANGE,
  PROGRESS_MESSAGE_CHANGE,
  PROGRESS_SIZE_CHANGE,
} from '../../constants';

export const visibleChange = () => {
  return { type: PROGRESS_VISIBLE_CHANGE };
};
export const messageChange = (message) => {
  return {
    type: PROGRESS_MESSAGE_CHANGE,
    payload: message
  };
};
export const sizeChange = (size) => {
  return {
    type: PROGRESS_SIZE_CHANGE,
    payload: size
  };
};