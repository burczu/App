import {StatusBar} from 'react-native';

/**
 * @param {String} backgroundColor
 * @param {Boolean} animated
 */
export default (backgroundColor, animated = false) => {
    StatusBar.setBackgroundColor(backgroundColor, animated);
};
