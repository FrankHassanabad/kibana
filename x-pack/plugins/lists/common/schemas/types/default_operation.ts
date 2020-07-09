/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import * as t from 'io-ts';
import { Either } from 'fp-ts/lib/Either';

export const operation = t.keyof({ update: null, upsert: null });
export type Operation = t.TypeOf<typeof operation>;

export type OperationC = t.Type<Operation, Operation, unknown>;

/**
 * Types the DefaultOperation as:
 *   - If null or undefined, then a default of "update" will be used.
 */
export const DefaultOperation: OperationC = new t.Type<Operation, Operation, unknown>(
  'DefaultOperation',
  operation.is,
  (input, context): Either<t.Errors, Operation> =>
    input == null ? t.success('update') : operation.validate(input, context),
  t.identity
);
