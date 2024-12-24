# noticePopup
通知ポップアップのjs, cssセットです。
サーバーからの判別レスポンスもしくは指定メソッドからの返り値どちらからでも対応可能。
色の指定は実装済み, 位置指定, サイズ指定は今後実装予定。

# 呼び出し方
```javascript
$.noticePopup({
  isServerSide: true, // ※trueの場合は必ずurlの指定必須
  url: 'ajaxの URL', // ※サーバーサイドから通知データを受け取る場合のみ指定。
  color: 'green', // カラーの指定（デフォルト：blue）種類：red, blue, green
  interval: 30000 // サーバー監視頻度
});
