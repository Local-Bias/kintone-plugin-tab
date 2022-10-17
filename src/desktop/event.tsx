import React from 'react';
import { createRoot } from 'react-dom/client';
import { css } from '@emotion/css';
import { restoreStorage } from '@common/plugin';

import App from './app';

const ROOT_ID = 'ribbit-tab-plugin-root';

const events: kintone.EventType[] = [
  'app.record.create.show',
  'app.record.edit.show',
  'app.record.detail.show',
];

const enables: launcher.Enables = (e) => !document.getElementById(ROOT_ID);

const action: launcher.Action = async (event, pluginId) => {
  const config = restoreStorage(pluginId);
  process.env.NODE_ENV === 'development' && console.log({ config });

  const target = document.querySelector('#record-gaia');

  if (!target) {
    console.log('タブをレンダリングする対象エレメントが取得できませんでした');
    return event;
  }

  target.classList.add(css`
    padding: 0 !important;
    display: flex;
    gap: 8px;
  `);

  const div = document.createElement('div');
  div.id = ROOT_ID;

  target.prepend(div);

  createRoot(div).render(<App config={config} />);

  return event;
};

export default { events, enables, action };
