import type {RouteProp} from '@react-navigation/native';
import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MoneyRequestView from '@components/ReportActionItem/MoneyRequestView';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import variables from '@styles/variables';
import * as IOU from '@src/libs/actions/IOU';
import * as ReportActionsUtils from '@src/libs/ReportActionsUtils';
import * as ReportUtils from '@src/libs/ReportUtils';
import * as TransactionUtils from '@src/libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

function Confirmation() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const navigation = useNavigation();
    const route = useRoute<RouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.REVIEW>>();
    const [isExitingPage, setIsExitingPage] = useState(false);
    const [reviewDuplicates, reviewDuplicatesResult] = useOnyx(ONYXKEYS.REVIEW_DUPLICATES);
    const transaction = useMemo(() => TransactionUtils.buildNewTransactionAfterReviewingDuplicates(reviewDuplicates), [reviewDuplicates]);
    const [report, reportResult] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params.threadReportID}`);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction?.reportID}`);
    const reportAction = Object.values(reportActions ?? {}).find(
        (action) => ReportActionsUtils.isMoneyRequestAction(action) && ReportActionsUtils.getOriginalMessage(action)?.IOUTransactionID === reviewDuplicates?.transactionID,
    );

    const transactionsMergeParams = useMemo(() => TransactionUtils.buildTransactionsMergeParams(reviewDuplicates, transaction), [reviewDuplicates, transaction]);
    const mergeDuplicates = useCallback(() => {
        IOU.mergeDuplicates(transactionsMergeParams);
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportAction?.childReportID ?? '-1'));
    }, [reportAction?.childReportID, transactionsMergeParams]);

    const contextValue = useMemo(
        () => ({
            transactionThreadReport: report,
            action: reportAction,
            report,
            checkIfContextMenuActive: () => {},
            reportNameValuePairs: undefined,
            anchor: null,
        }),
        [report, reportAction],
    );

    useEffect(() => {
        const unsubscribeBeforeRemove = navigation.addListener('beforeRemove', () => {
            setIsExitingPage(true);
        });

        return unsubscribeBeforeRemove;
    }, [navigation]);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage =
        isEmptyObject(report) ||
        !ReportUtils.isValidReport(report) ||
        ReportUtils.isReportNotFound(report) ||
        (!isExitingPage && reviewDuplicatesResult.status === 'loaded' && !transaction?.transactionID);

    if (isLoadingOnyxValue(reviewDuplicatesResult, reportResult)) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            testID={Confirmation.displayName}
            shouldShowOfflineIndicator
        >
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={shouldShowNotFoundPage}>
                    <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                        <HeaderWithBackButton title={translate('iou.reviewDuplicates')} />
                        <ScrollView>
                            <View style={[styles.ph5, styles.pb8]}>
                                <Text
                                    family="EXP_NEW_KANSAS_MEDIUM"
                                    fontSize={variables.fontSizeLarge}
                                    style={styles.pb5}
                                >
                                    {translate('violations.confirmDetails')}
                                </Text>
                                <Text>{translate('violations.confirmDuplicatesInfo')}</Text>
                            </View>
                            {/* We need that provider here becuase MoneyRequestView component requires that */}
                            <ShowContextMenuContext.Provider value={contextValue}>
                                <MoneyRequestView
                                    report={report}
                                    shouldShowAnimatedBackground={false}
                                    readonly
                                    updatedTransaction={transaction as OnyxEntry<Transaction>}
                                />
                            </ShowContextMenuContext.Provider>
                        </ScrollView>
                        <FixedFooter style={styles.mtAuto}>
                            <Button
                                text={translate('common.confirm')}
                                success
                                onPress={mergeDuplicates}
                                large
                            />
                        </FixedFooter>
                    </View>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;
