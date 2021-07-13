/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { useEffect, useRef, useState } from 'react';
import { debounce } from 'lodash';
import { ListOperatorTypeEnum as OperatorTypeEnum } from '@kbn/securitysolution-io-ts-list-types';

// TODO: I have to use any here for now, but once this is available below, we should use the correct types
// import { AutocompleteStart } from '../../../../../../../../src/plugins/data/public';
type AutocompleteStart = any;

// TODO: I have to use any here for now, but once this is available below, we should use the correct types
// import { IFieldType, IIndexPattern } from '../../../../../../../../src/plugins/data/common';
type IFieldType = any;
type IIndexPattern = any;

interface FuncArgs {
  fieldSelected: IFieldType | undefined;
  patterns: IIndexPattern | undefined;
  searchQuery: string;
  value: string | string[] | undefined;
}

type Func = (args: FuncArgs) => void;

export type UseFieldValueAutocompleteReturn = [boolean, boolean, string[], Func | null];

export interface UseFieldValueAutocompleteProps {
  autocompleteService: AutocompleteStart;
  fieldValue: string | string[] | undefined;
  indexPattern: IIndexPattern | undefined;
  operatorType: OperatorTypeEnum;
  query: string;
  selectedField: IFieldType | undefined;
}
/**
 * Hook for using the field value autocomplete service
 */
export const useFieldValueAutocomplete = ({
  selectedField,
  operatorType,
  fieldValue,
  query,
  indexPattern,
  autocompleteService,
}: UseFieldValueAutocompleteProps): UseFieldValueAutocompleteReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestingValues, setIsSuggestingValues] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const updateSuggestions = useRef<Func | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    const abortCtrl = new AbortController();

    const fetchSuggestions = debounce(
      async ({ fieldSelected, patterns, searchQuery }: FuncArgs) => {
        try {
          if (isSubscribed) {
            if (fieldSelected == null || patterns == null) {
              return;
            }

            if (fieldSelected.type === 'boolean') {
              setIsSuggestingValues(false);
              return;
            }

            setIsLoading(true);

            const field =
              fieldSelected.subType != null && fieldSelected.subType.nested != null
                ? {
                    ...fieldSelected,
                    name: `${fieldSelected.subType.nested.path}.${fieldSelected.name}`,
                  }
                : fieldSelected;

            const newSuggestions = await autocompleteService.getValueSuggestions({
              field,
              indexPattern: patterns,
              query: searchQuery,
              signal: abortCtrl.signal,
            });

            if (newSuggestions.length === 0) {
              setIsSuggestingValues(false);
            }

            setIsLoading(false);
            setSuggestions([...newSuggestions]);
          }
        } catch (error) {
          if (isSubscribed) {
            setSuggestions([]);
            setIsLoading(false);
          }
        }
      },
      500
    );

    if (operatorType !== OperatorTypeEnum.EXISTS) {
      fetchSuggestions({
        fieldSelected: selectedField,
        patterns: indexPattern,
        searchQuery: query,
        value: fieldValue,
      });
    }

    updateSuggestions.current = fetchSuggestions;

    return (): void => {
      isSubscribed = false;
      abortCtrl.abort();
    };
  }, [selectedField, operatorType, fieldValue, indexPattern, query, autocompleteService]);

  return [isLoading, isSuggestingValues, suggestions, updateSuggestions.current];
};
