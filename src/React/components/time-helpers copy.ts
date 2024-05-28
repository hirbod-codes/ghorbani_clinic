// import { DateTime, DateTimeFormatOptions } from "luxon";

// const DATE_FORMAT: DateTimeFormatOptions = { weekday: 'short', month: 'short', year: 'numeric', day: '2-digit', hour: '2-digit', minute: '2-digit' };

// function localizeDate(initialTimezone: string, isoFormattedDate: string, locale: 'fa' | 'en', onlyChangeTimezone = false): DateTime {
//     let date = DateTime.fromISO(isoFormattedDate, { zone: initialTimezone });

//     switch (locale) {
//         case 'en':
//             date = date.setZone('utc');
//             break;

//         case 'fa':
//             date = date.setZone('Asia/Tehran');
//             if (onlyChangeTimezone === false) {
//                 date = date.reconfigure({ locale: 'fa-IR', outputCalendar: 'persian', numberingSystem: 'arabic' });
//             }
//             break;

//         default:
//             throw new Error('invalid value provided for locale parameter, only \'en\' and \'fa\' is acceptable.')
//             break;
//     }

//     return date;
// }

// function getFormatedDateAccordingToLocale(locale, timeIdentifier = '') {
//     let date = getDateObject(timeIdentifier);
//     return getDateTimeFormatObject(locale).format(date);
// }

// function getFormatedDateAccordingToLocaleInEnglish(locale, timeIdentifier = '') {
//     let date = getDateObject(timeIdentifier);
//     return getDateTimeFormatObjectInEnglish(locale).format(date);
// }

// function getDateTimeFormatObject(locale) {
//     let formatter = null;
//     if (locale === 'fa') {
//         formatter = getDateTimeFormatObjectForTehran();
//     } else {
//         formatter = getDateTimeFormatObjectForUTC();
//     }

//     return formatter;
// }

// function getDateTimeFormatOptions(locale) {
//     let formatter = null;
//     if (locale === 'fa') {
//         formatter = getDateTimeFormatOptionsForTehran();
//     } else {
//         formatter = getDateTimeFormatOptionsForUTC();
//     }

//     return formatter;
// }

// // For controlled input components
// function getDateTimeFormatObjectInEnglish(locale) {
//     let formatter = null;
//     if (locale === 'fa') {
//         formatter = getDateTimeFormatObjectForTehranInEnglish();
//     } else {
//         formatter = getDateTimeFormatObjectForUTC();
//     }

//     return formatter;
// }

// function getDateTimeFormatOptionsInEnglish(locale) {
//     let formatter = null;
//     if (locale === 'fa') {
//         formatter = getDateTimeFormatOptionsForTehranInEnglish();
//     } else {
//         formatter = getDateTimeFormatOptionsForUTC();
//     }

//     return formatter;
// }

// function getDateTimeFormatObjectForTehran() {
//     return new Intl.DateTimeFormat('fa-IR', getDateTimeFormatOptionsForTehran());
// }

// function getDateTimeFormatOptionsForTehran() {
//     return {
//         calendar: 'persian',
//         numberingSystem: 'arabic',
//         year: 'numeric',
//         month: 'numeric',
//         day: 'numeric',
//         weekday: 'long',

//         hour: '2-digit',
//         minute: '2-digit',
//         second: '2-digit',

//         timeZone: 'Asia/Tehran'
//     };
// }

// function getDateTimeFormatObjectForTehranInEnglish() {
//     return new Intl.DateTimeFormat('en-US', getDateTimeFormatOptionsForTehranInEnglish());
// }

// function getDateTimeFormatOptionsForTehranInEnglish() {
//     return {
//         year: 'numeric',
//         month: 'numeric',
//         day: 'numeric',
//         weekday: 'long',

//         hour: '2-digit',
//         minute: '2-digit',
//         second: '2-digit',

//         timeZone: 'Asia/Tehran'
//     };
// }

// function getDateTimeFormatObjectForUS() {
//     return new Intl.DateTimeFormat('en-US', getDateTimeFormatOptionsForUS());
// }

// function getDateTimeFormatOptionsForUS() {
//     return {
//         year: 'numeric',
//         month: 'numeric',
//         day: 'numeric',
//         weekday: 'long',

//         hour: '2-digit',
//         minute: '2-digit',
//         second: '2-digit',
//         timeZone: 'UTC',
//         timeZoneName: 'shortGeneric'
//     };
// }

