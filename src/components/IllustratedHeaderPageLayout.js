import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {
    propTypes as headerWithCloseButtonPropTypes,
    defaultProps as headerWithCloseButtonDefaultProps,
} from './HeaderWithCloseButton/headerWithCloseButtonPropTypes';

const propTypes = {
    ...headerWithCloseButtonPropTypes,
};

const defaultProps = {
    ...headerWithCloseButtonDefaultProps,
};

const IllustratedHeaderPageLayout = props => (
    <View></View>
);

IllustratedHeaderPageLayout.propTypes = propTypes;
IllustratedHeaderPageLayout.defaultProps = defaultProps;
IllustratedHeaderPageLayout.displayName = 'IllustratedHeaderPageLayout';

export default IllustratedHeaderPageLayout;
