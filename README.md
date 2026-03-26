# minifyForAI
AIの為のコードトークン軽量化

## Minifyによるトークン削減の目安
| 状態 | 内容 | トークン数 (目安) | 削減率 |
| :--- | :--- | :--- | :--- |
| **Before** | コメントあり、適切なインデント、長い変数名 | 1,000 | 0% |
| **After (軽量化)** | コメント削除、空白・改行の最小化 | 600 ~ 700 | **約30-40%減** |
| **After (強力)** | 変数名・関数名の短縮（難読化） | 400 ~ 500 | **約50-60%減** |

AIにロジックを理解させたい場合は、変数名の短縮（Mangle）は避けるのがベストです。function processUserData(d: Data) が function a(b: c) になると、AIの推論精度が著しく低下します。

## Before / After のイメージ
``` Before (175 characters)
/**
 * ユーザー情報を処理する関数
 */
export const processUser = (name: string, age: number): string => {
  const message = `Hello, ${name}! You are ${age} years old.`;
  return message;
};
```

``` After (88 characters)
export const processUser=(name:string,age:number):string=>{const message=`Hello, ${name}! You are ${age} years old.`;return message;};
```

---
# Get started
'''
npm install -D esbuild
npm pkg set scripts.minify="node scripts/minify-ts.js src/index.ts dist/ai-prompt.ts"
npm run minify
'''

---
# 複数ファイルをまとめるとトークンはどうなる？
| 項目 | 単純に全ファイルを結合 | esbuild等でバンドル (Bundle) |
| :--- | :--- | :--- |
| **トークン数** | **増える**（重複が多い） | **減る**（未使用コードを削れる） |
| **重複の扱い** | `import/export` や共通定義が何度も登場する | 共通化され、1箇所に集約される |
| **AIの理解度** | 物理的なファイル構造を把握しやすい | ロジックの繋がり（データフロー）を把握しやすい |
## 精度を出すには「すべて」渡すべきか？
AI（特にGPT-4やGemini 1.5 Proなど）はコンテキストが長いほど賢くなりますが、**「無関係な情報」が多すぎると、逆に重要なロジックを見失う（Lost in the Middle現象）**ことがあります。
### 精度を高めるためのデータ選択基準
#### 渡すべきもの:
- 修正したい関数が依存している 型定義 (types.ts)。
- 呼び出し元の ロジックの流れ。
- 共通で使っている 定数やUtils。
### 削るべきもの:
- 外部ライブラリの型: node_modules 内の情報はAIが学習済みであることが多いため不要。
- テストコード (.test.ts): ロジックの説明には不要な場合が多い。
- 画像・バイナリデータの埋め込み: Base64などはトークンの無駄。
## 運用のアドバイス：フォルダ構成を伝える
ファイルを1つにまとめると、AIは「どのコードがどのファイルにあったか」というディレクトリ構造を忘れてしまいます。
精度をさらに高めるには、ファイルの冒頭に以下のようなディレクトリツリーを添えてから、minifyしたコードを貼るのが最強のプロンプト構成です。
# Project Structure
src/
  ├── index.ts
  ├── api/
  │   └── user.ts
  └── types/
      └── index.ts
