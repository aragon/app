import {i18n} from '../../i18n.config';

import {ProposalData, VotingData} from './types';
/**
 * Note: This function will return a list of timestamp that we can use to categorize transfers
 * @return a object with milliseconds params
 */
export function getDateSections(): {
  lastWeek: number;
  lastMonth: number;
  lastYear: number;
} {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const lastWeek: number = new Date(date.setDate(diff)).getTime();
  const lastMonth: number = new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  ).getTime();
  const lastYear: number = new Date(date.getFullYear(), 0, 1).getTime();

  return {
    lastWeek,
    lastMonth,
    lastYear,
  };
}

export function daysToMils(days: number): number {
  return days * 24 * 60 * 60 * 1000;
}

/**
 * Returns the either:
 *
 *  - the current date
 *  - or the current date + the number of days passed as offset
 *
 * as a string with the following format: "yyyy-mm-dd".
 *
 * Note that the offset may be negative. This will return a date in the past.
 *
 * This date format is necessary when working with html inputs of type "date".
 */
export function getCanonicalDate(offset?: number): string {
  console.log('OFFSET ' + offset);
  const currDate = new Date();
  const offsetTime = currDate.getTime() + (offset ? daysToMils(offset) : 0);
  const offsetDate = new Date(offsetTime);
  const month = offsetDate.getMonth() + 1;
  const formattedMonth = month > 9 ? '' + month : '0' + month;
  const day = offsetDate.getDate();
  const formattedDay = day > 9 ? '' + day : '0' + day;
  const formattedDate =
    '' + offsetDate.getFullYear() + '-' + formattedMonth + '-' + formattedDay;
  console.log('formattedDate ' + formattedDate);
  return formattedDate;
}

/**
 * Returns the current time as a string with the following format:
 * "hh:mm".
 *
 * This time format is necessary when working with html inputs of type "time".
 */
export function getCanonicalTime(): string {
  const currDate = new Date();
  let currHours = currDate.getHours();
  let currMinutes = currDate.getMinutes();
  const formattedHours = currHours > 9 ? '' + currHours : '0' + currHours;
  const formattedMinutes =
    currMinutes > 9 ? '' + currMinutes : '0' + currMinutes;

  return '' + formattedHours + ':' + formattedMinutes;
}

export function getCanonicalUtcOffset(): string {
  const currDate = new Date();
  let decimalOffset = currDate.getTimezoneOffset() / 60;
  const isNegative = decimalOffset < 0;
  decimalOffset = Math.abs(decimalOffset);
  const hourOffset = Math.floor(decimalOffset);
  const minuteOffset = Math.round((decimalOffset - hourOffset) * 60);
  let formattedOffset = 'UTC' + (isNegative ? '+' : '-') + hourOffset;
  formattedOffset += minuteOffset > 0 ? ':' + minuteOffset : '';
  return formattedOffset;
}

/**
 * Note: This function will return the remaining time from input timestamp
 * to current time.
 * @param timestamp proposal creat/end timestamp must be greater than current timestamp
 * @returns remaining timestamp from now
 */
export function getRemainingTime(
  timestamp: number | string // in seconds
): number {
  const currentTimestamp = Math.floor(new Date().getTime() / 1000);
  return parseInt(`${timestamp}`) - currentTimestamp;
}

/**
 * Note: this function will convert the proposal's timestamp to proper string to show
 * as a alert message on proposals card
 * @param type return the message if the type was pending or active
 * @param voteData proposal's voting data, containing the timestamps (in UTC
 * seconds) of the start and end of vote.
 * @returns a message with i18 translation as proposal ends alert
 */
export function translateProposalDate(
  type: ProposalData['type'],
  voteData: VotingData
): string | null {
  let leftTimestamp;
  if (type === 'pending') {
    leftTimestamp = getRemainingTime(voteData.start);
  } else if (type === 'active') {
    leftTimestamp = getRemainingTime(voteData.end);
  } else {
    return null;
  }
  const days = Math.floor(leftTimestamp / 86400);
  const hours = Math.floor((leftTimestamp % 86400) / 3600);
  return i18n.t(`governance.proposals.${type}`, {days, hours}) as string;
}
