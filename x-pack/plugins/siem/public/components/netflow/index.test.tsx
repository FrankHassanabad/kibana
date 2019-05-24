/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import toJson from 'enzyme-to-json';
import { get } from 'lodash/fp';
import * as React from 'react';
import { mountWithIntl, shallowWithIntl } from 'test_utils/enzyme_helpers';

import { asArrayIfExists } from '../../lib/helpers';
import { getMockNetflowData } from '../../mock';
import { TestProviders } from '../../mock/test_providers';
import {
  TLS_CLIENT_CERTIFICATE_FINGERPRINT_SHA1_FIELD_NAME,
  TLS_SERVER_CERTIFICATE_FINGERPRINT_SHA1_FIELD_NAME,
} from '../certificate_fingerprint';
import { EVENT_DURATION_FIELD_NAME } from '../duration';
import { ID_FIELD_NAME } from '../event_details/event_id';
import { DESTINATION_IP_FIELD_NAME, SOURCE_IP_FIELD_NAME } from '../ip';
import { JA3_HASH_FIELD_NAME } from '../ja3_fingerprint';
import { DESTINATION_PORT_FIELD_NAME, SOURCE_PORT_FIELD_NAME } from '../port';
import {
  NETWORK_BYTES_FIELD_NAME,
  NETWORK_COMMUNITY_ID_FIELD_NAME,
  NETWORK_DIRECTION_FIELD_NAME,
  NETWORK_PACKETS_FIELD_NAME,
  NETWORK_PROTOCOL_FIELD_NAME,
  NETWORK_TRANSPORT_FIELD_NAME,
} from '../source_destination/field_names';
import {
  DESTINATION_GEO_CITY_NAME_FIELD_NAME,
  DESTINATION_GEO_CONTINENT_NAME_FIELD_NAME,
  DESTINATION_GEO_COUNTRY_ISO_CODE_FIELD_NAME,
  DESTINATION_GEO_COUNTRY_NAME_FIELD_NAME,
  DESTINATION_GEO_REGION_NAME_FIELD_NAME,
  SOURCE_GEO_CITY_NAME_FIELD_NAME,
  SOURCE_GEO_CONTINENT_NAME_FIELD_NAME,
  SOURCE_GEO_COUNTRY_ISO_CODE_FIELD_NAME,
  SOURCE_GEO_COUNTRY_NAME_FIELD_NAME,
  SOURCE_GEO_REGION_NAME_FIELD_NAME,
} from '../source_destination/geo_fields';
import {
  DESTINATION_BYTES_FIELD_NAME,
  DESTINATION_PACKETS_FIELD_NAME,
  SOURCE_BYTES_FIELD_NAME,
  SOURCE_PACKETS_FIELD_NAME,
} from '../source_destination/source_destination_arrows';
import * as i18n from '../timeline/body/renderers/translations';

import {
  EVENT_END_FIELD_NAME,
  EVENT_START_FIELD_NAME,
} from './netflow_columns/duration_event_start_end';
import { PROCESS_NAME_FIELD_NAME, USER_NAME_FIELD_NAME } from './netflow_columns/user_process';

import { Netflow } from '.';

