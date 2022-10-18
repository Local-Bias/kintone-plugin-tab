import { KintoneRestAPIClient } from '@kintone/rest-api-client';
import { kx } from '@type/kintone.api';
import { getAppId } from '@lb-ribbit/kintone-xapp';

/** kintoneアプリに初期状態で存在するフィールドタイプ */
const DEFAULT_DEFINED_FIELDS: kx.FieldPropertyType[] = [
  'RECORD_NUMBER',
  'UPDATED_TIME',
  'CREATOR',
  'CREATED_TIME',
  'CATEGORY',
  'MODIFIER',
  'STATUS',
];

class FlexKintone extends KintoneRestAPIClient {
  constructor(...options: ConstructorParameters<typeof KintoneRestAPIClient>) {
    const url = kintone.api.url('/k/v1/app', true);
    const found = url.match(/k\/guest\/([0-9]+)\//);

    if (found && found.length > 1) {
      super({
        guestSpaceId: found[1],
        ...(options[0] || {}),
      });
      return;
    }

    super(...options);
  }
}

/** REST APIクライアント(シングルトン) */
export const kintoneClient = new FlexKintone();

export const getFieldProperties = async (
  targetApp?: string | number
): Promise<kx.FieldProperties> => {
  const app = targetApp || kintone.app.getId();

  if (!app) {
    throw new Error('アプリのフィールド情報が取得できませんでした');
  }

  const { properties } = await kintoneClient.app.getFormFields({ app });

  return properties;
};

export const getUserDefinedFields = async (): Promise<kx.FieldProperties> => {
  const properties = await getFieldProperties();
  return omitFieldProperties(properties, DEFAULT_DEFINED_FIELDS);
};

/** サブテーブルをばらしてフィールドを返却します */
export const getAllFields = async (): Promise<kx.FieldProperty[]> => {
  const properties = await getFieldProperties();

  const fields = Object.values(properties).reduce<kx.FieldProperty[]>((acc, property) => {
    if (property.type === 'SUBTABLE') {
      return [...acc, ...Object.values(property.fields)];
    }
    return [...acc, property];
  }, []);

  return fields;
};

export const getAppLayout = async (_app?: number): Promise<kx.Layout> => {
  const app = _app || getAppId();

  if (!app) {
    throw new Error('アプリのフィールド情報が取得できませんでした');
  }

  const { layout } = await kintoneClient.app.getFormLayout({ app });

  return layout;
};

export const flatLayout = (layout: kx.Layout): kx.layout.Field[] => {
  const results: kx.layout.Field[] = [];
  for (const chunk of layout) {
    if (chunk.type === 'ROW') {
      results.push(...flatLayoutRow(chunk));
      continue;
    } else if (chunk.type === 'GROUP') {
      results.push(...flatLayout(chunk.layout));
    } else if (chunk.type === 'SUBTABLE') {
      results.push(...chunk.fields);
    }
  }
  return results;
};

export const flatLayoutRow = (row: kx.layout.Row): kx.layout.Field[] => {
  return row.fields.reduce<kx.layout.Field[]>((acc, field) => [...acc, field], []);
};

/** 指定のフィールドコードのフィールドを操作します */
export const controlField = (
  record: kx.RecordData,
  fieldCode: string,
  callback: (field: kx.Field) => void
): void => {
  if (record[fieldCode]) {
    callback(record[fieldCode]);
    return;
  }

  for (const field of Object.values(record)) {
    if (field.type === 'SUBTABLE') {
      for (const { value } of field.value) {
        if (value[fieldCode]) {
          callback(value[fieldCode]);
        }
      }
    }
  }
};

/**
 * APIから取得したフィールド情報から、指定した関数の条件に当てはまるフィールドのみを返却します
 *
 * @param properties APIから取得したフィールド情報
 * @param callback 絞り込み条件
 * @returns 条件に当てはまるフィールド
 */
export const filterFieldProperties = (
  properties: kx.FieldProperties,
  callback: (field: kx.FieldProperty) => boolean
): kx.FieldProperties => {
  const filtered = Object.entries(properties).filter(([_, value]) => callback(value));

  const reduced = filtered.reduce<kx.FieldProperties>(
    (acc, [key, value]) => ({ ...acc, [key]: value }),
    {}
  );

  return reduced;
};

/**
 * APIから取得したフィールド情報から、指定したフィールドタイプを除いたフィールド一覧を返却します
 *
 * @param properties APIから取得したフィールド情報
 * @param omittingTypes 除外するフィールドタイプ
 * @returns 指定したフィールドタイプを除いた一覧
 */
export const omitFieldProperties = (
  properties: kx.FieldProperties,
  omittingTypes: kx.FieldPropertyType[]
): kx.FieldProperties => {
  return filterFieldProperties(properties, (property) => !omittingTypes.includes(property.type));
};

/** 対象レコードの各フィールドから、指定文字列に一致するフィールドが１つでもあればTrueを返します */
export const someRecord = (record: kx.RecordData, searchValue: string): boolean => {
  return Object.values(record).some((field) => someFieldValue(field, searchValue));
};

export const someFieldValue = (field: kx.RecordData[string], searchValue: string) => {
  switch (field.type) {
    case 'CREATOR':
    case 'MODIFIER':
      return ~field.value.name.indexOf(searchValue);

    case 'CHECK_BOX':
    case 'MULTI_SELECT':
    case 'CATEGORY':
      return field.value.some((value) => ~value.indexOf(searchValue));

    case 'USER_SELECT':
    case 'ORGANIZATION_SELECT':
    case 'GROUP_SELECT':
    case 'STATUS_ASSIGNEE':
      return field.value.some(({ name }) => ~name.indexOf(searchValue));

    case 'FILE':
      return field.value.some(({ name }) => ~name.indexOf(searchValue));

    case 'SUBTABLE':
      return field.value.some(({ value }) => someRecord(value, searchValue));

    default:
      return field.value && ~field.value.indexOf(searchValue);
  }
};
