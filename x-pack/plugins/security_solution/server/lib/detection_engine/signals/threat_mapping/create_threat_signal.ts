/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { buildThreatMappingFilter } from './build_threat_mapping_filter';

import { getFilter } from '../get_filter';
import { searchAfterAndBulkCreate } from '../search_after_bulk_create';
import { CreateThreatSignalOptions, ThreatSignalResults } from './types';
import { combineResults } from './utils';

export const createThreatSignal = async ({
  threatMapping,
  query,
  inputIndex,
  type,
  filters,
  language,
  savedId,
  services,
  exceptionItems,
  gap,
  previousStartedAt,
  listClient,
  logger,
  eventsTelemetry,
  alertId,
  outputIndex,
  params,
  searchAfterSize,
  actions,
  createdBy,
  createdAt,
  updatedBy,
  interval,
  updatedAt,
  enabled,
  refresh,
  tags,
  throttle,
  buildRuleMessage,
  name,
  currentThreatList,
  currentResult,
}: CreateThreatSignalOptions): Promise<ThreatSignalResults> => {
  const threatFilter = buildThreatMappingFilter({
    threatMapping,
    threatList: currentThreatList,
  });

  if (threatFilter.query.bool.should.length === 0) {
    // empty threat list and we do not want to return everything as being
    // a hit so opt to return the existing result.
    logger.debug(
      buildRuleMessage(
        'Threat list is empty after filtering for missing data, returning without attempting a match'
      )
    );
    return { results: currentResult };
  } else {
    const esFilter = await getFilter({
      type,
      filters: [...filters, threatFilter],
      language,
      query,
      savedId,
      services,
      index: inputIndex,
      lists: exceptionItems,
    });

    logger.debug(buildRuleMessage('Threat list is attempting a match and signal creation'));
    const newResult = await searchAfterAndBulkCreate({
      gap,
      previousStartedAt,
      listClient,
      exceptionsList: exceptionItems,
      ruleParams: params,
      services,
      logger,
      eventsTelemetry,
      id: alertId,
      inputIndexPattern: inputIndex,
      signalsIndex: outputIndex,
      filter: esFilter,
      actions,
      name,
      createdBy,
      createdAt,
      updatedBy,
      updatedAt,
      interval,
      enabled,
      pageSize: searchAfterSize,
      refresh,
      tags,
      throttle,
      buildRuleMessage,
    });
    const results = combineResults(currentResult, newResult);
    logger.debug(
      buildRuleMessage(
        `Threat list completed matching a round against indexes and the time to search was ${
          newResult.searchAfterTimes.length !== 0 ? newResult.searchAfterTimes : '(unknown) '
        }ms`
      )
    );
    return { results };
  }
};