const getNetflowInstance = () => (
  <Netflow
    contextId="test"
    destinationBytes={asArrayIfExists(get(DESTINATION_BYTES_FIELD_NAME, getMockNetflowData()))}
    destinationGeoContinentName={asArrayIfExists(
      get(DESTINATION_GEO_CONTINENT_NAME_FIELD_NAME, getMockNetflowData())
    )}
    destinationGeoCountryName={asArrayIfExists(
      get(DESTINATION_GEO_COUNTRY_NAME_FIELD_NAME, getMockNetflowData())
    )}
    destinationGeoCountryIsoCode={asArrayIfExists(
      get(DESTINATION_GEO_COUNTRY_ISO_CODE_FIELD_NAME, getMockNetflowData())
    )}
    destinationGeoRegionName={asArrayIfExists(
      get(DESTINATION_GEO_REGION_NAME_FIELD_NAME, getMockNetflowData())
    )}
    destinationGeoCityName={asArrayIfExists(
      get(DESTINATION_GEO_CITY_NAME_FIELD_NAME, getMockNetflowData())
    )}
    destinationIp={asArrayIfExists(get(DESTINATION_IP_FIELD_NAME, getMockNetflowData()))}
    destinationPackets={asArrayIfExists(get(DESTINATION_PACKETS_FIELD_NAME, getMockNetflowData()))}
    destinationPort={asArrayIfExists(get(DESTINATION_PORT_FIELD_NAME, getMockNetflowData()))}
    eventDuration={asArrayIfExists(get(EVENT_DURATION_FIELD_NAME, getMockNetflowData()))}
    eventId={get(ID_FIELD_NAME, getMockNetflowData())}
    eventEnd={asArrayIfExists(get(EVENT_END_FIELD_NAME, getMockNetflowData()))}
    eventStart={asArrayIfExists(get(EVENT_START_FIELD_NAME, getMockNetflowData()))}
    networkBytes={asArrayIfExists(get(NETWORK_BYTES_FIELD_NAME, getMockNetflowData()))}
    networkCommunityId={asArrayIfExists(get(NETWORK_COMMUNITY_ID_FIELD_NAME, getMockNetflowData()))}
    networkDirection={asArrayIfExists(get(NETWORK_DIRECTION_FIELD_NAME, getMockNetflowData()))}
    networkPackets={asArrayIfExists(get(NETWORK_PACKETS_FIELD_NAME, getMockNetflowData()))}
    networkProtocol={asArrayIfExists(get(NETWORK_PROTOCOL_FIELD_NAME, getMockNetflowData()))}
    processName={asArrayIfExists(get(PROCESS_NAME_FIELD_NAME, getMockNetflowData()))}
    sourceBytes={asArrayIfExists(get(SOURCE_BYTES_FIELD_NAME, getMockNetflowData()))}
    sourceGeoContinentName={asArrayIfExists(
      get(SOURCE_GEO_CONTINENT_NAME_FIELD_NAME, getMockNetflowData())
    )}
    sourceGeoCountryName={asArrayIfExists(
      get(SOURCE_GEO_COUNTRY_NAME_FIELD_NAME, getMockNetflowData())
    )}
    sourceGeoCountryIsoCode={asArrayIfExists(
      get(SOURCE_GEO_COUNTRY_ISO_CODE_FIELD_NAME, getMockNetflowData())
    )}
    sourceGeoRegionName={asArrayIfExists(
      get(SOURCE_GEO_REGION_NAME_FIELD_NAME, getMockNetflowData())
    )}
    sourceGeoCityName={asArrayIfExists(get(SOURCE_GEO_CITY_NAME_FIELD_NAME, getMockNetflowData()))}
    sourceIp={asArrayIfExists(get(SOURCE_IP_FIELD_NAME, getMockNetflowData()))}
    sourcePackets={asArrayIfExists(get(SOURCE_PACKETS_FIELD_NAME, getMockNetflowData()))}
    sourcePort={asArrayIfExists(get(SOURCE_PORT_FIELD_NAME, getMockNetflowData()))}
    tlsClientCertificateFingerprintSha1={asArrayIfExists(
      get(TLS_CLIENT_CERTIFICATE_FINGERPRINT_SHA1_FIELD_NAME, getMockNetflowData())
    )}
    tlsFingerprintsJa3Hash={asArrayIfExists(get(JA3_HASH_FIELD_NAME, getMockNetflowData()))}
    tlsServerCertificateFingerprintSha1={asArrayIfExists(
      get(TLS_SERVER_CERTIFICATE_FINGERPRINT_SHA1_FIELD_NAME, getMockNetflowData())
    )}
    transport={asArrayIfExists(get(NETWORK_TRANSPORT_FIELD_NAME, getMockNetflowData()))}
    userName={asArrayIfExists(get(USER_NAME_FIELD_NAME, getMockNetflowData()))}
  />
);

