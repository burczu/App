import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import setStatusBarBackgroundColor from './setStatusBarBackgroundColor';
import themeColors from '../../styles/themes/default';

class CustomStatusBar extends Component {
    componentDidMount() {
        StatusBar.setBarStyle('light-content', true);
        setStatusBarBackgroundColor(themeColors.appBG);
    }

    render() {
        return <StatusBar />;
    }
}

export default CustomStatusBar;
