import React, {memo} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import compose from '../../../../libs/compose';
import styles from '../../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import Text from '../../../../components/Text';
import {withCurrentDate} from '../../../../components/OnyxProvider';

const propTypes = {
    created: PropTypes.string.isRequired,
    style: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.object,
    ]),
    ...withLocalizePropTypes,
};

const defaultProps = {
    style: {},
};

const FloatingDateIndicator = props => (
    <View style={[styles.justifyContentCenter, styles.alignItemsCenter, props.style]}>
        <View style={[styles.pv2, styles.ph6, styles.border, styles.chatItemDateIndicator]}>
            <Text style={[styles.textLabelSupporting, styles.lh16]}>{props.datetimeToCalendarTime(props.created)}</Text>
        </View>
    </View>
);

FloatingDateIndicator.propTypes = propTypes;
FloatingDateIndicator.displayName = 'FloatingDateIndicator';
FloatingDateIndicator.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withCurrentDate(),
    memo,
)(FloatingDateIndicator);
