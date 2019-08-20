/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { getOr } from 'lodash/fp';
import * as React from 'react';
import { MockedProvider } from 'react-apollo/test-utils';
import { Provider as ReduxStoreProvider } from 'react-redux';

import { FlowDirection, FlowTarget } from '../../../../graphql/types';
import {
  apolloClientObservable,
  mockIndexPattern,
  mockGlobalState,
  TestProviders,
} from '../../../../mock';
import { createStore, networkModel, State } from '../../../../store';

import { NetworkTopSourceFlowTable } from '.';
import { mockData } from './mock';

describe('NetworkTopNFlow Table Component', () => {
  const loadPage = jest.fn();
  const state: State = mockGlobalState;

  let store = createStore(state, apolloClientObservable);

  beforeEach(() => {
    store = createStore(state, apolloClientObservable);
  });

  describe('rendering', () => {
    test('it renders the default NetworkTopNFlow table', () => {
      const wrapper = shallow(
        <ReduxStoreProvider store={store}>
          <NetworkTopSourceFlowTable
            data={mockData.NetworkTopNFlow.edges}
            fakeTotalCount={getOr(50, 'fakeTotalCount', mockData.NetworkTopNFlow.pageInfo)}
            id="topNFlow"
            indexPattern={mockIndexPattern}
            loading={false}
            loadPage={loadPage}
            showMorePagesIndicator={getOr(
              false,
              'showMorePagesIndicator',
              mockData.NetworkTopNFlow.pageInfo
            )}
            totalCount={mockData.NetworkTopNFlow.totalCount}
            type={networkModel.NetworkType.page}
          />
        </ReduxStoreProvider>
      );

      expect(toJson(wrapper)).toMatchSnapshot();
    });
  });

  describe('Direction', () => {
    test('when you click on the bi-directional button, it get selected', () => {
      const event = {
        target: { name: 'direction', value: FlowDirection.biDirectional },
      };

      const wrapper = mount(
        <MockedProvider>
          <TestProviders store={store}>
            <NetworkTopSourceFlowTable
              data={mockData.NetworkTopNFlow.edges}
              fakeTotalCount={getOr(50, 'fakeTotalCount', mockData.NetworkTopNFlow.pageInfo)}
              id="topNFlow"
              indexPattern={mockIndexPattern}
              loading={false}
              loadPage={loadPage}
              showMorePagesIndicator={getOr(
                false,
                'showMorePagesIndicator',
                mockData.NetworkTopNFlow.pageInfo
              )}
              totalCount={mockData.NetworkTopNFlow.totalCount}
              type={networkModel.NetworkType.page}
            />
          </TestProviders>
        </MockedProvider>
      );

      wrapper
        .find(`[data-test-subj="${FlowDirection.biDirectional}"]`)
        .first()
        .simulate('click', event);

      wrapper.update();

      expect(
        wrapper
          .find(`[data-test-subj="${FlowDirection.biDirectional}"]`)
          .first()
          .render()
          .hasClass('euiFilterButton-hasActiveFilters')
      ).toEqual(true);
    });
  });

  describe('Sorting by type', () => {
    test('when you click on the sorting dropdown, and picked destination', () => {
      const wrapper = mount(
        <MockedProvider>
          <TestProviders store={store}>
            <NetworkTopSourceFlowTable
              data={mockData.NetworkTopNFlow.edges}
              fakeTotalCount={getOr(50, 'fakeTotalCount', mockData.NetworkTopNFlow.pageInfo)}
              id="topNFlow"
              indexPattern={mockIndexPattern}
              loading={false}
              loadPage={loadPage}
              showMorePagesIndicator={getOr(
                false,
                'showMorePagesIndicator',
                mockData.NetworkTopNFlow.pageInfo
              )}
              totalCount={mockData.NetworkTopNFlow.totalCount}
              type={networkModel.NetworkType.page}
            />
          </TestProviders>
        </MockedProvider>
      );

      expect(
        wrapper
          .find(`[data-test-subj="flow-target-filter-button-${FlowTarget.destination}"]`)
          .first()
          .prop('hasActiveFilters')
      ).toBeFalsy();
      wrapper
        .find(`[data-test-subj="flow-target-filter-button-${FlowTarget.destination}"]`)
        .first()
        .simulate('click');
      expect(
        wrapper
          .find(`[data-test-subj="flow-target-filter-button-${FlowTarget.destination}"]`)
          .first()
          .prop('hasActiveFilters')
      ).toBeTruthy();
    });
  });

  describe('Sorting on Table', () => {
    test('when you click on the column header, you should show the sorting icon', () => {
      const wrapper = mount(
        <MockedProvider>
          <TestProviders store={store}>
            <NetworkTopSourceFlowTable
              data={mockData.NetworkTopNFlow.edges}
              fakeTotalCount={getOr(50, 'fakeTotalCount', mockData.NetworkTopNFlow.pageInfo)}
              id="topNFlow"
              indexPattern={mockIndexPattern}
              loading={false}
              loadPage={loadPage}
              showMorePagesIndicator={getOr(
                false,
                'showMorePagesIndicator',
                mockData.NetworkTopNFlow.pageInfo
              )}
              totalCount={mockData.NetworkTopNFlow.totalCount}
              type={networkModel.NetworkType.page}
            />
          </TestProviders>
        </MockedProvider>
      );
      expect(store.getState().network.page.queries!.topNFlow.topNFlowSort).toEqual({
        direction: 'desc',
        field: 'bytes_in',
      });

      wrapper
        .find('.euiTable thead tr th button')
        .at(1)
        .simulate('click');

      wrapper.update();

      expect(store.getState().network.page.queries!.topNFlow.topNFlowSort).toEqual({
        direction: 'asc',
        field: 'bytes_out',
      });
      expect(
        wrapper
          .find('.euiTable thead tr th button')
          .first()
          .text()
      ).toEqual('Bytes InClick to sort in ascending order');
      expect(
        wrapper
          .find('.euiTable thead tr th button')
          .at(1)
          .text()
      ).toEqual('Bytes OutClick to sort in descending order');
      expect(
        wrapper
          .find('.euiTable thead tr th button')
          .at(1)
          .find('svg')
      ).toBeTruthy();
    });
  });
});
