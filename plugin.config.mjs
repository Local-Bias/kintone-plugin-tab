//@ts-check
const hp = 'https://konomi.app/';
const commonCdn = 'https://cdn.jsdelivr.net/gh/local-bias/kintone-cdn@latest';
const REPO = 'https://cdn.jsdelivr.net/gh/local-bias/kintone-plugin-tab@latest';
const localhost = 'https://127.0.0.1:5500';

/** @type { import('./src/types/plugin-config').PluginConfig } */
export default {
  manifest: {
    base: {
      manifest_version: 1,
      version: '2.5.0',
      type: 'APP',
      name: {
        en: 'vertical tab plugin',
        ja: 'タブ表示プラグイン',
        zh: '垂直标签插件',
      },
      description: {
        en: 'add vertical tab',
        ja: 'スクロールに追従する垂直方向のタブを追加します',
        zh: '添加垂直标签',
      },
      icon: 'icon.png',
      homepage_url: { ja: hp, en: hp },
      desktop: { js: [`${commonCdn}/dist/desktop.js`], css: [] },
      mobile: { js: [`${commonCdn}/dist/desktop.js`], css: [] },
      config: {
        html: 'config.html',
        js: [`${commonCdn}/dist/config.js`],
        css: [],
        required_params: [],
      },
    },
    dev: {
      desktop: { js: [`${localhost}/dist/dev/desktop/index.js`] },
      mobile: { js: [`${localhost}/dist/dev/desktop/index.js`] },
      config: { js: [`${localhost}/dist/dev/config/index.js`] },
    },
    prod: {
      desktop: { js: [`${REPO}/cdn/desktop.js`] },
      mobile: { js: [`${REPO}/cdn/desktop.js`] },
      config: { js: [`${REPO}/cdn/config.js`] },
    },
  },
};