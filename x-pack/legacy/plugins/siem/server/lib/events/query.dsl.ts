/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { SortField, TimerangeInput } from '../../graphql/types';
import { createQueryFilterClauses } from '../../utils/build_query';
import { RequestOptions, RequestOptionsPaginated } from '../framework';
import { SortRequest } from '../types';

import { TimerangeFilter } from './types';

export const buildQuery = (options: RequestOptionsPaginated) => {
  const { querySize } = options.pagination;
  const { fields, filterQuery } = options;
  const filterClause = [...createQueryFilterClauses(filterQuery)];
  const defaultIndex = options.defaultIndex;

  const getTimerangeFilter = (timerange: TimerangeInput | undefined): TimerangeFilter[] => {
    if (timerange) {
      const { to, from } = timerange;
      console.log('I AM RETURNING:', [
        {
          range: {
            [options.sourceConfiguration.fields.timestamp]: {
              gte: from,
              lte: to,
              format: 'epoch_millis',
            },
          },
        },
      ]);
      return [
        {
          range: {
            [options.sourceConfiguration.fields.timestamp]: {
              gte: from,
              lte: to,
              format: 'epoch_millis',
            },
          },
        },
      ];
    }
    return [];
  };

  console.log('creating filter');
  const filter = [...filterClause, ...getTimerangeFilter(options.timerange), { match_all: {} }];
  console.log('filter is: ', filter);

  const getSortField = (sortField: SortField) => {
    if (sortField.sortFieldId) {
      const field: string =
        sortField.sortFieldId === 'timestamp' ? '@timestamp' : sortField.sortFieldId;

      return [
        { [field]: sortField.direction },
        { [options.sourceConfiguration.fields.tiebreaker]: sortField.direction },
      ];
    }
    return [];
  };

  const sort: SortRequest = getSortField(options.sortField!);

  const dslQuery = {
    allowNoIndices: true,
    index: defaultIndex,
    ignoreUnavailable: true,
    body: {
      query: {
        bool: {
          filter,
        },
      },
      size: querySize,
      track_total_hits: true,
      sort,
      _source: fields,
    },
  };

  return dslQuery;
};

export const buildTimelineQuery = (options: RequestOptions) => {
  console.log('I AM IN BUILD TIMELINE QUERY', JSON.stringify(options, null, 2));
  const { limit, cursor, tiebreaker } = options.pagination;
  const { fields, filterQuery } = options;
  const filterClause = [...createQueryFilterClauses(filterQuery)];
  const defaultIndex = options.defaultIndex;

  const getTimerangeFilter = (timerange: TimerangeInput | undefined): TimerangeFilter[] => {
    console.log('I AM IN getTimerangeFilter', JSON.stringify(timerange, null, 2));
    if (timerange) {
      const { to, from } = timerange;
      console.log('I AM RETURNING:', [
        {
          range: {
            [options.sourceConfiguration.fields.timestamp]: {
              gte: from,
              lte: to,
              format: 'epoch_millis',
            },
          },
        },
      ]);
      return [
        {
          range: {
            [options.sourceConfiguration.fields.timestamp]: {
              gte: from,
              lte: to,
              format: 'epoch_millis',
            },
          },
        },
      ];
    }
    console.log('RETURNING EMPTY ARRAY');
    return [];
  };

  console.log('creating filter second one');
  const filter = [...filterClause, ...getTimerangeFilter(options.timerange), { match_all: {} }];
  console.log('creating filter second one done', JSON.stringify(filter, null, 2));

  const getSortField = (sortField: SortField) => {
    if (sortField.sortFieldId) {
      const field: string =
        sortField.sortFieldId === 'timestamp' ? '@timestamp' : sortField.sortFieldId;

      return [
        { [field]: sortField.direction },
        { [options.sourceConfiguration.fields.tiebreaker]: sortField.direction },
      ];
    }
    return [];
  };

  const sort: SortRequest = getSortField(options.sortField!);

  const dslQuery = {
    allowNoIndices: true,
    index: defaultIndex,
    ignoreUnavailable: true,
    body: {
      query: {
        bool: {
          filter,
        },
      },
      size: limit + 1,
      track_total_hits: true,
      sort,
      _source: fields,
    },
  };

  if (cursor && tiebreaker) {
    return {
      ...dslQuery,
      body: {
        ...dslQuery.body,
        search_after: [cursor, tiebreaker],
      },
    };
  }

  return dslQuery;
};

export const buildDetailsQuery = (indexName: string, id: string) => ({
  allowNoIndices: true,
  index: indexName,
  ignoreUnavailable: true,
  body: {
    query: {
      terms: {
        _id: [id],
      },
    },
  },
  size: 1,
});
