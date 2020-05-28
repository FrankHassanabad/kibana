/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { useCallback, useState, ReactNode, useEffect, useRef } from 'react';
import { EuiButton, EuiForm, EuiFormRow, EuiFilePicker, EuiRadioGroup } from '@elastic/eui';

import { Type as ListType } from '../../../../../lists/common/schemas';
import { useToasts } from '../../../common/lib/kibana';
import { importList } from '../../containers/lists/api';
import { ListResponse } from '../../containers/lists/types';
import * as i18n from './translations';

interface ListTypeOptions {
  id: ListType;
  label: ReactNode;
}

const options: ListTypeOptions[] = [
  {
    id: 'keyword',
    label: i18n.KEYWORDS_RADIO,
  },
  {
    id: 'ip',
    label: i18n.IP_RADIO,
  },
];

export interface ValueListsFormProps {
  onSuccess: (response: ListResponse) => void;
}

export const ValueListsFormComponent: React.FC<ValueListsFormProps> = ({ onSuccess }) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [type, setType] = useState<ListType>('keyword');
  const [importPending, setImportPending] = useState(false);
  const importTask = useRef(new AbortController());
  const toasts = useToasts();
  const filePickerRef = useRef<EuiFilePicker | null>(null);

  // EuiRadioGroup's onChange only infers 'string' from our options
  const handleRadioChange = useCallback((t: string) => setType(t as ListType), [setType]);

  const resetForm = useCallback(() => {
    if (filePickerRef.current?.fileInput) {
      filePickerRef.current.fileInput.value = '';
      filePickerRef.current.handleChange();
    }
    setType('keyword');
  }, [setType]);

  const handleCancel = useCallback(() => {
    setImportPending(false);
    importTask.current.abort();
  }, [setImportPending]);

  const handleSuccess = useCallback(
    (response: ListResponse) => {
      toasts.addSuccess({
        text: i18n.uploadSuccessMessage(response.name),
        title: i18n.UPLOAD_SUCCESS,
      });
      setImportPending(false);
      resetForm();
      onSuccess(response);
    },
    [toasts, resetForm, setImportPending, onSuccess]
  );
  const handleError = useCallback(
    (error: Error) => {
      setImportPending(false);
      if (error.name !== 'AbortError') {
        toasts.addError(error, { title: i18n.UPLOAD_ERROR });
      }
    },
    [toasts, setImportPending]
  );

  const handleImport = useCallback(async () => {
    if (!importPending && files?.length) {
      try {
        setImportPending(true);
        importTask.current = new AbortController();
        const response = await importList({
          file: files[0],
          listId: undefined,
          type,
          signal: importTask.current.signal,
        });

        handleSuccess(response);
      } catch (error) {
        handleError(error);
      }
    }
  }, [files, type, importPending, handleSuccess, handleError, importList]);

  useEffect(() => {
    return handleCancel;
  }, []);

  return (
    <EuiForm>
      <EuiFormRow fullWidth>
        <EuiFilePicker
          id="value-list-file-picker"
          initialPromptText={i18n.FILE_PICKER_PROMPT}
          ref={filePickerRef}
          onChange={setFiles}
          fullWidth={true}
          isLoading={importPending}
        />
      </EuiFormRow>
      <EuiFormRow label={i18n.LIST_TYPES_RADIO_LABEL}>
        <>
          <EuiRadioGroup
            options={options}
            idSelected={type}
            onChange={handleRadioChange}
            name="valueListType"
          />
          {importPending ? (
            <EuiButton onClick={handleCancel}>{i18n.CANCEL_BUTTON}</EuiButton>
          ) : (
            <EuiButton onClick={handleImport} disabled={!files?.length}>
              {i18n.UPLOAD_BUTTON}
            </EuiButton>
          )}
        </>
      </EuiFormRow>
    </EuiForm>
  );
};

ValueListsFormComponent.displayName = 'ValueListsFormComponent';

export const ValueListsForm = React.memo(ValueListsFormComponent);

ValueListsForm.displayName = 'ValueListsForm';
