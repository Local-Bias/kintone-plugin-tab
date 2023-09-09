import { selector } from 'recoil';
import { getAppId } from '@lb-ribbit/kintone-xapp';
import { flatLayout } from '@/common/kintone-api';
import { getFormFields, getFormLayout, kintoneAPI } from '@konomi-app/kintone-utilities';
import { GUEST_SPACE_ID } from '@/common/global';

const PREFIX = `kintone`;

export const appFieldsState = selector<kintoneAPI.FieldProperty[]>({
  key: 'AppFields',
  get: async () => {
    const app = getAppId();
    if (!app) {
      throw new Error('アプリのフィールド情報が取得できませんでした');
    }

    const { properties } = await getFormFields({
      app,
      preview: true,
      guestSpaceId: GUEST_SPACE_ID,
      debug: process.env.NODE_ENV === 'development',
    });

    const values = Object.values(properties);

    return values.sort((a, b) => a.label.localeCompare(b.label, 'ja'));
  },
});

export const appLayoutState = selector<kintoneAPI.Layout>({
  key: `${PREFIX}appLayoutState`,
  get: async () => {
    const app = getAppId();
    if (!app) {
      throw new Error('アプリのフィールド情報が取得できませんでした');
    }

    const { layout } = await getFormLayout({
      app,
      preview: true,
      guestSpaceId: GUEST_SPACE_ID,
      debug: process.env.NODE_ENV === 'development',
    });
    return layout;
  },
});

export const appLabelsState = selector<string[]>({
  key: `${PREFIX}appLabelsState`,
  get: ({ get }) => {
    const layout = get(appLayoutState);

    const fields = flatLayout(layout);

    const labels = fields.filter((field) => field.type === 'LABEL') as kintoneAPI.layout.Label[];

    const parser = new DOMParser();

    const texts = labels
      .map(({ label }) => {
        const doc = parser.parseFromString(label, 'text/html');
        return doc.body.textContent;
      })
      .filter((text) => !!text);

    return texts as string[];
  },
});

export const appGroupsState = selector<kintoneAPI.layout.Group[]>({
  key: `${PREFIX}appLabelState`,
  get: ({ get }) => {
    const layout = get(appLayoutState);

    const groups = Object.values(layout).reduce<kintoneAPI.layout.Group[]>(
      (acc, value) => (value.type === 'GROUP' ? [...acc, value] : acc),
      []
    );

    return groups;
  },
});

export const appSpacesState = selector<kintoneAPI.layout.Spacer[]>({
  key: `${PREFIX}appSpacesState`,
  get: ({ get }) => {
    const layout = get(appLayoutState);

    const fields = flatLayout(layout);

    const spaces = fields.filter((field) => field.type === 'SPACER') as kintoneAPI.layout.Spacer[];

    const filtered = spaces.filter((space) => space.elementId);

    return filtered;
  },
});
