const esbuild = require('esbuild');
const fs = require('fs');

async function superMinifyTS(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // 1. 【カスタム処理】AIへのヒントにならない特定の型やプロパティを削除（例）
  // 複雑な interface 削減は手動が安全ですが、特定のパターンを消すことは可能
  // code = code.replace(/private\s+_[a-zA-Z0-9_]+:.*?;/g, ''); // プライベート変数を消す等

  // 2. esbuild による基本 minify
  const result = await esbuild.transform(code, {
    loader: 'ts',
    minifyWhitespace: true, // 改行・空白・コメント（JSDoc含む）を完全削除
    minifyIdentifiers: false, // 変数名は維持
    minifySyntax: true,     // 構文の短縮
    keepNames: true,
  });

  let minified = result.code;

  // 3. 【追加処理】さらなるトークン節約
  // セミコロンの後のスペース削除や、連続する不要文字の微調整
  minified = minified.replace(/export\s+/g, 'export '); 

  console.log(minified);
}

superMinifyTS('your-file.ts');
