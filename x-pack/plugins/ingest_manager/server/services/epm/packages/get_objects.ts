/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { SavedObject, SavedObjectsBulkCreateObject } from 'src/core/server';
import { createPromiseFromStreams } from 'src/legacy/utils';
// eslint-disable-next-line @kbn/eslint/no-restricted-paths
import { AddPrepackagedRulesSchemaDecoded } from '../../../../../security_solution/common/detection_engine/schemas/request/add_prepackaged_rules_schema';
import { createRulesStreamFromNdJson } from '../../../../../security_solution/server/lib/detection_engine/rules/create_rules_stream_from_ndjson';
import { AssetType } from '../../../types';
import * as Registry from '../registry';

type ArchiveAsset = Pick<SavedObject, 'attributes' | 'migrationVersion' | 'references'>;
type SavedObjectToBe = Required<SavedObjectsBulkCreateObject> & { type: AssetType };

export async function getObject(key: string) {
  const buffer = Registry.getAsset(key);

  // cache values are buffers. convert to string / JSON
  const json = buffer.toString('utf8');
  // convert that to an object
  const asset: ArchiveAsset = JSON.parse(json);

  const { type, file } = Registry.pathParts(key);
  const savedObject: SavedObjectToBe = {
    type,
    id: file.replace('.json', ''),
    attributes: asset.attributes,
    references: asset.references || [],
    migrationVersion: asset.migrationVersion || {},
  };

  return savedObject;
}

export async function getRulesFromStream(key: string) {
  const buffer = Registry.getAsset(key);
  const ndjson = buffer.toString('utf8');
  /*
  const readStream = createRulesStreamFromNdJson(Number.MAX_VALUE);
  const parsedObjects = await createPromiseFromStreams<AddPrepackagedRulesSchemaDecoded[]>([
    ndjson,
    ...readStream,
  ]);
  */
  // cache values are buffers. convert to string / JSON
  console.log('RAW DATA IS:', ndjson);

  // return savedObject;
}
