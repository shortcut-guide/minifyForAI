# minifyForAI
AIの為のコードトークン軽量化

## Minifyによるトークン削減の目安
| 状態 | 内容 | トークン数 (目安) | 削減率 |
| :--- | :--- | :--- | :--- |
| **Before** | コメントあり、適切なインデント、長い変数名 | 1,000 | 0% |
| **After (軽量化)** | コメント削除、空白・改行の最小化 | 600 ~ 700 | **約30-40%減** |
| **After (強力)** | 変数名・関数名の短縮（難読化） | 400 ~ 500 | **約50-60%減** |

AIにロジックを理解させたい場合は、変数名の短縮（Mangle）は避けるのがベストです。function processUserData(d: Data) が function a(b: c) になると、AIの推論精度が著しく低下します。

## TypeScript用Minifierの実装コード
Node.js環境で動作する、esbuild を利用したスクリプトを紹介します。esbuild は高速で、TypeScriptをそのまま（型を消さずに）扱う設定が可能です。
```
npm install esbuild
```

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
