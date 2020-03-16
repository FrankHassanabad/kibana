/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { useCallback } from 'react';
import styled from 'styled-components';
import { EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiSuperSelect, EuiText } from '@elastic/eui';

import { FieldHook, getFieldValidityAndErrorMessage } from '../../../../../shared_imports';
import { useSiemJobs } from '../../../../../components/ml_popover/hooks/use_siem_jobs';

interface MlJobSelectProps {
  field: FieldHook;
}

const Wrapper = styled(EuiFormRow)``;
const JobDisplay = ({ title, description }: { title: string; description: string }) => (
  <>
    <strong>{title}</strong>
    <EuiText size="xs" color="subdued">
      <p>{description}</p>
    </EuiText>
  </>
);

export const MlJobSelect = ({ field }: MlJobSelectProps) => {
  const jobId = field.value as string;
  const { isInvalid, errorMessage } = getFieldValidityAndErrorMessage(field);
  const [isLoading, siemJobs] = useSiemJobs(false);
  const handleJobChange = useCallback(
    (mlJobId: string) => {
      field.setValue(mlJobId);
    },
    [field]
  );

  const options = siemJobs.map(job => ({
    value: job.id,
    inputDisplay: job.id,
    dropdownDisplay: <JobDisplay title={job.id} description={job.description} />,
  }));

  return (
    <Wrapper fullWidth label={field.label} isInvalid={isInvalid} error={errorMessage}>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiSuperSelect
            hasDividers
            isLoading={isLoading}
            onChange={handleJobChange}
            options={options}
            valueOfSelected={jobId}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </Wrapper>
  );
};
