/**
 * ============================================================================
 * 大喜利サロン仲間版 (O-GIRI SALON EDITION)
 * 本番用コード生成・難読化ビルドスクリプト
 * Copyright (c) 2026 token-sound. All Rights Reserved.
 *
 * 開発用ファイル（app_dev.html）からJSXを標準JSにトランスパイルし、
 * javascript-obfuscator による高強度難読化を施した本番用（index.html）を自動生成します。
 *
 * 実行コマンド:
 *   node build_protected.js
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const presetReact = require('@babel/preset-react');
const JavaScriptObfuscator = require('javascript-obfuscator');

const DEV_FILE = path.join(__dirname, 'app_dev.html');
const PROD_FILE = path.join(__dirname, 'index.html');

console.log('🚀 [Build] 大喜利サロン仲間版 本番用難読化ビルドを開始します...');

if (!fs.existsSync(DEV_FILE)) {
  console.error(`❌ エラー: 開発用ファイルが見つかりません: ${DEV_FILE}`);
  process.exit(1);
}

const devHtml = fs.readFileSync(DEV_FILE, 'utf-8');

// <script type="text/babel">...</script> を抽出
const scriptTagRegex = /<script\s+type=["']text\/babel["']>([\s\S]*?)<\/script>/i;
const match = devHtml.match(scriptTagRegex);

if (!match) {
  console.error('❌ エラー: app_dev.html 内に <script type="text/babel"> タグが見つかりませんでした。');
  process.exit(1);
}

const rawJsCode = match[1];
console.log(`📦 [1/3] JSXスクリプト抽出完了 (${(rawJsCode.length / 1024).toFixed(1)} KB)`);

// 1. Babel で JSX を標準 JavaScript (React.createElement) にトランスパイル
console.log('⚙️  [2/3] Babel による JSX トランスパイル中...');
let transResult;
try {
  transResult = babel.transformSync(rawJsCode, {
    presets: [
      [presetReact, { runtime: 'classic' }]
    ],
    compact: false,
    comments: true,
  });
} catch (err) {
  console.error('❌ Babel トランスパイルエラー:', err);
  process.exit(1);
}

const transpiledCode = transResult.code;
console.log(`✅ トランスパイル成功 (${(transpiledCode.length / 1024).toFixed(1)} KB)`);

// 2. javascript-obfuscator による難読化
console.log('🛡️  [3/3] javascript-obfuscator による難読化処理中（少々お待ちください）...');
const obfuscationResult = JavaScriptObfuscator.obfuscate(transpiledCode, {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.6,
  deadCodeInjection: false,
  debugProtection: false, // 正常動作のため
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  renameGlobals: false, // React、DOM、グローバル変数の参照を保護
  selfDefending: false,
  splitStrings: true,
  splitStringsChunkLength: 8,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayEncoding: ['base64'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayThreshold: 0.8,
  transformObjectKeys: false,
  unicodeEscapeSequence: false
});

const obfuscatedJs = obfuscationResult.getObfuscatedCode();
console.log(`✅ 難読化完了 (${(obfuscatedJs.length / 1024).toFixed(1)} KB)`);

// 3. 本番用 HTML の組み立て
// - @babel/standalone は本番では不要（ロード高速化のため削除）
// - <script type="text/babel"> を <script> に置換
let prodHtml = devHtml;

// babel.min.js の読み込みタグを削除
prodHtml = prodHtml.replace(/<script\s+src=["']https:\/\/unpkg\.com\/@babel\/standalone\/babel\.min\.js["']><\/script>\s*/i, '');

// 著作権ヘッダー付与
const copyrightBanner = `/*\n * 大喜利サロン仲間版 (O-GIRI SALON EDITION)\n * Copyright (c) 2026 token-sound. All Rights Reserved.\n * Unauthorized copying, distribution or reverse engineering is strictly prohibited.\n */\n`;

// <script type="text/babel"> ... </script> を安全に置換
const prodScriptTag = `<script>\n${copyrightBanner}${obfuscatedJs}\n</script>`;
prodHtml = prodHtml.replace(scriptTagRegex, () => prodScriptTag);

// 本番ファイルに出力
fs.writeFileSync(PROD_FILE, prodHtml, 'utf-8');

console.log(`\n🎉 [完了] 本番用ファイルが正常に出力されました！`);
console.log(`   📁 開発用原盤 : ${DEV_FILE} (${(fs.statSync(DEV_FILE).size / 1024).toFixed(1)} KB)`);
console.log(`   🛡️ 本番公開用 : ${PROD_FILE} (${(fs.statSync(PROD_FILE).size / 1024).toFixed(1)} KB)`);
console.log(`   💡 以降の修正は app_dev.html で行い、完了後に 'node build_protected.js' を実行してください。\n`);
