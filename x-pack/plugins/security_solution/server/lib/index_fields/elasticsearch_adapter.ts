/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { isEmpty } from 'lodash/fp';

import { IndexField } from '../../graphql/types';
import { baseCategoryFields, getDocumentation, hasDocumentation } from '../../utils/beat_schema';
import { FrameworkAdapter, FrameworkRequest } from '../framework';
import { FieldsAdapter, IndexFieldDescriptor } from './types';

export class ElasticsearchIndexFieldAdapter implements FieldsAdapter {
  constructor(private readonly framework: FrameworkAdapter) {}
  public async getIndexFields(request: FrameworkRequest, indices: string[]): Promise<IndexField[]> {
    const indexPatternsService = this.framework.getIndexPatternsService(request);
    const responsesIndexFields = await Promise.all(
      indices.map((index) => {
        return indexPatternsService.getFieldsForWildcard({
          pattern: index,
        });
      })
    );
    return formatIndexFields(responsesIndexFields, indices);
  }
}

const missingFields = [
  {
    name: '_id',
    type: 'string',
    searchable: true,
    aggregatable: false,
    readFromDocValues: true,
  },
  {
    name: '_index',
    type: 'string',
    searchable: true,
    aggregatable: true,
    readFromDocValues: true,
  },
];

export const createFieldItem = (
  indexesAlias: string[],
  index: IndexFieldDescriptor,
  indexesAliasIdx: number
): IndexField => {
  const alias = indexesAlias[indexesAliasIdx];
  const splitName = index.name.split('.');
  const category = baseCategoryFields.includes(splitName[0]) ? 'base' : splitName[0];
  return {
    ...(hasDocumentation(alias, index.name) ? getDocumentation(alias, index.name) : {}),
    ...index,
    category,
    indexes: [alias],
  };
};

export const formatFirstFields = async (
  responsesIndexFields: IndexFieldDescriptor[][],
  indexesAlias: string[]
): Promise<IndexField[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        responsesIndexFields.reduce(
          (
            accumulator: IndexField[],
            indexFields: IndexFieldDescriptor[],
            indexesAliasIdx: number
          ) => {
            missingFields.forEach((index) => {
              const item = createFieldItem(indexesAlias, index, indexesAliasIdx);
              accumulator.push(item);
            });
            indexFields.forEach((index: IndexFieldDescriptor) => {
              const item = createFieldItem(indexesAlias, index, indexesAliasIdx);
              accumulator.push(item);
            });
            return accumulator;
          },
          []
        )
      );
    });
  });
};

export const formatSecondFields = async (fields: IndexField[]): Promise<IndexField[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const indexFieldNameHash: Record<string, number> = {};
      const reduced = fields.reduce((accumulator: IndexField[], indexfield: IndexField) => {
        const alreadyExistingIndexField = indexFieldNameHash[indexfield.name];
        if (alreadyExistingIndexField != null) {
          const existingIndexField = accumulator[alreadyExistingIndexField];
          if (isEmpty(accumulator[alreadyExistingIndexField].description)) {
            accumulator[alreadyExistingIndexField].description = indexfield.description;
          }
          accumulator[alreadyExistingIndexField].indexes = Array.from(
            new Set([...existingIndexField.indexes, ...indexfield.indexes])
          );
          return accumulator;
        }
        accumulator.push(indexfield);
        indexFieldNameHash[indexfield.name] = accumulator.length - 1;
        return accumulator;
      }, []);
      resolve(reduced);
    });
  });
};

export const formatIndexFields = async (
  responsesIndexFields: IndexFieldDescriptor[][],
  indexesAlias: string[]
): Promise<IndexField[]> => {
  console.time('formatIndexFields fields 1');
  const fields = await formatFirstFields(responsesIndexFields, indexesAlias);
  console.timeEnd('formatIndexFields fields 1');

  console.time('formatIndexFields fields 2');
  const secondFields = await formatSecondFields(fields);
  console.timeEnd('formatIndexFields fields 2');

  return secondFields;
};
