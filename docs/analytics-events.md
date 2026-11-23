# GA4 イベント定義

測定ID `G-3HF3LB4BMR`。2026-11-23追加。Googleタグは既存の1つを使用する。

| イベント | 発火条件 | パラメータ |
|---|---|---|
| select_content | 共通共有スクリプトを持つページから記事リンクを選択。同じ記事内のアンカー移動は除外 | content_type=design_entry, item_id=公開記事slug |
| select_filter | トップのカテゴリー・地域・分野・時代の選択肢を変更。検索文字入力・初回描画は除外 | filter_name, filter_value=サイトの既定選択肢 |
| compare_content | 比較ページで選択を変更し異なる2項目を表示、またはクレーの2作品の比較ダイアログを実際に開く | content_type, content_id, comparison_content_id, item_count=2 |
| share | 公開ページURLのクリップボード書き込み成功 | method=copy_link, content_type=design_page |

比較ページの初期例表示、同一項目の比較、コピー失敗は成果に数えない。記事名・作者名などは公開カタログIDで表す。検索語、URLクエリ、コピーした文字列、利用者の自由入力は送らない。新しいイベントは送信先を本ストリームへ固定し、ga-disableを尊重する。仮想page_viewや外部リンクイベントは追加しない。Selected Worksの内容・操作・配置は変更しない。

本番ホストだけで送信する。分類と比較は利用者による選択変更を対象にし、同じ値・同じ組み合わせの再通知を除く。共通スクリプトを二度読み込んでもリスナーは重複登録しない。送信失敗がページ操作を妨げないようにする。

サイト側実装とGA4管理画面の登録・受信確認は別工程。通常のイベントは送信後に収集される。イベントスコープのカスタムディメンション候補は content_type、item_id、content_id、comparison_content_id、filter_name、filter_value。比較の組合せ文字列は送らない。
