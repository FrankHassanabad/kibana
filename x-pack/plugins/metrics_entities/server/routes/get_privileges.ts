/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { schema } from '@kbn/config-schema';

import { IRouter } from '../../../../../src/core/server';
import { METRICS_ENTITIES_TRANSFORM_PRIVILEGES } from '../../common/constants';
// TODO: Use this or remove it
// import { ModuleNames } from '../modules';
// import { getMetricsEntitiesClient } from './utils/get_metrics_entities_client';

/**
 * Gets privileges of users for the transforms
 * @param router The router to get the collection of transforms
 */
export const getPrivileges = (router: IRouter): void => {
  router.post(
    {
      path: METRICS_ENTITIES_TRANSFORM_PRIVILEGES,
      validate: {
        // TODO: Add the validation instead of allowing handler to have access to raw non-validated in runtime
        body: schema.object({}, { unknowns: 'allow' }),
        query: schema.object({}, { unknowns: 'allow' }),
      },
    },
    async (context, request, response) => {
      // TODO: Make this work
      // const metrics = getMetricsEntitiesClient(context);
      // const summaries = await metrics.getPrivileges();

      return response.custom({
        body: { acknowledged: true },
        statusCode: 201,
      });
    }
  );
};
