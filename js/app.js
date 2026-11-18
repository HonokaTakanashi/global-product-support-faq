(function () {
  "use strict";

  var UI = {
    ja: {
      brand: "A社 サポート",
      home: "サポートトップ",
      desc: "製品の使い方、お手入れ・点検方法、不具合時の対処方法などを検索できます。",
      tiles: "製品カテゴリから探す",
      results: "よくあるご質問",
      title: "よくあるご質問(FAQ)",
      lang: "言語",
      search: "キーワードで検索",
      region: "拠点",
      pcategory: "製品カテゴリ",
      topic: "種別",
      all: "すべて",
      count: function (n) { return n + " 件"; },
      empty: "該当するFAQはありません。",
      error: "FAQデータを読み込めませんでした。",
      products: "対象製品",
      updated: "更新日",
      footer: "A社 製品サポートFAQ(国内外サポート拠点共通)"
    },
    en: {
      brand: "Company A Support",
      home: "Support Top",
      desc: "Search usage, maintenance, inspection and troubleshooting information for our products.",
      tiles: "Browse by product category",
      results: "Frequently Asked Questions",
      title: "Frequently Asked Questions (FAQ)",
      lang: "Language",
      search: "Search by keyword",
      region: "Region",
      pcategory: "Product category",
      topic: "Topic",
      all: "All",
      count: function (n) { return n + (n === 1 ? " result" : " results"); },
      empty: "No matching FAQ found.",
      error: "Failed to load FAQ data.",
      products: "Products",
      updated: "Updated",
      footer: "Company A Product Support FAQ (shared across global support sites)"
    },
    zh: {
      brand: "A公司 支持",
      home: "支持首页",
      desc: "可检索产品的使用方法、维护检查方法及故障处理方法等。",
      tiles: "按产品类别查找",
      results: "常见问题",
      title: "常见问题(FAQ)",
      lang: "语言",
      search: "按关键词搜索",
      region: "地区",
      pcategory: "产品类别",
      topic: "问题类型",
      all: "全部",
      count: function (n) { return n + " 条"; },
      empty: "没有符合条件的常见问题。",
      error: "无法加载常见问题数据。",
      products: "适用产品",
      updated: "更新日期",
      footer: "A公司 产品支持常见问题(全球支持中心通用)"
    }
  };

  var SUPPORTED = Object.keys(UI);
  var state = { lang: "ja", region: "all", pcategory: "all", psub: "all", topic: "all", query: "" };
  var data = null;

  var $ = function (id) { return document.getElementById(id); };

  function detectLang() {
    var saved = null;
    try { saved = localStorage.getItem("faq.lang"); } catch (e) { /* ignore */ }
    if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
    var nav = (navigator.language || "ja").slice(0, 2);
    return SUPPORTED.indexOf(nav) !== -1 ? nav : "en";
  }

  function fillSelect(select, items, allLabel, current) {
    select.textContent = "";
    var opts = [{ id: "all", label: allLabel }].concat(items);
    opts.forEach(function (o) {
      var opt = document.createElement("option");
      opt.value = o.id;
      opt.textContent = o.label;
      select.appendChild(opt);
    });
    select.value = current;
  }

  function labelOf(list, id, lang) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i].label[lang];
    }
    return id;
  }

  function findCategory(id) {
    for (var i = 0; i < data.productCategories.length; i++) {
      if (data.productCategories[i].id === id) return data.productCategories[i];
    }
    return null;
  }

  function countOf(pred) { return data.items.filter(pred).length; }

  function selectCategory(id, sub) {
    state.pcategory = id;
    state.psub = sub;
    var t = UI[state.lang];
    renderBreadcrumb(t);
    renderTiles(t);
    renderList();
  }

  function makeTile(name, count, pressed, onClick, cls) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = cls;
    b.setAttribute("aria-pressed", String(pressed));
    var n = document.createElement("span");
    n.className = "tile-name";
    n.textContent = name;
    var c = document.createElement("span");
    c.className = "tile-count";
    c.textContent = UI[state.lang].count(count);
    b.appendChild(n);
    b.appendChild(c);
    b.addEventListener("click", onClick);
    return b;
  }

  function renderBreadcrumb(t) {
    var bc = $("breadcrumb");
    bc.textContent = "";
    var parts = [t.home, t.title];
    var cat = findCategory(state.pcategory);
    if (cat) {
      parts.push(cat.label[state.lang]);
      if (state.psub !== "all") parts.push(labelOf(cat.children, state.psub, state.lang));
    }
    parts.forEach(function (text, i) {
      if (i) {
        var sep = document.createElement("span");
        sep.className = "sep";
        sep.textContent = ">";
        bc.appendChild(sep);
      }
      bc.appendChild(document.createTextNode(text));
    });
  }

  function renderTiles(t) {
    var box = $("tiles");
    var sub = $("subtiles");
    box.textContent = "";
    sub.textContent = "";

    box.appendChild(makeTile(t.all, data.items.length, state.pcategory === "all", function () {
      selectCategory("all", "all");
    }, "tile"));
    data.productCategories.forEach(function (c) {
      var n = countOf(function (i) { return i.productCategory === c.id; });
      box.appendChild(makeTile(c.label[state.lang], n, state.pcategory === c.id, function () {
        selectCategory(c.id, "all");
      }, "tile"));
    });

    var cat = findCategory(state.pcategory);
    sub.hidden = !(cat && cat.children.length);
    if (sub.hidden) return;
    sub.appendChild(makeTile(t.all, countOf(function (i) { return i.productCategory === cat.id; }),
      state.psub === "all", function () { selectCategory(cat.id, "all"); }, "tile sub"));
    cat.children.forEach(function (ch) {
      var n = countOf(function (i) { return i.productCategory === cat.id && i.productSubcategory === ch.id; });
      sub.appendChild(makeTile(ch.label[state.lang], n, state.psub === ch.id, function () {
        selectCategory(cat.id, ch.id);
      }, "tile sub"));
    });
  }

  function renderStatic() {
    var t = UI[state.lang];
    document.documentElement.lang = state.lang;
    document.title = t.title;
    $("site-title").textContent = t.title;
    $("lang-label").textContent = t.lang;
    $("search").placeholder = t.search;
    $("search").setAttribute("aria-label", t.search);
    $("region-label").textContent = t.region;
    $("brand").textContent = t.brand;
    $("site-desc").textContent = t.desc;
    $("tiles-heading").textContent = t.tiles;
    $("result-heading").textContent = t.results;
    renderBreadcrumb(t);
    renderTiles(t);
    $("topic-label").textContent = t.topic;
    $("footer-text").textContent = t.footer;
    $("lang").value = state.lang;
    fillSelect($("region"), data.regions.map(function (r) {
      return { id: r.id, label: r.label[state.lang] };
    }), t.all, state.region);
    fillSelect($("topic"), data.topics.map(function (c) {
      return { id: c.id, label: c.label[state.lang] };
    }), t.all, state.topic);
  }

  function matches(item) {
    if (state.pcategory !== "all" && item.productCategory !== state.pcategory) return false;
    if (state.psub !== "all" && item.productSubcategory !== state.psub) return false;
    if (state.topic !== "all" && item.topic !== state.topic) return false;
    if (state.region !== "all" && item.regions.indexOf("all") === -1 &&
        item.regions.indexOf(state.region) === -1) return false;
    if (state.query) {
      var tr = item.i18n[state.lang] || item.i18n.en;
      var hay = (tr.q + " " + tr.a + " " + item.products.join(" ")).toLowerCase();
      if (hay.indexOf(state.query.toLowerCase()) === -1) return false;
    }
    return true;
  }

  function renderList() {
    var t = UI[state.lang];
    var list = $("faq-list");
    list.textContent = "";
    var items = data.items.filter(matches);

    function renderItem(item) {
      var tr = item.i18n[state.lang] || item.i18n.en;
      var details = document.createElement("details");
      details.className = "faq-item";
      details.id = item.id;

      var summary = document.createElement("summary");
      summary.textContent = tr.q;
      details.appendChild(summary);

      var body = document.createElement("div");
      body.className = "faq-body";
      var p = document.createElement("p");
      p.textContent = tr.a;
      body.appendChild(p);

      var meta = document.createElement("div");
      meta.className = "faq-meta";
      var cat = findCategory(item.productCategory);
      var subLabel = cat && item.productSubcategory ? labelOf(cat.children, item.productSubcategory, state.lang) : null;
      [labelOf(data.topics, item.topic, state.lang)]
        .concat(subLabel ? [subLabel] : [])
        .concat(item.products.length ? [t.products + ": " + item.products.join(", ")] : [])
        .concat([t.updated + ": " + item.updated])
        .forEach(function (text) {
          var span = document.createElement("span");
          span.className = "tag";
          span.textContent = text;
          meta.appendChild(span);
        });
      body.appendChild(meta);
      details.appendChild(body);
      list.appendChild(details);
    }

    data.productCategories.forEach(function (pc) {
      var group = items.filter(function (i) { return i.productCategory === pc.id; });
      if (!group.length) return;
      var h = document.createElement("h2");
      h.className = "group-title";
      h.textContent = pc.label[state.lang];
      var n = document.createElement("span");
      n.className = "n";
      n.textContent = t.count(group.length);
      h.appendChild(n);
      list.appendChild(h);
      group.forEach(renderItem);
    });

    $("count").textContent = t.count(items.length);
    $("empty").textContent = t.empty;
    $("empty").hidden = items.length !== 0;
  }

  function render() {
    renderStatic();
    renderList();
  }

  function bind() {
    $("lang").addEventListener("change", function (e) {
      state.lang = e.target.value;
      try { localStorage.setItem("faq.lang", state.lang); } catch (err) { /* ignore */ }
      render();
    });
    $("region").addEventListener("change", function (e) { state.region = e.target.value; renderList(); });
    $("topic").addEventListener("change", function (e) { state.topic = e.target.value; renderList(); });
    $("search").addEventListener("input", function (e) { state.query = e.target.value.trim(); renderList(); });
  }

  function init() {
    state.lang = detectLang();
    fetch("data/faq.json", { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (json) {
        data = json;
        bind();
        render();
      })
      .catch(function () {
        $("site-title").textContent = UI[state.lang].title;
        $("error").textContent = UI[state.lang].error;
        $("error").hidden = false;
      });
  }

  init();
})();
