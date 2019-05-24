/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { EuiButton, EuiHorizontalRule, EuiIcon, EuiSpacer, EuiTitle } from '@elastic/eui';
import theme from '@elastic/eui/dist/eui_theme_light.json';
import { FormattedMessage } from '@kbn/i18n/react';
import React from 'react';
import styled from 'styled-components';

export const Icon = styled(EuiIcon)`
  margin-right: ${theme.euiSizeS};
`;

export class HelpMenuComponent extends React.PureComponent {
  public render() {
    return (
      <>
        <EuiHorizontalRule margin="none" />

        <EuiSpacer />

        <EuiTitle size="xxs">
          <h6>
            <Icon type="securityAnalyticsApp" />
            <FormattedMessage
              id="xpack.siem.chrome.help.title"
              defaultMessage="SIEM Application Help"
            />
          </h6>
        </EuiTitle>

        <EuiSpacer />

        <EuiButton iconType="popout" href="https://discuss.elastic.co/c/siem" target="_blank">
          <FormattedMessage id="xpack.siem.chrome.help.feedback" defaultMessage="Submit feedback" />
        </EuiButton>
      </>
    );
  }
}