// function getDateTimeFormatObjectForUTC() {
//     return new Intl.DateTimeFormat('en-US', getDateTimeFormatOptionsForUTC());
// }

// function getDateTimeFormatOptionsForUTC() {
//     return {
//         year: 'numeric',
//         month: 'numeric',
//         day: 'numeric',
//         weekday: 'long',

//         hour: '2-digit',
//         minute: '2-digit',
//         second: '2-digit',
//         timeZone: 'UTC',
//         timeZoneName: 'shortGeneric'
//     };
// }

// function getDateObject(timeIdentifier) {
//     let date = new Date();
//     if (typeof timeIdentifier === 'number') {
//         date.setMilliseconds(timeIdentifier);
//     } else {
//         if (typeof timeIdentifier === 'string') {
//             date = new Date(timeIdentifier);
//         } else {
//             if (typeof (timeIdentifier) === 'object') {
//                 date = timeIdentifier;
//             }
//         }
//     }

//     return date;
// }

// function resolveTimeZone(locale) {
//     switch (locale) {
//         case 'en':
//             return 'UTC'

//         case 'fa':
//             return 'Asia/Tehran'

//         default:
//             return null;
//     }
// }

// // weekDaysPeriods => {Monday: [{start:'00:00', end:'00:00'}, ...], ...}
// function convertWeekDays(weekDaysPeriods, fromTimezone, toTimezone) {
//     if (typeof (weekDaysPeriods) !== 'object') {
//         return null;
//     }

//     let weekDays = [];
//     for (const k in weekDaysPeriods) {
//         if (!Object.hasOwnProperty.call(weekDaysPeriods, k)) {
//             continue;
//         }

//         const weekDayPeriods = weekDaysPeriods[k];
//         if (Array.isArray(weekDayPeriods) !== true) {
//             continue;
//         } else {
//             if (weekDayPeriods.length === 0) {
//                 continue;
//             }
//         }

//         let weekDay = null;
//         let timePeriods = [];

//         weekDayPeriods
//             .forEach((v, i) => {
//                 weekDay = null;
//                 let startDate = DateTime.fromFormat(v.start, "yyyy-MM-dd HH:mm:ss", { zone: fromTimezone, setZone: true });
//                 weekDay = startDate.weekdayLong;
//                 let startDateConverted = null;
//                 if (toTimezone !== fromTimezone) {
//                     startDateConverted = startDate.setZone(toTimezone);
//                 } else {
//                     startDateConverted = DateTime.fromISO(startDate.toISO(), { zone: fromTimezone });
//                 }

//                 let endDate = DateTime.fromFormat(v.end, "yyyy-MM-dd HH:mm:ss", { zone: fromTimezone, setZone: true });
//                 let endDateConverted = null;
//                 if (toTimezone !== fromTimezone) {
//                     endDateConverted = endDate.setZone(toTimezone);
//                 } else {
//                     endDateConverted = DateTime.fromISO(endDate.toISO(), { zone: fromTimezone });
//                 }

//                 if (startDateConverted.day === startDate.day && endDateConverted.day === startDate.day) {
//                     let found = false;
//                     weekDays.forEach((v, j) => {
//                         if (v.weekDay === startDate.weekdayLong) {
//                             found = true;
//                             weekDays[j].timePeriods.push({ start: startDateConverted.toFormat('HH:mm:ss'), end: endDateConverted.toFormat('HH:mm:ss') });
//                         }
//                     });
//                     if (!found) {
//                         timePeriods.push({ start: startDateConverted.toFormat('HH:mm:ss'), end: endDateConverted.toFormat('HH:mm:ss') });
//                     }
//                 } else {
//                     if ((startDateConverted.day < startDate.day && endDateConverted.day < startDate.day) || (startDateConverted.day > startDate.day && endDateConverted.day > startDate.day)) {
//                         let found = false;
//                         weekDays.forEach((v, j) => {
//                             if (v.weekDay === startDateConverted.weekdayLong) {
//                                 found = true;
//                                 if (startDateConverted.day < startDate.day && endDateConverted.day < startDate.day) {
//                                     if (weekDays[j].timePeriods[weekDays[j].timePeriods.length - 1].end === (startDateConverted.toFormat('HH:mm:ss'))) {
//                                         weekDays[j].timePeriods[weekDays[j].timePeriods.length - 1].end = endDateConverted.toFormat('HH:mm:ss');
//                                     } else {
//                                         weekDays[j].timePeriods.push({ start: startDateConverted.toFormat('HH:mm:ss'), end: endDateConverted.toFormat('HH:mm:ss') });
//                                     }
//                                 } else {
//                                     if (weekDays[j].timePeriods[0].start === (endDateConverted.toFormat('HH:mm:ss'))) {
//                                         weekDays[j].timePeriods[0].start = startDateConverted.toFormat('HH:mm:ss');
//                                     } else {
//                                         weekDays[j].timePeriods.unshift({ start: startDateConverted.toFormat('HH:mm:ss'), end: endDateConverted.toFormat('HH:mm:ss') });
//                                     }
//                                 }
//                             }
//                         });
//                         if (!found) {
//                             weekDays.push({ weekDay: startDateConverted.weekdayLong, timePeriods: [{ start: startDateConverted.toFormat('HH:mm:ss'), end: endDateConverted.toFormat('HH:mm:ss') }] });
//                         }
//                     } else {
//                         if (startDateConverted.day < startDate.day) {
//                             let found = false;
//                             weekDays.forEach((v, j) => {
//                                 if (v.weekDay === startDate.weekdayLong) {
//                                     found = true;
//                                     weekDays[j].timePeriods.unshift({ start: '00:00:00', end: endDateConverted.toFormat('HH:mm:ss') });
//                                 }
//                             });
//                             if (!found) {
//                                 timePeriods.unshift({ start: '00:00:00', end: endDateConverted.toFormat('HH:mm:ss') });
//                             }