describe('Netflow', () => {
  test('renders correctly against snapshot', () => {
    const wrapper = shallowWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('it renders a destination label', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="destination-label"]')
        .first()
        .text()
    ).toEqual(i18n.DESTINATION);
  });

  test('it renders destination.bytes', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="destination-bytes"]')
        .first()
        .text()
    ).toEqual('40.000 B');
  });

  test('it renders destination.geo.continent_name', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="destination.geo.continent_name"]')
        .first()
        .text()
    ).toEqual('North America');
  });

  test('it renders destination.geo.country_name', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="destination.geo.country_name"]')
        .first()
        .text()
    ).toEqual('United States');
  });

  test('it renders destination.geo.country_iso_code', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="destination.geo.country_iso_code"]')
        .first()
        .text()
    ).toEqual('US');
  });

  test('it renders destination.geo.region_name', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="destination.geo.region_name"]')
        .first()
        .text()
    ).toEqual('New York');
  });

  test('it renders destination.geo.city_name', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="destination.geo.city_name"]')
        .first()
        .text()
    ).toEqual('New York');
  });

  test('it renders the destination ip and port, separated with a colon', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="destination-ip-and-port"]')
        .first()
        .text()
    ).toEqual('10.1.2.3:80');
  });

  test('it renders destination.packets', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="destination-packets"]')
        .first()
        .text()
    ).toEqual('1 pkts');
  });

  test('it hyperlinks links destination.port to an external service that describes the purpose of the port', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="destination-ip-and-port"]')
        .find('[data-test-subj="port-or-service-name-link"]')
        .first()
        .props().href
    ).toEqual(
      'https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml?search=80'
    );
  });

  test('it renders event.duration', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="event-duration"]')
        .first()
        .text()
    ).toEqual('1ms');
  });

  test('it renders event.end', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="event-end"]')
        .first()
        .text().length
    ).toBeGreaterThan(0); // the format of this date will depend on the user's locale and settings
  });

  test('it renders event.start', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="event-start"]')
        .first()
        .text().length
    ).toBeGreaterThan(0); // the format of this date will depend on the user's locale and settings
  });

  test('it renders network.bytes', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="network-bytes"]')
        .first()
        .text()
    ).toEqual('100.000 B');
  });

  test('it renders network.community_id', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="network-community-id"]')
        .first()
        .text()
    ).toEqual('we.live.in.a');
  });

  test('it renders network.direction', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="network-direction"]')
        .first()
        .text()
    ).toEqual('outgoing');
  });

  test('it renders network.packets', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="network-packets"]')
        .first()
        .text()
    ).toEqual('3 pkts');
  });

  test('it renders network.protocol', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="network-protocol"]')
        .first()
        .text()
    ).toEqual('http');
  });

  test('it renders process.name', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="process-name"]')
        .first()
        .text()
    ).toEqual('rat');
  });

  test('it renders a source label', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="source-label"]')
        .first()
        .text()
    ).toEqual(i18n.SOURCE);
  });

  test('it renders source.bytes', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="source-bytes"]')
        .first()
        .text()
    ).toEqual('60.000 B');
  });

  test('it renders source.geo.continent_name', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="source.geo.continent_name"]')
        .first()
        .text()
    ).toEqual('North America');
  });

  test('it renders source.geo.country_name', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="source.geo.country_name"]')
        .first()
        .text()
    ).toEqual('United States');
  });

  test('it renders source.geo.country_iso_code', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="source.geo.country_iso_code"]')
        .first()
        .text()
    ).toEqual('US');
  });

  test('it renders source.geo.region_name', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="source.geo.region_name"]')
        .first()
        .text()
    ).toEqual('Georgia');
  });

  test('it renders source.geo.city_name', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="source.geo.city_name"]')
        .first()
        .text()
    ).toEqual('Atlanta');
  });

  test('it renders the source ip and port, separated with a colon', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="source-ip-and-port"]')
        .first()
        .text()
    ).toEqual('192.168.1.2:9987');
  });

  test('it renders source.packets', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="source-packets"]')
        .first()
        .text()
    ).toEqual('2 pkts');
  });

  test('it hyperlinks tls.client_certificate.fingerprint.sha1 site to compare the fingerprint against a known set of signatures', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="client-certificate-fingerprint"]')
        .find('[data-test-subj="certificate-fingerprint-link"]')
        .first()
        .props().href
    ).toEqual(
      'https://sslbl.abuse.ch/ssl-certificates/sha1/tls.client_certificate.fingerprint.sha1-value'
    );
  });

  test('renders tls.client_certificate.fingerprint.sha1 text', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="client-certificate-fingerprint"]')
        .find('[data-test-subj="certificate-fingerprint-link"]')
        .first()
        .text()
    ).toEqual('tls.client_certificate.fingerprint.sha1-value');
  });

  test('it hyperlinks tls.fingerprints.ja3.hash site to compare the fingerprint against a known set of signatures', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="ja3-fingerprint-link"]')
        .first()
        .props().href
    ).toEqual('https://sslbl.abuse.ch/ja3-fingerprints/tls.fingerprints.ja3.hash-value');
  });

  test('renders tls.fingerprints.ja3.hash text', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="ja3-fingerprint-link"]')
        .first()
        .text()
    ).toEqual('tls.fingerprints.ja3.hash-value');
  });

  test('it hyperlinks tls.server_certificate.fingerprint.sha1 site to compare the fingerprint against a known set of signatures', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="server-certificate-fingerprint"]')
        .find('[data-test-subj="certificate-fingerprint-link"]')
        .first()
        .props().href
    ).toEqual(
      'https://sslbl.abuse.ch/ssl-certificates/sha1/tls.server_certificate.fingerprint.sha1-value'
    );
  });

  test('renders tls.server_certificate.fingerprint.sha1 text', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="server-certificate-fingerprint"]')
        .find('[data-test-subj="certificate-fingerprint-link"]')
        .first()
        .text()
    ).toEqual('tls.server_certificate.fingerprint.sha1-value');
  });

  test('it renders network.transport', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="network-transport"]')
        .first()
        .text()
    ).toEqual('tcp');
  });

  test('it renders user.name', () => {
    const wrapper = mountWithIntl(<TestProviders>{getNetflowInstance()}</TestProviders>);

    expect(
      wrapper
        .find('[data-test-subj="user-name"]')
        .first()
        .text()
    ).toEqual('first.last');
  });
});
