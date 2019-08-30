/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import chrome from 'ui/chrome';
import dateMath from '@elastic/datemath';
import moment from 'moment';
import { isString } from 'lodash/fp';
import { DEFAULT_TIME_RANGE } from '../../common/constants';

interface DefaultTimeRange {
  from?: string | null;
  to?: string | null;
}

// Defaults are in case the user adds a null or undefined JSON string
const DEFAULT_FROM = 'now-24h';
const DEFAULT_TO = 'now';

export const getDefaultFromString = (): string => {
  const defaultTimeRange: DefaultTimeRange | null | undefined = chrome
    .getUiSettingsClient()
    .get(DEFAULT_TIME_RANGE);
  if (defaultTimeRange != null && isString(defaultTimeRange.from)) {
    return defaultTimeRange.from;
  } else {
    return DEFAULT_FROM;
  }
};

export const getDefaultToString = (): string => {
  const defaultTimeRange: DefaultTimeRange = chrome.getUiSettingsClient().get(DEFAULT_TIME_RANGE);
  if (isString(defaultTimeRange.to)) {
    return defaultTimeRange.to;
  } else {
    return DEFAULT_TO;
  }
};

export const getDefaultFromValue = (): number => getDefaultFromMoment().valueOf();

export const getDefaultFromMoment = (): moment.Moment => {
  const defaultTimeRange: DefaultTimeRange = chrome.getUiSettingsClient().get(DEFAULT_TIME_RANGE);
  return parseDateString(defaultTimeRange.from, DEFAULT_FROM, moment());
};

export const getDefaultToValue = (): number => getDefaultToMoment().valueOf();

export const getDefaultToMoment = (): moment.Moment => {
  const defaultTimeRange: DefaultTimeRange = chrome.getUiSettingsClient().get(DEFAULT_TIME_RANGE);
  return parseDateString(defaultTimeRange.to, DEFAULT_TO, moment());
};

export const parseDateString = (
  dateString: string | null | undefined,
  defaultDateString: string,
  defaultDate: moment.Moment
): moment.Moment => {
  if (dateString != null) {
    return parseDateWithDefault(dateString, defaultDate);
  } else {
    return parseDateWithDefault(defaultDateString, defaultDate);
  }
};

export const parseDateWithDefault = (
  dateString: string,
  defaultDate: moment.Moment
): moment.Moment => {
  const date = dateMath.parse(dateString);
  if (date != null) {
    return date;
  } else {
    return defaultDate;
  }
};
