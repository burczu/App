import moment from 'moment-timezone';
import Onyx from 'react-native-onyx';
import CONST from '../../src/CONST';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';

const LOCALE = CONST.LOCALES.EN;
const DEFAULT_TIME_ZONE = 'Etc/UTC';

jest.mock('moment-timezone', () => {
    const localMoment = jest.requireActual('moment-timezone');
    localMoment.tz.guess = () => 'Etc/UTC';
    return jest.fn(() => localMoment);
});

// eslint-disable-next-line import/first
import DateUtils from '../../src/libs/DateUtils';

describe('DateUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: 999},
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {999: {timezone: {selected: DEFAULT_TIME_ZONE}}},
            },
        });
        return waitForPromisesToResolve();
    });

    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(new Date('2021-01-01'));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const datetime = '2022-11-07 00:00:00';
    // TODO: this will be rewritten when the moment library is removed
    it('should return a moment object with the formatted datetime when calling getLocalMomentFromDatetime', () => {
        const localMoment = DateUtils.getLocalMomentFromDatetime(LOCALE, datetime, 'America/Los_Angeles');
        expect(moment.isMoment(localMoment)).toBe(true);
        expect(moment(localMoment).format()).toEqual('2022-11-06T16:00:00-08:00');
    });

    it('should return moment with current timezone when date time not provided', () => {
        const currentSelectedTimezone = 'America/Los_Angeles'
        const localMoment = DateUtils.getLocalMomentFromDatetime(LOCALE, null, currentSelectedTimezone);
        expect(moment.isMoment(localMoment)).toBe(true);
        expect(moment(localMoment).format()).toEqual(moment.tz(currentSelectedTimezone).format());
    });

    it('should return the date in calendar time when calling datetimeToCalendarTime', () => {
        const today = moment.utc().set({hour: 14, minute: 32});
        expect(DateUtils.datetimeToCalendarTime(LOCALE, today)).toBe('Today at 2:32 PM');

        const yesterday = moment.utc().subtract(1, 'days').set({hour: 7, minute: 43});
        expect(DateUtils.datetimeToCalendarTime(LOCALE, yesterday)).toBe('Yesterday at 7:43 AM');

        const date = moment.utc('2022-11-05').set({hour: 10, minute: 17});
        expect(DateUtils.datetimeToCalendarTime(LOCALE, date)).toBe('Nov 5, 2022 at 10:17 AM');
    });

    it('should return the date in calendar time, lower-cased, when calling datetimeToCalendarTime with lowercase param set', () => {
        const today = moment.utc().set({hour: 14, minute: 32});
        expect(DateUtils.datetimeToCalendarTime(LOCALE, today.format(), false, undefined, true)).toBe('today at 2:32 PM');

        const yesterday = moment.utc().subtract(1, 'days').set({hour: 7, minute: 43});
        expect(DateUtils.datetimeToCalendarTime(LOCALE, yesterday.format(), false, undefined, true)).toBe('yesterday at 7:43 AM');

        const date = moment.utc('2022-11-05').set({hour: 10, minute: 17});
        expect(DateUtils.datetimeToCalendarTime(LOCALE, date.format(), false, undefined, true)).toBe('Nov 5, 2022 at 10:17 AM');
    });

    it('should return the date in calendar time when calling datetimeToRelative', () => {
        const aFewSecondsAgo = moment().subtract(10, 'seconds');
        expect(DateUtils.datetimeToRelative(LOCALE, aFewSecondsAgo)).toBe('a few seconds ago');

        const aMinuteAgo = moment().subtract(1, 'minute');
        expect(DateUtils.datetimeToRelative(LOCALE, aMinuteAgo)).toBe('a minute ago');

        const anHourAgo = moment().subtract(1, 'hour');
        expect(DateUtils.datetimeToRelative(LOCALE, anHourAgo)).toBe('an hour ago');
    });

    it('should call addEventListener for all tracked events', () => {
        Object.defineProperty(global.document, 'addEventListener', { value: jest.fn() });

        DateUtils.startCurrentDateUpdater();
        expect(global.document.addEventListener).toHaveBeenCalledTimes(4);
    });

    describe('getCurrentTimezone', () => {
        it('should correct timezone', () => {
            expect(DateUtils.getCurrentTimezone()).toEqual({selected: DEFAULT_TIME_ZONE});
        });

        it('should return correct timezone if automatic and different than selected', () => {
            const testTimezone = 'America/Los_Angeles';
            moment.tz.guess = jest.fn(() => testTimezone);
            Onyx.init({
                keys: ONYXKEYS,
                initialKeyStates: {
                    [ONYXKEYS.SESSION]: {accountID: 999},
                    [ONYXKEYS.PERSONAL_DETAILS_LIST]: {999: {timezone: {selected: DEFAULT_TIME_ZONE, automatic: true}}},
                },
            });
            return waitForPromisesToResolve().then(() => {
                expect(DateUtils.getCurrentTimezone()).toEqual({selected: testTimezone, automatic: true});
            });
        });
    });

    it('should call moment when setTimezoneUpdated is called', () => {
        DateUtils.setTimezoneUpdated();
        expect(moment).toHaveBeenCalledTimes(1);
    });

    describe('getDBTime', () => {
        it('should return the date in the format expected by the database', () => {
            const getDBTime = DateUtils.getDBTime();
            expect(getDBTime).toBe(moment(getDBTime).format('YYYY-MM-DD HH:mm:ss.SSS'));
        });

        it('should represent the correct moment in utc when used with a standard datetime string', () => {
            const timestamp = 'Mon Nov 21 2022 19:04:14 GMT-0800 (Pacific Standard Time)';
            const getDBTime = DateUtils.getDBTime(timestamp);
            expect(getDBTime).toBe('2022-11-22 03:04:14.000');
        });

        it('should represent the correct moment in time when used with an ISO string', () => {
            const timestamp = '2022-11-22T03:08:04.326Z';
            const getDBTime = DateUtils.getDBTime(timestamp);
            expect(getDBTime).toBe('2022-11-22 03:08:04.326');
        });

        it('should represent the correct moment in time when used with a unix timestamp', () => {
            const timestamp = 1669086850792;
            const getDBTime = DateUtils.getDBTime(timestamp);
            expect(getDBTime).toBe('2022-11-22 03:14:10.792');
        });
    });
});
