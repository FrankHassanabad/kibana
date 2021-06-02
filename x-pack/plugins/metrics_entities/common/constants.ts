/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/**
 * Base route
 */
export const METRICS_ENTITIES_URL = '/api/metrics_entities';

/**
 * Transforms route
 */
export const METRICS_ENTITIES_TRANSFORMS = `${METRICS_ENTITIES_URL}/transforms`;

/**
 * Gets the privileges of the user in relation to the transforms
 */
export const METRICS_ENTITIES_TRANSFORM_PRIVILEGES = `${METRICS_ENTITIES_URL}/transforms/privileges`;

/**
 * Global prefix for all the transform jobs
 */
export const ELASTIC_NAME = 'estc';