//                             found = false;
//                             weekDays.forEach((v, j) => {
//                                 if (v.weekDay === startDateConverted.weekdayLong) {
//                                     found = true;
//                                     if (weekDays[j].timePeriods[weekDays[j].timePeriods.length - 1].end === (startDateConverted.toFormat('HH:mm:ss'))) {
//                                         weekDays[j].timePeriods[weekDays[j].timePeriods.length - 1].end = '23:59:59';
//                                     } else {
//                                         weekDays[j].timePeriods.push({ start: startDateConverted.toFormat('HH:mm:ss'), end: '23:59:59' });
//                                     }
//                                 }
//                             });
//                             if (!found) {
//                                 weekDays.push({ weekDay: startDateConverted.weekdayLong, timePeriods: [{ start: startDateConverted.toFormat('HH:mm:ss'), end: '23:59:59' }] });
//                             }
//                         } else {
//                             let found = false;
//                             weekDays.forEach((v, j) => {
//                                 if (v.weekDay === startDate.weekdayLong) {
//                                     found = true;
//                                     weekDays[j].timePeriods.push({ start: startDateConverted.toFormat('HH:mm:ss'), end: '23:59:59' });
//                                 }
//                             });
//                             if (!found) {
//                                 timePeriods.push({ start: startDateConverted.toFormat('HH:mm:ss'), end: '23:59:59' });
//                             }


//                             found = false;
//                             weekDays.forEach((v, j) => {
//                                 if (v.weekDay === endDateConverted.weekdayLong) {
//                                     found = true;
//                                     if (weekDays[j].timePeriods[0].start === (endDateConverted.toFormat('HH:mm:ss'))) {
//                                         weekDays[j].timePeriods[0].start = '00:00:00';
//                                     } else {
//                                         weekDays[j].timePeriods.unshift({ start: '00:00:00', end: endDateConverted.toFormat('HH:mm:ss') });
//                                     }
//                                 }
//                             });
//                             if (!found) {
//                                 weekDays.unshift({ weekDay: endDateConverted.weekdayLong, timePeriods: [{ start: '00:00:00', end: endDateConverted.toFormat('HH:mm:ss') }] });
//                             }
//                         }
//                     }
//                 }
//             });

//         if (timePeriods.length === 0) {
//             continue;
//         }

//         weekDays.push({ weekDay: weekDay, timePeriods: timePeriods });
//     }

//     if (weekDays.length === 0) {
//         return null;
//     }

//     return weekDays;
// }

// function convertWeeklyTimePatterns(weeklyTimePatterns, fromTimezone, toTimezone) {
//     let newWeeklyTimePatterns = {};

//     for (const weekDay in weeklyTimePatterns) {
//         if (Object.hasOwnProperty.call(weeklyTimePatterns, weekDay)) {
//             const timePatterns = weeklyTimePatterns[weekDay];

//             if (!Array.isArray(timePatterns)) {
//                 continue;
//             }

