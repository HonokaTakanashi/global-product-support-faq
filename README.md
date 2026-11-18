# global-product-support-faq

製造業A社が国内外のサポート拠点で利用している製品FAQサイトです。

- 多言語: 日本語 / English / 中文
- 拠点別表示: 日本・北米・欧州・中国・東南アジア
- 製品カテゴリを大分類→小分類の2階層で分類(Panasonic のFAQ分類を参考)。大分類ごとにグループ表示
- 種別(設置・操作・保守・エラー・保証)・拠点での絞り込み、キーワード検索
- 静的サイト(HTML / CSS / JavaScript のみ。ビルド不要)

## 構成

```
index.html        画面
css/style.css     スタイル
js/app.js         表示・絞り込みロジック
data/faq.json     FAQデータ(拠点・カテゴリ・FAQ本文)
```

## ローカル確認

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

http://127.0.0.1:8000/ を開きます。

## FAQの追加

`data/faq.json` の `items` に追加します。

| キー | 内容 |
|------|------|
| `id` | 一意のID(例: `faq-009`) |
| `productCategory` | `productCategories` の id(大分類。一覧のグループ見出しになる) |
| `productSubcategory` | 大分類の `children` の id(小分類。省略可) |
| `topic` | `topics` の id(問い合わせ種別) |
| `regions` | 表示対象拠点の id 配列。全拠点は `["all"]` |
| `products` | 対象製品の型式配列(なければ `[]`) |
| `updated` | 更新日(YYYY-MM-DD) |
| `i18n` | `ja` / `en` / `zh` ごとの `q`(質問)と `a`(回答) |
