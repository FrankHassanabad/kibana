/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { EuiHorizontalRule, EuiSpacer } from '@elastic/eui';
import { getOr } from 'lodash/fp';
import React from 'react';
import { connect } from 'react-redux';
import { StickyContainer } from 'react-sticky';
import { pure } from 'recompose';
import chrome, { Breadcrumb } from 'ui/chrome';

import { EmptyPage } from '../../components/empty_page';
import { FiltersGlobal } from '../../components/filters_global';
import { HeaderPage } from '../../components/header_page';
import { LastEventTime } from '../../components/last_event_time';
import { NetworkComponentProps, getNetworkUrl } from '../../components/link_to/redirect_to_network';
import { manageQuery } from '../../components/page/manage_query';
import { DomainsTable } from '../../components/page/network/domains_table';
import { FlowTargetSelectConnected } from '../../components/page/network/flow_target_select_connected';
import { IpOverview } from '../../components/page/network/ip_overview';
import { TlsTable } from '../../components/page/network/tls_table';
import { UsersTable } from '../../components/page/network/users_table';
import { UrlStateContainer } from '../../components/url_state';
import { DomainsQuery } from '../../containers/domains';
import { GlobalTime } from '../../containers/global_time';
import { IpOverviewQuery } from '../../containers/ip_overview';
import { WithSource, indicesExistOrDataTemporarilyUnavailable } from '../../containers/source';
import { TlsQuery } from '../../containers/tls';
import { UsersQuery } from '../../containers/users';
import { FlowTarget, LastEventIndexKey } from '../../graphql/types';
import { decodeIpv6 } from '../../lib/helpers';
import { State, networkModel, networkSelectors } from '../../store';

import { NetworkKql } from './kql';
import * as i18n from './translations';

const basePath = chrome.getBasePath();

const DomainsTableManage = manageQuery(DomainsTable);
const TlsTableManage = manageQuery(TlsTable);
const UsersTableManage = manageQuery(UsersTable);

interface IPDetailsComponentReduxProps {
  filterQuery: string;
  flowTarget: FlowTarget;
}

type IPDetailsComponentProps = IPDetailsComponentReduxProps & NetworkComponentProps;

const IPDetailsComponent = pure<IPDetailsComponentProps>(
  ({
    match: {
      params: { ip },
    },
    filterQuery,
    flowTarget,
  }) => (
    <WithSource sourceId="default">
      {({ indicesExist, indexPattern }) =>
        indicesExistOrDataTemporarilyUnavailable(indicesExist) ? (
          <StickyContainer>
            <FiltersGlobal>
              <NetworkKql indexPattern={indexPattern} type={networkModel.NetworkType.details} />
              <UrlStateContainer indexPattern={indexPattern} />
            </FiltersGlobal>

            <HeaderPage
              subtitle={<LastEventTime indexKey={LastEventIndexKey.ipDetails} ip={ip} />}
              title={ip}
            >
              <FlowTargetSelectConnected />
            </HeaderPage>

            <GlobalTime>
              {({ to, from, setQuery }) => (
                <>
                  <IpOverviewQuery
                    sourceId="default"
                    filterQuery={filterQuery}
                    type={networkModel.NetworkType.details}
                    ip={decodeIpv6(ip)}
                  >
                    {({ ipOverviewData, loading }) => (
                      <IpOverview
                        ip={decodeIpv6(ip)}
                        data={ipOverviewData}
                        loading={loading}
                        type={networkModel.NetworkType.details}
                        flowTarget={flowTarget}
                      />
                    )}
                  </IpOverviewQuery>

                  <EuiHorizontalRule />

                  <DomainsQuery
                    endDate={to}
                    filterQuery={filterQuery}
                    flowTarget={flowTarget}
                    ip={decodeIpv6(ip)}
                    sourceId="default"
                    startDate={from}
                    type={networkModel.NetworkType.details}
                  >
                    {({ id, domains, totalCount, pageInfo, loading, loadMore, refetch }) => (
                      <DomainsTableManage
                        data={domains}
                        indexPattern={indexPattern}
                        id={id}
                        flowTarget={flowTarget}
                        hasNextPage={getOr(false, 'hasNextPage', pageInfo)!}
                        ip={ip}
                        loading={loading}
                        loadMore={loadMore}
                        nextCursor={getOr(null, 'endCursor.value', pageInfo)}
                        refetch={refetch}
                        setQuery={setQuery}
                        totalCount={totalCount}
                        type={networkModel.NetworkType.details}
                      />
                    )}
                  </DomainsQuery>

                  <EuiSpacer />

                  <UsersQuery
                    endDate={to}
                    filterQuery={filterQuery}
                    flowTarget={flowTarget}
                    ip={decodeIpv6(ip)}
                    sourceId="default"
                    startDate={from}
                    type={networkModel.NetworkType.details}
                  >
                    {({ id, users, totalCount, pageInfo, loading, loadMore, refetch }) => (
                      <UsersTableManage
                        data={users}
                        id={id}
                        flowTarget={flowTarget}
                        hasNextPage={getOr(false, 'hasNextPage', pageInfo)!}
                        loading={loading}
                        loadMore={loadMore}
                        nextCursor={getOr(null, 'endCursor.value', pageInfo)!}
                        refetch={refetch}
                        setQuery={setQuery}
                        totalCount={totalCount}
                        type={networkModel.NetworkType.details}
                      />
                    )}
                  </UsersQuery>

                  <EuiSpacer />

                  <TlsQuery
                    endDate={to}
                    filterQuery={filterQuery}
                    flowTarget={flowTarget}
                    ip={decodeIpv6(ip)}
                    sourceId="default"
                    startDate={from}
                    type={networkModel.NetworkType.details}
                  >
                    {({ id, tls, totalCount, pageInfo, loading, loadMore, refetch }) => (
                      <TlsTableManage
                        data={tls}
                        id={id}
                        hasNextPage={getOr(false, 'hasNextPage', pageInfo) || false}
                        loading={loading}
                        loadMore={loadMore}
                        nextCursor={getOr(null, 'endCursor.value', pageInfo)}
                        refetch={refetch}
                        setQuery={setQuery}
                        totalCount={totalCount}
                        type={networkModel.NetworkType.details}
                      />
                    )}
                  </TlsQuery>
                </>
              )}
            </GlobalTime>
          </StickyContainer>
        ) : (
          <EmptyPage
            title={i18n.NO_FILEBEAT_INDICES}
            message={i18n.LETS_ADD_SOME}
            actionLabel={i18n.SETUP_INSTRUCTIONS}
            actionUrl={`${basePath}/app/kibana#/home/tutorial_directory/security`}
          />
        )
      }
    </WithSource>
  )
);

const makeMapStateToProps = () => {
  const getNetworkFilterQuery = networkSelectors.networkFilterQueryAsJson();
  const getIpDetailsFlowTargetSelector = networkSelectors.ipDetailsFlowTargetSelector();
  return (state: State) => ({
    filterQuery: getNetworkFilterQuery(state, networkModel.NetworkType.details) || '',
    flowTarget: getIpDetailsFlowTargetSelector(state),
  });
};

export const IPDetails = connect(makeMapStateToProps)(IPDetailsComponent);

export const getBreadcrumbs = (ip: string): Breadcrumb[] => [
  {
    text: i18n.NETWORK,
    href: getNetworkUrl(),
  },
  {
    text: decodeIpv6(ip),
  },
];
