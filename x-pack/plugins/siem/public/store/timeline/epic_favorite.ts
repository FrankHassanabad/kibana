/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { get } from 'lodash/fp';
import { Action } from 'redux';
import { Epic } from 'redux-observable';
import { Observable, empty, from } from 'rxjs';
import { filter, mergeMap, startWith, takeUntil, withLatestFrom } from 'rxjs/operators';

import { persistTimelineFavoriteMutation } from '../../containers/timeline/favorite/persist.gql_query';
import { PersistTimelineFavoriteMutation, ResponseFavoriteTimeline } from '../../graphql/types';

import {
  endTimelineSaving,
  startTimelineSaving,
  updateIsFavorite,
  updateTimeline,
} from './actions';
import { dispatcherTimelinePersistQueue, myEpicTimelineId, refetchQueries } from './epic';
import { TimelineById } from './reducer';

export const timelineFavoriteActionsType = [updateIsFavorite.type];

export const epicPersistTimelineFavorite = (
  apolloClient: ApolloClient<NormalizedCacheObject>,
  action: Action,
  timeline: TimelineById,
  action$: Observable<Action>,
  timeline$: Observable<TimelineById>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Observable<any> =>
  from(
    apolloClient.mutate<
      PersistTimelineFavoriteMutation.Mutation,
      PersistTimelineFavoriteMutation.Variables
    >({
      mutation: persistTimelineFavoriteMutation,
      fetchPolicy: 'no-cache',
      variables: {
        timelineId: myEpicTimelineId.getTimelineId(),
      },
      refetchQueries,
    })
  ).pipe(
    withLatestFrom(timeline$),
    mergeMap(([result, recentTimelines]) => {
      const savedTimeline = recentTimelines[get('payload.id', action)];
      const response: ResponseFavoriteTimeline = get('data.persistFavorite', result);
      return [
        updateTimeline({
          id: get('payload.id', action),
          timeline: {
            ...savedTimeline,
            isFavorite: response.favorite != null && response.favorite.length > 0,
            savedObjectId: response.savedObjectId || null,
            version: response.version || null,
          },
        }),
        endTimelineSaving({
          id: get('payload.id', action),
        }),
      ];
    }),
    startWith(startTimelineSaving({ id: get('payload.id', action) })),
    takeUntil(
      action$.pipe(
        withLatestFrom(timeline$),
        filter(([checkAction, updatedTimeline]) => {
          if (
            checkAction.type === endTimelineSaving.type &&
            updatedTimeline[get('payload.id', checkAction)].savedObjectId != null
          ) {
            myEpicTimelineId.setTimelineId(
              updatedTimeline[get('payload.id', checkAction)].savedObjectId
            );
            myEpicTimelineId.setTimelineVersion(
              updatedTimeline[get('payload.id', checkAction)].version
            );
            return true;
          }
          return false;
        })
      )
    )
  );

export const createTimelineFavoriteEpic = <State>(): Epic<Action, Action, State> => action$ =>
  action$.pipe(
    filter(action => timelineFavoriteActionsType.includes(action.type)),
    mergeMap(action => {
      dispatcherTimelinePersistQueue.next({ action });
      return empty();
    })
  );