//             timePatterns.forEach((timePattern, i) => {
//                 let startDate = DateTime.fromFormat(timePattern.start + ' ' + weekDay, "HH:mm:ss cccc", { zone: fromTimezone, setZone: true });
//                 let startDateConverted = null;
//                 if (toTimezone !== fromTimezone) {
//                     startDateConverted = startDate.setZone(toTimezone);
//                 } else {
//                     startDateConverted = startDate;
//                 }

//                 let endDate = DateTime.fromFormat(timePattern.end + ' ' + weekDay, "HH:mm:ss cccc", { zone: fromTimezone, setZone: true });
//                 let endDateConverted = null;
//                 if (toTimezone !== fromTimezone) {
//                     endDateConverted = endDate.setZone(toTimezone);
//                 } else {
//                     endDateConverted = endDate;
//                 }

//                 if (startDateConverted.weekdayLong !== weekDay && endDateConverted.weekdayLong !== weekDay) {
//                     if (!Object.hasOwnProperty.call(newWeeklyTimePatterns, startDateConverted.weekdayLong)) {
//                         newWeeklyTimePatterns[startDateConverted.weekdayLong] = [];
//                     }

//                     newWeeklyTimePatterns[startDateConverted.weekdayLong].push({ start: startDateConverted.toFormat('HH:mm:ss'), end: endDateConverted.toFormat('HH:mm:ss') });
//                 } else {
//                     if (startDateConverted.weekdayLong !== weekDay) {
//                         if (!Object.hasOwnProperty.call(newWeeklyTimePatterns, startDateConverted.weekdayLong)) {
//                             newWeeklyTimePatterns[startDateConverted.weekdayLong] = [];
//                         }

//                         newWeeklyTimePatterns[startDateConverted.weekdayLong].push({ start: startDateConverted.toFormat('HH:mm:ss'), end: '23:59:59' });

//                         if (!Object.hasOwnProperty.call(newWeeklyTimePatterns, weekDay)) {
//                             newWeeklyTimePatterns[weekDay] = [];
//                         }

//                         newWeeklyTimePatterns[weekDay].push({ start: '00:00:00', end: endDateConverted.toFormat('HH:mm:ss') });
//                     } else {
//                         if (endDateConverted.weekdayLong !== weekDay) {
//                             if (!Object.hasOwnProperty.call(newWeeklyTimePatterns, endDateConverted.weekdayLong)) {
//                                 newWeeklyTimePatterns[endDateConverted.weekdayLong] = [];
//                             }

//                             newWeeklyTimePatterns[endDateConverted.weekdayLong].push({ start: '00:00:00', end: endDateConverted.toFormat('HH:mm:ss') });

//                             if (!Object.hasOwnProperty.call(newWeeklyTimePatterns, weekDay)) {
//                                 newWeeklyTimePatterns[weekDay] = [];
//                             }

//                             newWeeklyTimePatterns[weekDay].push({ start: startDateConverted.toFormat('HH:mm:ss'), end: '23:59:59' });
//                         } else {
//                             if (!Object.hasOwnProperty.call(newWeeklyTimePatterns, weekDay)) {
//                                 newWeeklyTimePatterns[weekDay] = [];
//                             }

//                             newWeeklyTimePatterns[weekDay].push({ start: startDateConverted.toFormat('HH:mm:ss'), end: endDateConverted.toFormat('HH:mm:ss') });
//                         }
//                     }
//                 }
//             });
//         }
//     }

//     return newWeeklyTimePatterns;
// }

// export {
//     DATE_FORMAT as MY_FAVORITE_DATE_FORMAT,
//     localizeDate,
//     getDateTimeFormatOptions,
//     getDateTimeFormatOptionsInEnglish,
//     getDateTimeFormatOptionsForTehran,
//     getDateTimeFormatOptionsForTehranInEnglish,
//     getDateTimeFormatOptionsForUS,
//     getDateTimeFormatOptionsForUTC,
//     resolveTimeZone,
//     convertWeekDays,
//     convertWeeklyTimePatterns,
//     getFormatedDateAccordingToLocaleInEnglish,
//     getDateTimeFormatObjectInEnglish,
//     getDateTimeFormatObjectForTehranInEnglish,
//     getDateTimeFormatObjectForTehran,
//     getDateTimeFormatObjectForUS,
//     getDateTimeFormatObjectForUTC,
//     getFormatedDateAccordingToLocale,
//     getDateTimeFormatObject,
//     getDateObject,
//     iterateRecursively,
//     updateState,
//     doesExist
// };