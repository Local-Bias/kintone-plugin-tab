import React, { VFC } from 'react';
import { RecoilRoot } from 'recoil';

import { ErrorBoundary } from '@common/components/error-boundary';

import { pluginConfigState } from './states';
import Tab from './tab';

type Props = Readonly<{ config: kintone.plugin.Storage }>;

const Component: VFC<Props> = ({ config }) => (
  <RecoilRoot
    initializeState={({ set }) => {
      set(pluginConfigState, config);
    }}
  >
    <ErrorBoundary>
      <Tab />
    </ErrorBoundary>
  </RecoilRoot>
);

export default Component;
