/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useState, useEffect } from 'react';
import { useCreateTransforms } from '../containers/use_create_transforms';

interface TransformCapabilitiesProvider {
  capabilitiesFetched: boolean;
}

const emptyMlCapabilitiesProvider = {
  capabilitiesFetched: false,
};

export const TransformCapabilitiesContext = React.createContext<TransformCapabilitiesProvider>(
  emptyMlCapabilitiesProvider
);

TransformCapabilitiesContext.displayName = 'TransformCapabilitiesContext';

/**
 * TODO: This should fetch the permissions and if it has the permission capable of launching
 * the transforms and they are enabled then it should launch them.
 * See ml_capabilities_provider to finish this
 */
export const TransformCapabilitiesProvider = React.memo<{ children: JSX.Element }>(
  ({ children }) => {
    const [capabilities, setCapabilities] = useState<TransformCapabilitiesProvider>(
      emptyMlCapabilitiesProvider
    );
    const { createTransforms } = useCreateTransforms();

    useEffect(() => {
      // TODO: Fetch the permissions here with a hook
      // console.log('setting capabilities...');
      setCapabilities({ capabilitiesFetched: true });
    }, []);

    useEffect(() => {
      // TODO: Check for permissions and if they are good then call into createTransforms
      createTransforms();
    }, [createTransforms]);

    return (
      <TransformCapabilitiesContext.Provider value={capabilities}>
        {children}
      </TransformCapabilitiesContext.Provider>
    );
  }
);

TransformCapabilitiesProvider.displayName = 'TransformCapabilitiesProvider';
