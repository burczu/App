import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import setBackgroundColor from './setBackgroundColor';
import themeColors from '../../styles/themes/default';

class CustomStatusBar extends Component {
    componentDidMount() {
        StatusBar.setBarStyle('light-content', true);
        console.log('RORY_DEBUG setting global custom status bar color');
        setBackgroundColor(themeColors.appBG);
    }

    render() {
        return <StatusBar />;
    }
}

export default CustomStatusBar;
