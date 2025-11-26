# エラーハンドリング戦略

API連携では「うまくいかないとき」にどう振る舞うかが品質を左右します。ユーザー体験を損なわず、開発中も原因を素早く特定できる戦略をまとめます（安心感が違います）。

## この記事で学べること

- エラーの分類（ユーザー起因/ネットワーク/サーバー）
- 表示・ログ・再試行の基本設計
- フロントエンドの実装パターン（fetch/SWR）

## エラーの分類

- 入力エラー（400系）: フォームのバリデーション結果など
- 認証/認可エラー（401/403）: ログインや権限が必要
- リソース未検出（404）: URLやID間違い
- レート制限（429）: 呼びすぎ注意。待って再試行
- サーバーエラー（5xx）: サーバー側の問題。時間を置いて再試行
- ネットワークエラー: オフライン/タイムアウト/プロキシ問題など

## UIでの基本方針

- 明確なメッセージ: 「何が起きたか」「次に何をすべきか」
- 再試行ボタン: ユーザー主体で回復できる道を残す
- 重要データはスケルトン/プレースホルダ表示で認知負荷を軽減
- クリティカル時のみダイアログ。通常は画面内に控えめに表示

## fetch の標準実装

```ts
export async function requestJSON<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  try {
    const res = await fetch(input, init);
    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        message = body.message || message;
      } catch {}
      throw new Error(message);
    }
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return res.json();
    throw new Error("Unexpected content type");
  } catch (e) {
    if ((e as any)?.name === "AbortError") throw e; // キャンセルはそのまま
    // ネットワーク系
    if (e instanceof TypeError) {
      throw new Error(
        "ネットワークに接続できません（オフライン/プロキシ/SSL など）",
      );
    }
    throw e;
  }
}
```

## SWRでの戦略

```ts tsx
import useSWR, { SWRConfig } from "swr";

const fetchJSON = <T,>(url: string) =>
  fetch(url).then(async (r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json() as Promise<T>;
  });

function User() {
  const { data, error, isLoading, mutate } = useSWR("/api/me", fetchJSON);
  if (isLoading) return <p>読み込み中</p>;
  if (error) return <button onClick={() => mutate()}>再試行</button>;
  return <div>{data.name}</div>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        onError: (err) => {
          // グローバル通知やSentry送信など
          console.error("[SWR Error]", err);
        },
        shouldRetryOnError: true,
        errorRetryCount: 3,
      }}
    >
      {children}
    </SWRConfig>
  );
}
```

## ログと監視

- ユーザー向け表示と開発者向けログを分離（混ぜない）
- 予期せぬ例外はSentryなどに送信（個人情報に注意）
- 再現手順/レスポンス/トレースIDを記録して解析可能に

## やってみよう！

1. 404/500/ネットワーク遮断を擬似的に作り、UIメッセージと再試行動作を確認
2. SWRの`errorRetryCount`を増やしてバックオフ動作を観察

## ポイント（まとめ）

- エラーは種類ごとに対処を分ける（メッセージ/再試行/遅延）
- fetchは`res.ok`と`Content-Type`を確認して丁寧に処理
- SWRでは`onError`や`mutate`で回復体験を設計
- ログは「利用者の安心」と「開発者の調査」を両立

## 参考リンク

- MDN: fetch https://developer.mozilla.org/ja/docs/Web/API/Fetch_API
- SWR 公式 https://swr.vercel.app/ja
