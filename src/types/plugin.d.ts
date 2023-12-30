declare namespace Plugin {
  /** 🔌 プラグインがアプリ単位で保存する設定情報 */
  type Config = ConfigV1;

  /** 🔌 プラグインの詳細設定 */
  type Condition = Config['conditions'][number];

  /** 🔌 過去全てのバージョンを含むプラグインの設定情報 */
  type AnyConfig = ConfigV1; // | ConfigV2 | ...;

  type DisplayMode = 'add' | 'sub';

  type ConfigV1 = {
    version: 1;
    conditions: {
      tabName: string;
      tabIcon: string;
      displayMode: DisplayMode;
      fields: string[];
      labelDisplayMode?: DisplayMode;
      labels?: string[];
      groupDisplayMode?: DisplayMode;
      groups?: string[];
      spaceDisplayMode?: DisplayMode;
      spaceIds?: string[];
      hidesHR?: boolean;
    }[];
  };
}
