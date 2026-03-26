const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// --- 設定 ---
const CONFIG = {
  targetDir: './src',             // スキャン対象のディレクトリ
  outputFile: './dist/ai_prompt.txt', // AIに渡す用のファイル
  extensions: ['.ts', '.tsx'],     // 対象とする拡張子
  exclude: ['node_modules', '.test.', '.spec.', 'dist', '.d.ts'] // 除外キーワード
};

// 1. ディレクトリ構造をツリー形式で生成する関数
function generateTree(dir, prefix = '') {
  let tree = '';
  const files = fs.readdirSync(dir);

  files.forEach((file, index) => {
    const filePath = path.join(dir, file);
    const isDirectory = fs.statSync(filePath).isDirectory();
    const isLast = index === files.length - 1;

    // 除外設定のチェック
    if (CONFIG.exclude.some(ex => filePath.includes(ex))) return;

    tree += `${prefix}${isLast ? '└── ' : '├── '}${file}\n`;

    if (isDirectory) {
      tree += generateTree(filePath, `${prefix}${isLast ? '    ' : '│   '}`);
    }
  });
  return tree;
}

// 2. 指定したディレクトリ内の全ファイルを再帰的に取得する関数
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!CONFIG.exclude.some(ex => filePath.includes(ex))) {
        getAllFiles(filePath, fileList);
      }
    } else {
      if (CONFIG.extensions.includes(path.extname(file)) && 
          !CONFIG.exclude.some(ex => file.includes(ex))) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

async function run() {
  console.log('🚀 Generating AI context bundle...');

  // A. プロジェクト構造の取得
  const treeStructure = `[Project Structure]\n${generateTree(CONFIG.targetDir)}\n`;

  // B. 全ファイルのソースをMinifyして結合
  const files = getAllFiles(CONFIG.targetDir);
  let combinedContent = `\n[Source Code (Minified)]\n`;

  for (const file of files) {
    const rawCode = fs.readFileSync(file, 'utf8');
    
    // esbuildでファイルごとに軽量化
    const minified = await esbuild.transform(rawCode, {
      loader: path.extname(file).slice(1), // ts or tsx
      minifyWhitespace: true,
      minifySyntax: true,
      minifyIdentifiers: false, // 変数名は維持して精度を保つ
      keepNames: true,
    });

    combinedContent += `\n// --- File: ${file} ---\n${minified.code}\n`;
  }

  // C. 書き出し
  const finalOutput = treeStructure + combinedContent;
  
  const distDir = path.dirname(CONFIG.outputFile);
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
  
  fs.writeFileSync(CONFIG.outputFile, finalOutput);

  // 統計表示
  console.log(`✅ Done! Bundle created at: ${CONFIG.outputFile}`);
  console.log(`📊 Total characters: ${finalOutput.length}`);
  console.log(`💡 Copy the content of ${CONFIG.outputFile} and paste it to your AI.`);
}

run().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
