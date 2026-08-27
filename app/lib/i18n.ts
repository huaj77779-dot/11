"use client";

import { useEffect, useState } from "react";
import { europeanTranslation } from "./eu-translations";

export type Locale =
  | "zh"
  | "en"
  | "de"
  | "ja"
  | "fr"
  | "it"
  | "es"
  | "pt"
  | "nl"
  | "pl"
  | "sv"
  | "da"
  | "no"
  | "cs";

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "zh", label: "简体中文" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "ja", label: "日本語" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "nl", label: "Nederlands" },
  { code: "pl", label: "Polski" },
  { code: "sv", label: "Svenska" },
  { code: "da", label: "Dansk" },
  { code: "no", label: "Norsk" },
  { code: "cs", label: "Čeština" },
];

const store: {
  locale: Locale;
  listeners: Set<() => void>;
} = {
  // Keep the server and the first client render identical. The stored locale is
  // restored after mount to avoid hydration mismatches.
  locale: DEFAULT_LOCALE,
  listeners: new Set(),
};

export function getLocale(): Locale {
  return store.locale;
}

export function setLocale(locale: Locale): void {
  store.locale = locale;
  if (typeof window !== "undefined") {
    window.localStorage.setItem("locale", locale);
    document.cookie = `atelier_locale=${locale}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = locale === "zh" ? "zh-CN" : locale;
  }
  store.listeners.forEach((fn) => fn());
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("atelier-locale-change", { detail: locale }));
}

export function subscribeLocale(fn: () => void): () => void {
  store.listeners.add(fn);
  const sync = () => {
    if (typeof window !== "undefined") {
      const cookieLocale = document.cookie.match(/(?:^|; )atelier_locale=([^;]+)/)?.[1] as Locale | undefined;
      const saved = (window.localStorage.getItem("locale") as Locale | null) ?? cookieLocale ?? null;
      if (saved && LOCALES.some((item) => item.code === saved)) store.locale = saved;
    }
    fn();
  };
  if (typeof window !== "undefined") window.addEventListener("atelier-locale-change", sync);
  return () => {
    store.listeners.delete(fn);
    if (typeof window !== "undefined") window.removeEventListener("atelier-locale-change", sync);
  };
}

type Dict = Record<string, Partial<Record<Locale, string>>>;

export const T: Dict = {
  // ===== 通用 =====
  "app.title": { zh: "定制订单预览", en: "Order Preview", de: "Bestellvorschau", ja: "注文プレビュー" },
  "common.save": { zh: "保存", en: "Save", de: "Speichern", ja: "保存" },
  "common.cancel": { zh: "取消", en: "Cancel", de: "Abbrechen", ja: "キャンセル" },
  "common.search": { zh: "搜索", en: "Search", de: "Suchen", ja: "検索" },
  "common.refresh": { zh: "刷新", en: "Refresh", de: "Aktualisieren", ja: "更新" },
  "common.delete": { zh: "删除", en: "Delete", de: "Löschen", ja: "削除" },
  "common.confirm": { zh: "确认", en: "Confirm", de: "Bestätigen", ja: "確認" },
  "common.close": { zh: "关闭", en: "Close", de: "Schließen", ja: "閉じる" },
  "common.back": { zh: "返回", en: "Back", de: "Zurück", ja: "戻る" },
  "common.searchFailed": { zh: "检索失败", en: "Search failed", de: "Suche fehlgeschlagen", ja: "検索できませんでした" },

  // ===== 首页 =====
  "home.eyebrow": { zh: "新建定制订单", en: "New Made-to-Measure Order", de: "Neue Maßanfertigung", ja: "新規オーダーメイド注文" },
  "home.newOrder": { zh: "新建订单", en: "New Order", de: "Neue Bestellung", ja: "新規注文" },
  "home.storeLocation": { zh: "伦敦 · 门店 01", en: "London · Store 01", de: "London · Filiale 01", ja: "ロンドン · 店舗 01" },
  "home.watermark": { zh: "水印", en: "Watermark", de: "Wasserzeichen", ja: "透かし" },
  "home.switchAccount": { zh: "切换账号", en: "Switch account", de: "Konto wechseln", ja: "アカウント切替" },
  "home.backHome": { zh: "返回主页", en: "Home", de: "Startseite", ja: "ホーム" },
  "home.customerInfo": { zh: "客户信息", en: "Customer details", de: "Kundendaten", ja: "顧客情報" },
  "home.addNewCustomer": { zh: "添加新客户", en: "Add new customer", de: "Neuen Kunden anlegen", ja: "新規顧客を追加" },
  "home.addNewCustomerSub": { zh: "录入新的客户资料与尺寸", en: "Enter customer details and measurements", de: "Kundendaten und Maße erfassen", ja: "顧客情報と採寸を入力" },
  "home.searchExistingCustomer": { zh: "老客户检索", en: "Find existing customer", de: "Bestandskunden suchen", ja: "既存顧客を検索" },
  "home.searchExistingCustomerSub": { zh: "按姓名查找已有客户档案", en: "Search saved profiles by name", de: "Gespeicherte Profile nach Namen suchen", ja: "氏名で保存済み顧客を検索" },
  "home.doubleClickZoom": { zh: "双击放大图片", en: "Double-click to enlarge", de: "Zum Vergrößern doppelklicken", ja: "ダブルクリックで拡大" },
  "home.selectBrand": { zh: "选择品牌", en: "Select brand", de: "Marke wählen", ja: "ブランドを選択" },
  "home.colorFilter": { zh: "颜色", en: "Color", de: "Farbe", ja: "色" },
  "home.patternFilter": { zh: "花型", en: "Pattern", de: "Muster", ja: "柄" },
  "home.weightFilter": { zh: "克重", en: "Weight", de: "Gewicht", ja: "目付" },
  "home.compositionFilter": { zh: "成分", en: "Composition", de: "Zusammensetzung", ja: "素材" },
  "home.chooseBrand": { zh: "请先选择品牌", en: "Select a brand first", de: "Bitte zuerst eine Marke wählen", ja: "最初にブランドを選択" },
  "home.chooseBrandSub": { zh: "点击上方品牌开始挑选面料。", en: "Choose a brand above to browse its fabrics.", de: "Wählen Sie oben eine Marke, um Stoffe anzusehen.", ja: "上のブランドを選択して生地をご覧ください。" },
  "home.chooseBook": { zh: "选择面料本", en: "Choose a fabric bunch", de: "Stoffbund wählen", ja: "生地ブックを選択" },
  "home.fabricBookCover": { zh: "面料本封面", en: "Fabric bunch cover", de: "Stoffbund-Umschlag", ja: "生地ブック表紙" },
  "home.fabricCount": { zh: "个面料", en: "fabrics", de: "Stoffe", ja: "点の生地" },
  "home.backToBook": { zh: "面料本", en: "Fabric bunches", de: "Stoffbünde", ja: "生地ブック" },
  "home.bookDetail": { zh: "面料本详情", en: "Fabric bunch details", de: "Stoffbund-Details", ja: "生地ブック詳細" },
  "home.bookPositioning": { zh: "品牌与系列定位", en: "Brand and collection positioning", de: "Marken- und Kollektionsprofil", ja: "ブランドとコレクションの位置づけ" },
  "home.bookBrandIntro": { zh: "STYLBIELLA 是意大利面料品牌，坚持以意大利制造工艺呈现兼具审美、触感与实穿性的定制面料。", en: "STYLBIELLA is an Italian fabric brand creating made-to-measure cloth that combines visual refinement, a distinctive handle and practical wearability.", de: "STYLBIELLA ist eine italienische Stoffmarke für Maßstoffe, die Ästhetik, angenehmen Griff und Alltagstauglichkeit verbinden.", ja: "STYLBIELLAは、美しさ、風合い、実用性を兼ね備えたオーダーメイド向け服地を展開するイタリアのブランドです。" },
  "home.bookProducts": { zh: "适用品类", en: "Suitable products", de: "Geeignete Produkte", ja: "推奨アイテム" },
  "home.bookSeason": { zh: "适用季节", en: "Season", de: "Saison", ja: "シーズン" },
  "home.bookWeight": { zh: "面料克重", en: "Fabric weight", de: "Stoffgewicht", ja: "生地重量" },
  "home.bookView": { zh: "查看方式", en: "How to view", de: "Ansicht", ja: "表示方法" },
  "home.bookViewHint": { zh: "点击任意页面放大", en: "Click any page to enlarge", de: "Zum Vergrößern auf eine Seite klicken", ja: "ページをクリックして拡大" },
  "home.bookPage": { zh: "第 {n} 页", en: "Page {n}", de: "Seite {n}", ja: "{n}ページ" },
  "home.viewFullBook": { zh: "查看完整面料本", en: "View full fabric bunch", de: "Vollständigen Stoffbund ansehen", ja: "生地ブック全体を見る" },
  "home.perMeter": { zh: "米", en: "m", de: "m", ja: "m" },
  "cust.measureProfile": { zh: "客户尺寸档案 · 四类产品＋体态登记", en: "Customer measurements · Four garments + posture", de: "Kundenmaße · Vier Produkte + Körperhaltung", ja: "顧客採寸 · 4製品＋姿勢" },
  "cust.savedAt": { zh: "保存时间", en: "Saved", de: "Gespeichert", ja: "保存日時" },
  "cust.notSaved": { zh: "尚未保存量体数据", en: "No measurements saved", de: "Noch keine Maße gespeichert", ja: "採寸データ未保存" },
  "cust.metric": { zh: "公制", en: "Metric", de: "Metrisch", ja: "メートル法" },
  "cust.imperial": { zh: "英制", en: "Imperial", de: "Imperial", ja: "ヤード・ポンド法" },
  "cust.posture": { zh: "体态登记", en: "Posture", de: "Körperhaltung", ja: "姿勢" },
  "cust.choose": { zh: "请选择", en: "Select", de: "Auswählen", ja: "選択" },
  "cust.measureHint": { zh: "净体尺寸、成衣尺寸至少填写一项", en: "Enter at least one body or finished measurement", de: "Mindestens ein Körper- oder Fertigmaß eingeben", ja: "実寸または仕上がり寸法を1項目以上入力" },
  "cust.body": { zh: "净体", en: "Body", de: "Körpermaß", ja: "実寸" },
  "cust.finished": { zh: "成衣", en: "Finished", de: "Fertigmaß", ja: "仕上がり" },
  "cust.saving": { zh: "保存中…", en: "Saving…", de: "Speichern…", ja: "保存中…" },
  "cust.saveMeasurements": { zh: "保存量体数据", en: "Save measurements", de: "Maße speichern", ja: "採寸を保存" },
  "cust.entryHelp": { zh: "添加新客户，或检索已有客户档案后开始录入。", en: "Add a new customer or find an existing profile to begin.", de: "Legen Sie einen neuen Kunden an oder suchen Sie ein vorhandenes Profil.", ja: "新規顧客を追加するか、既存プロフィールを検索してください。" },
  "cust.nameRequired": { zh: "请先填写客户姓名", en: "Enter the customer name first", de: "Bitte zuerst den Kundennamen eingeben", ja: "先に顧客名を入力してください" },
  "cust.saveFailed": { zh: "保存失败", en: "Save failed", de: "Speichern fehlgeschlagen", ja: "保存できませんでした" },
  "cust.unit": { zh: "尺寸单位", en: "Measurement unit", de: "Maßeinheit", ja: "採寸単位" },
  "cust.level": { zh: "档位", en: "setting", de: "Stufe", ja: "段階" },
  "cust.searchName": { zh: "输入客户姓名检索", en: "Search by customer name", de: "Nach Kundenname suchen", ja: "顧客名で検索" },
  "cust.noChannel": { zh: "无渠道", en: "No channel", de: "Kein Kanal", ja: "チャネルなし" },
  "cust.saveProfile": { zh: "保存到客户档案", en: "Save to customer profile", de: "Im Kundenprofil speichern", ja: "顧客プロフィールに保存" },
  "cust.ease": { zh: "放量差", en: "Ease", de: "Mehrweite", ja: "ゆとり量" },
  "home.invalidMeters": { zh: "请输入有效的购买米数", en: "Enter a valid fabric length", de: "Bitte eine gültige Stoffmenge eingeben", ja: "有効な購入メートル数を入力してください" },
  "home.submitFailed": { zh: "提交失败", en: "Submission failed", de: "Übermittlung fehlgeschlagen", ja: "送信できませんでした" },
  "cust.editMeasurements": { zh: "修改量体数据", en: "Edit measurements", de: "Maße bearbeiten", ja: "採寸を編集" },
  "home.customers": { zh: "客户档案", en: "Customers", de: "Kunden", ja: "顧客アーカイブ" },
  "home.orders": { zh: "历史订单", en: "Orders", de: "Bestellungen", ja: "注文履歴" },
  "home.fabricLib": { zh: "面料库", en: "Fabric Library", de: "Stoffbibliothek", ja: "生地ライブラリ" },
  "home.admin": { zh: "后台管理", en: "Admin", de: "Verwaltung", ja: "管理" },
  "home.logout": { zh: "退出登录", en: "Logout", de: "Abmelden", ja: "ログアウト" },
  "home.loginRegister": { zh: "登录 / 注册", en: "Login / Sign up", de: "Anmelden / Registrieren", ja: "ログイン / 登録" },
  "home.loginReqTitle": { zh: "需要注册账号", en: "Account required", de: "Konto erforderlich", ja: "アカウントが必要です" },
  "home.loginReqText": { zh: "下单前请先注册门店账号。联系我们的 WhatsApp 注册，或登录已有账号后继续下单。", en: "Please register a store account before ordering. Contact us on WhatsApp to register, or log in to continue.", de: "Bitte registrieren Sie ein Konto. Kontaktieren Sie uns per WhatsApp oder melden Sie sich an.", ja: "注文前に店舗アカウントの登録が必要です。WhatsAppで登録するか、ログインして続行してください。" },
  "home.waRegister": { zh: "WhatsApp 联系注册", en: "Register via WhatsApp", de: "Per WhatsApp registrieren", ja: "WhatsAppで登録" },
  "home.goLogin": { zh: "去登录", en: "Go to Login", de: "Zum Login", ja: "ログインへ" },
  "home.loginReqNote": { zh: "已有账号？点击「去登录」使用门店账号下单", en: "Have an account? Click login to order with your store account.", de: "Konto vorhanden? Zum Login, um zu bestellen.", ja: "アカウントをお持ちの方はログインして注文してください。" },
  "home.companyIntro": { zh: "公司简介", en: "About Us", de: "Über uns", ja: "会社紹介" },
  "home.factoryQuality": { zh: "工厂与品质", en: "Factory & Quality", de: "Fabrik & Qualität", ja: "工場と品質" },
  "home.companyNews": { zh: "公司动态", en: "News", de: "Neuigkeiten", ja: "会社ニュース" },
  "home.contactUs": { zh: "联系合作", en: "Contact", de: "Kontakt", ja: "お問い合わせ" },
  "home.onlineOrder": { zh: "在线定制 ↗", en: "Customize Online ↗", de: "Online anpassen ↗", ja: "オンライン注文 ↗" },
  "home.confirmPlan": { zh: "确认定制方案", en: "Confirm Plan", de: "Plan bestätigen", ja: "プラン確定" },
  "home.title": { zh: "客户尺寸与款式", en: "Measurements & Styles", de: "Maße & Stile", ja: "採寸とスタイル" },
  "home.saveDraft": { zh: "保存草稿", en: "Save Draft", de: "Entwurf speichern", ja: "下書き保存" },
  "home.submitOrder": { zh: "下一步：确认订单", en: "Next: Confirm Order", de: "Weiter: Bestellung", ja: "次へ:注文確認" },
  "home.submitting": { zh: "提交中…", en: "Submitting…", de: "Wird gesendet…", ja: "送信中…" },
  "home.stepMeasure": { zh: "01 尺寸", en: "01 Measurements", de: "01 Maße", ja: "01 採寸" },
  "home.stepStyle": { zh: "02 款式", en: "02 Styles", de: "02 Stile", ja: "02 スタイル" },
  "home.customer": { zh: "客户", en: "Customer", de: "Kunde", ja: "お客様" },
  "home.customerName": { zh: "姓名", en: "Full name", de: "Name", ja: "氏名" },
  "home.height": { zh: "身高", en: "Height", de: "Größe", ja: "身長" },
  "home.weight": { zh: "体重", en: "Weight", de: "Gewicht", ja: "体重" },
  "home.channel": { zh: "渠道简写", en: "Channel", de: "Kanal", ja: "チャネル" },
  "home.avatar": { zh: "上传头像", en: "Upload photo", de: "Foto hochladen", ja: "写真アップロード" },
  "home.photoFallback": { zh: "头像", en: "Photo", de: "Foto", ja: "写真" },
  "home.country": { zh: "国家 / 地区", en: "Country / Region", de: "Land / Region", ja: "国 / 地域" },
  "home.countryPlaceholder": { zh: "请选择国家", en: "Select country", de: "Land wählen", ja: "国を選択" },
  "home.countrySearch": { zh: "搜索国家名称或 ISO 代码", en: "Search country name or ISO code", de: "Land oder ISO-Code suchen", ja: "国名またはISOコードを検索" },
  "home.selectCountryFirst": { zh: "请先选择国家", en: "Select a country first", de: "Bitte zuerst ein Land wählen", ja: "最初に国を選択" },
  "home.region": { zh: "州 / 省", en: "State / Province", de: "Bundesland", ja: "州 / 省" },
  "home.city": { zh: "城市", en: "City", de: "Stadt", ja: "都市" },
  "home.street": { zh: "详细地址", en: "Street address", de: "Straße", ja: "住所" },
  "home.postal": { zh: "邮编", en: "Postal code", de: "PLZ", ja: "郵便番号" },
  "home.fabricFirstTitle": { zh: "选择面料", en: "Choose Fabric", de: "Stoff wählen", ja: "生地を選択" },
  "home.fabricFirstSub": { zh: "选定面料后，再决定制作成衣或单独购买面料自行加工。", en: "Pick the fabric, then decide: make the garment or buy fabric only.", de: "Stoff wählen, dann entscheiden: Anfertigung oder nur Stoff.", ja: "生地を選び、次に成衣を仕立てるか生地のみ購入かを選択" },
  "home.selectedFabric": { zh: "已选面料", en: "Selected fabric", de: "Gewählter Stoff", ja: "選択済み生地" },
  "home.currentFabric": { zh: "当前面料", en: "Current fabric", de: "Aktueller Stoff", ja: "現在の生地" },
  "home.reselectFabric": { zh: "返回上一步", en: "Back", de: "Zurück", ja: "前の画面に戻る" },
  "home.fabricOnly": { zh: "仅购买面料", en: "Fabric only", de: "Nur Stoff", ja: "生地のみ" },
  "home.fabricOnlySub": { zh: "客户自行加工", en: "Self manufacturing", de: "Selbstverarbeitung", ja: "顧客による加工" },
  "home.fabricPrice": { zh: "面料价", en: "Fabric price", de: "Stoffpreis", ja: "生地価格" },
  "home.sameAsJacket": { zh: "与上衣同价", en: "Same as jacket", de: "Wie Jacke", ja: "ジャケットと同額" },
  "home.fabricMeters": { zh: "购买米数", en: "Meters", de: "Meter", ja: "購入メートル" },
  "home.joinPi": { zh: "加入 PI", en: "Add to PI", de: "Zur PI hinzufügen", ja: "PIに追加" },
  "home.backToMeasure": { zh: "返回尺寸", en: "Back to Measurements", de: "Zurück zu Maßen", ja: "採寸へ戻る" },
  "home.netSize": { zh: "净体尺寸", en: "Net size", de: "Körpermaß", ja: "実寸" },
  "home.finishedSize": { zh: "成衣尺寸", en: "Finished size", de: "Fertigungsmaß", ja: "仕上がり寸法" },
  "home.ease": { zh: "放量差", en: "Ease", de: "Zugabe", ja: "ゆとり" },
  "home.stylesSummary": { zh: "专属选项", en: "Options", de: "Optionen", ja: "オプション" },
  "home.singleChoice": { zh: "单选 · 必选", en: "Single · Required", de: "Einfach · Pflicht", ja: "単一選択 · 必須" },
  "home.selected": { zh: "已选择", en: "Selected", de: "Gewählt", ja: "選択済み" },
  "home.tailoringFee": { zh: "加工费", en: "Tailoring fee", de: "Verarbeitung", ja: "加工費" },
  "home.saveStyle": { zh: "保存并选择款式", en: "Save & Choose Style", de: "Speichern & Stil wählen", ja: "保存してスタイルへ" },
  "home.stylesIndependent": { zh: "产品选项已独立", en: "Independent options", de: "Unabhängige Optionen", ja: "独立したオプション" },
  "home.noFabric": { zh: "待选择面料", en: "Fabric not selected", de: "Kein Stoff", ja: "生地未選択" },
  "home.pleaseFabric": { zh: "请先选择面料", en: "Please choose fabric first", de: "Bitte zuerst Stoff wählen", ja: "先に生地を選択してください" },
  "home.pleaseName": { zh: "请先填写客户姓名", en: "Please enter customer name", de: "Bitte Kundennamen eingeben", ja: "お客様名を入力してください" },
  "home.saveChoice": { zh: "保存选择", en: "Save Selection", de: "Auswahl speichern", ja: "選択を保存" },
  "home.whiteLabelSub": { zh: "门店白标定制页面 · 不显示工厂信息", en: "Store white-label page · factory info hidden", de: "White-Label-Seite · ohne Fabrikdaten", ja: "店舗ホワイトラベルページ · 工場情報非表示" },
  "home.avatarChange": { zh: "更换头像", en: "Change photo", de: "Foto ändern", ja: "写真変更" },
  "home.avatarUpload": { zh: "上传头像（选填）", en: "Upload photo (optional)", de: "Foto hochladen (optional)", ja: "写真アップロード(任意)" },
  "home.customerNo": { zh: "引用量体档案", en: "Reference profile", de: "Referenzprofil", ja: "採寸プロフィール参照" },
  "home.customerNoSub": { zh: "客户编号将在最终确认下单时生成", en: "Customer number is generated on final order", de: "Kundennummer wird bei Bestellung erzeugt", ja: "注文確定時に顧客番号が発行されます" },
  "home.shipAddress": { zh: "客户收货地址", en: "Shipping Address", de: "Lieferadresse", ja: "配送先住所" },
  "home.shipForFee": { zh: "用于计算国际快递费", en: "Used to calculate shipping", de: "Für Versandkosten", ja: "送料計算に使用" },
  "home.estWeight": { zh: "预计计费重量", en: "Est. chargeable weight", de: "Geschätztes Gewicht", ja: "想定課金重量" },
  "home.shipEst": { zh: "演示运费", en: "shipping estimate", de: "Versandschätzung", ja: "送料見積" },
  "home.shipNote": { zh: "按成衣重量＋0.3 kg 包装重量计算；正式系统将连接可维护的快递价格表。", en: "Calculated from garment weight + 0.3 kg packaging. Production system connects to a maintainable rate table.", de: "Kleidungsgewicht + 0,3 kg Verpackung. Produktiv mit Pflege-Tariftabelle.", ja: "成衣重量+0.3kg梱包で計算。本番では維持可能な運賃表に接続予定。" },
  "home.checkFabric": { zh: "请核对图片与面料编号", en: "Verify image & fabric code", de: "Bild und Stoffcode prüfen", ja: "画像と生地コードを確認" },
  "home.clickZoom": { zh: "点击放大", en: "Click to zoom", de: "Vergrößern", ja: "拡大" },
  "home.measureTab": { zh: "尺寸", en: "Measurements", de: "Maße", ja: "採寸" },
  "home.styleTab": { zh: "款式", en: "Styles", de: "Stile", ja: "スタイル" },
  "home.measureSub": { zh: "净体尺寸和成衣尺寸独立保存，单位为厘米。", en: "Net and finished measurements are stored independently in cm.", de: "Körper- und Fertigungsmaße getrennt in cm.", ja: "実寸と仕上がり寸法をcmで個別保存。" },
  "home.styleSub": { zh: "所有配置组独立选择，产品之间互不覆盖。", en: "Each option group is an independent single choice; products never overwrite each other.", de: "Alle Optionen einzeln wählbar, Produkte überschreiben sich nicht.", ja: "各オプションは独立選択、製品間で上書きされません。" },
  "home.measureItems": { zh: "尺寸项目", en: "Item", de: "Position", ja: "項目" },
  "home.measureSnapshot": { zh: "尺寸快照将随订单保存", en: "Measurements are saved with the order", de: "Maße werden mit der Bestellung gespeichert", ja: "採寸は注文に保存されます" },
  "home.measureSnapshotSub": { zh: "客户档案更新后，本订单的净体与成衣尺寸不会被覆盖。", en: "Updating the profile later will not overwrite this order's measurements.", de: "Spätere Profiländerungen überschreiben diese Maße nicht.", ja: "後でプロフィールを更新しても本注文の採寸は上書きされません。" },
  "home.optionsFor": { zh: "专属选项", en: "Options", de: "Optionen", ja: "専用オプション" },
  "home.groupsCount": { zh: "个配置组 · 各组独立选择", en: "option groups · single choice each", de: "Optionsgruppen · je eine Wahl", ja: "オプショングループ · 各単一選択" },
  "home.noImage": { zh: "无图", en: "No image", de: "Kein Bild", ja: "画像なし" },
  "home.joinPiTitle": { zh: "加入 PI 订单明细", en: "Add to PI Order", de: "Zur PI hinzufügen", ja: "PI注文に追加" },
  "home.joinPiSub": { zh: "将当前", en: "Add this ", de: "Diesen ", ja: "現在の" },
  "home.joinPiSub2": { zh: "的配置加入 PI，可继续添加其他产品，最后统一确认下单。", en: " item to PI. Keep adding more items, then confirm the order.", de: " Artikel zur PI hinzufügen. Weitere hinzufügen und bestellen.", ja: "をPIに追加。他の製品も追加して最後に注文確定。" },
  "home.addedPi": { zh: "✓ 已加入 PI", en: "✓ Added to PI", de: "✓ Zur PI hinzugefügt", ja: "✓ PIに追加済み" },
  "home.stylesIndependentSub": { zh: "只显示自己的配置组；切换产品不会串用或覆盖其他产品选择。", en: " shows only its own option groups; switching products never overlaps or overwrites selections.", de: " zeigt nur eigene Optionen; andere Produkte bleiben unberührt.", ja: " は自身のオプションのみ表示。他の製品の選択には影響しません。" },
  "home.fabricOnlyTitle": { zh: "单独购买面料", en: "Fabric Only", de: "Nur Stoff", ja: "生地のみ購入" },
  "home.suitingFabric": { zh: "西服面料", en: "Suiting", de: "Anzugstoffe", ja: "スーツ生地" },
  "home.shirtFabric": { zh: "衬衫面料", en: "Shirting", de: "Hemdenstoffe", ja: "シャツ生地" },
  "home.fabricSearch": { zh: "搜索面料编号、品牌、颜色或成分", en: "Search code, brand, color or composition", de: "Code, Marke, Farbe oder Material suchen", ja: "コード・ブランド・色・素材を検索" },
  "home.color": { zh: "颜色", en: "Color", de: "Farbe", ja: "色" },
  "home.pattern": { zh: "花型", en: "Pattern", de: "Muster", ja: "柄" },
  "home.season": { zh: "季节", en: "Season", de: "Saison", ja: "シーズン" },
  "home.nextMake": { zh: "下一步：选择这块面料制作什么", en: "Next: choose what to make with this fabric", de: "Weiter: was soll genäht werden", ja: "次へ:この生地で何を作るか選択" },
  "home.embroideryText": { zh: "输入刺绣文字", en: "Enter monogram text", de: "Monogrammtext eingeben", ja: "刺繍文字を入力" },
  "home.embroideryPlaceholder": { zh: "请输入刺绣文字", en: "Enter monogram text", de: "Monogrammtext eingeben", ja: "刺繍文字を入力" },
  "home.uploadEmbroideryImage": { zh: "点击上传图片", en: "Upload image", de: "Bild hochladen", ja: "画像をアップロード" },
  "home.choose": { zh: "选择", en: "Choose", de: "Wählen", ja: "選択" },
  "home.submitted": { zh: "✓ 已提交 {n} 个订单，正在跳转历史订单…", en: "✓ {n} order(s) submitted. Redirecting to order history…", de: "✓ {n} Bestellung(en) gesendet. Weiter zur Historie…", ja: "✓ {n} 件の注文を送信。注文履歴へ移動中…" },

  // ===== PI =====
  "pi.eyebrow": { zh: "形式发票", en: "PROFORMA INVOICE", de: "PROFORMA-RECHNUNG", ja: "プロフォーマ・インボイス" },
  "pi.title": { zh: "PI 订单明细", en: "PI Order Details", de: "PI-Bestelldetails", ja: "PI注文明細" },
  "pi.added": { zh: "已加入", en: "Added", de: "Hinzugefügt", ja: "追加済み" },
  "pi.pending": { zh: "等待加入产品", en: "No items yet", de: "Noch keine Artikel", ja: "アイテム未追加" },
  "pi.customer": { zh: "客户", en: "Customer", de: "Kunde", ja: "お客様" },
  "pi.address": { zh: "收货地址", en: "Shipping address", de: "Lieferadresse", ja: "配送先住所" },
  "pi.product": { zh: "产品", en: "Product", de: "Produkt", ja: "製品" },
  "pi.fabric": { zh: "面料", en: "Fabric", de: "Stoff", ja: "生地" },
  "pi.styles": { zh: "款式与工艺", en: "Style & Craft", de: "Stil & Handwerk", ja: "スタイルと仕立て" },
  "pi.price": { zh: "价格", en: "Price", de: "Preis", ja: "価格" },
  "pi.aiPreview": { zh: "AI 效果图", en: "AI Preview", de: "AI-Vorschau", ja: "AIプレビュー" },
  "pi.fabricPrice": { zh: "面料", en: "Fabric", de: "Stoff", ja: "生地" },
  "pi.make": { zh: "定制", en: "Making", de: "Maßarbeit", ja: "仕立て" },
  "pi.extra": { zh: "附加", en: "Extra", de: "Extras", ja: "追加" },
  "pi.shipping": { zh: "国际快递费", en: "Shipping", de: "Versand", ja: "送料" },
  "pi.total": { zh: "PI 合计", en: "PI Total", de: "PI-Gesamt", ja: "PI合計" },
  "pi.generateOne": { zh: "生成单件", en: "Generate Items", de: "Einzelteile generieren", ja: "個別生成" },
  "pi.generating": { zh: "正在生成…", en: "Generating…", de: "Wird generiert…", ja: "生成中…" },
  "pi.generateSuite": { zh: "生成一套效果图", en: "Generate Full Set", de: "Komplettset generieren", ja: "一式生成" },
  "pi.suiteRef": { zh: "套图参考（行号）", en: "Set reference (row)", de: "Set-Referenz (Zeile)", ja: "一式参照(行番号)" },
  "pi.suiteDefault": { zh: "如 1,2,3 · 默认全部", en: "e.g. 1,2,3 · all by default", de: "z.B. 1,2,3 · sonst alle", ja: "例 1,2,3 · 空欄は全て" },
  "pi.zoom": { zh: "点击放大", en: "Click to zoom", de: "Zum Vergrößern", ja: "クリックで拡大" },
  "pi.generatingNow": { zh: "生成中...", en: "Generating...", de: "Generiere...", ja: "生成中..." },
  "pi.note": { zh: "每件产品将作为独立订单行保存；确认下单后可在历史订单中逐件查看与收款。", en: "Each item is saved as an independent order row. After confirming, view and collect payment per item in order history.", de: "Jeder Artikel wird als eigene Bestellzeile gespeichert. Nach Bestätigung einsehbar in der Bestellhistorie.", ja: "各アイテムは独立した注文行として保存されます。確認後、注文履歴で個別に確認・回収できます。" },
  "pi.empty": { zh: "还没有产品加入 PI。", en: "No items added to PI yet.", de: "Noch keine Artikel zur PI hinzugefügt.", ja: "PIにまだアイテムがありません。" },
  "pi.meters": { zh: "米", en: "m", de: "m", ja: "m" },
  "pi.remove": { zh: "从 PI 移除", en: "Remove from PI", de: "Von PI entfernen", ja: "PIから削除" },
  "pi.suite": { zh: "一套效果图", en: "Full Set", de: "Komplettset", ja: "一式イメージ" },
  "pi.garmentOnly": { zh: "AI 生成只支持成衣定制", en: "AI generation supports garments only", de: "KI-Generierung nur für Kleidung", ja: "AI生成は成衣のみ対応" },
  "pi.currentPrice": { zh: "当前产品价格", en: "Current Item Price", de: "Aktueller Preis", ja: "現在の製品価格" },
  "pi.livePrice": { zh: "实时价格", en: "Live price", de: "Live-Preis", ja: "リアルタイム価格" },
  "pi.baseCost": { zh: "基础制作价", en: "Base making", de: "Grundfertigung", ja: "基本仕立て" },
  "pi.extraTotal": { zh: "款式加价合计", en: "Style extras total", de: "Stil-Aufschläge", ja: "スタイル追加合計" },
  "pi.priceNote": { zh: "报价已包含演示快递费。正式系统可按快递商、目的国家、重量段、燃油附加费和币种维护价格表。", en: "Quote includes demo shipping. Production system supports a maintainable rate table.", de: "Angebot inkl. Demo-Versand. Produktiv mit pflegbarer Tariftabelle.", ja: "見積にはデモ送料を含みます。本番では維持可能な運賃表に対応予定。" },
  "pi.duplicateType": { zh: "每个部位只能选择一个才能生成", en: "Select only one per garment type", de: "Nur ein Artikel pro Typ", ja: "各部位は1つだけ選択してください" },
  "pi.invalidRows": { zh: "请输入有效的行号，如 1,2,3", en: "Enter valid row numbers, e.g. 1,2,3", de: "Gültige Zeilennummern eingeben, z.B. 1,2,3", ja: "有効な行番号を入力(例 1,2,3)" },
  "pi.noGarment": { zh: "请选择至少一件成衣", en: "Select at least one garment", de: "Mindestens ein Kleidungsstück wählen", ja: "成衣を1つ以上選択" },
  "pi.reselectFabric": { zh: "重新选择面料", en: "Change fabric", de: "Stoff ändern", ja: "生地を変更" },
  "pi.reselectStyle": { zh: "重新选择款式", en: "Change style", de: "Stil ändern", ja: "スタイルを変更" },

  // ===== 客户档案 =====
  "cust.eyebrow": { zh: "客户档案", en: "CUSTOMER ARCHIVE", de: "KUNDENARCHIV", ja: "顧客アーカイブ" },
  "cust.title": { zh: "客户档案", en: "Customer Archive", de: "Kundenarchiv", ja: "顧客アーカイブ" },
  "cust.subtitle": { zh: "客户在下单时自动建档：姓名 + 渠道相同则合并档案，累计订单数与消费额。", en: "Profiles are auto-created on order. Same name + channel merge into one profile with cumulative orders & spend.", de: "Profile werden automatisch angelegt. Gleicher Name + Kanal wird zusammengeführt.", ja: "注文時に自動でプロフィール作成。同じ名前+チャネルは統合されます。" },
  "cust.all": { zh: "全部客户", en: "All Customers", de: "Alle Kunden", ja: "全顧客" },
  "cust.count": { zh: "客户总数", en: "Customers", de: "Kunden", ja: "顧客数" },
  "cust.orders": { zh: "累计订单", en: "Orders", de: "Bestellungen", ja: "累計注文" },
  "cust.spent": { zh: "累计消费", en: "Total Spend", de: "Umsatz", ja: "累計消費" },
  "cust.placeholder": { zh: "搜索客户姓名、渠道或城市", en: "Search name, channel or city", de: "Name, Kanal oder Stadt suchen", ja: "名前・チャネル・都市を検索" },
  "cust.profile": { zh: "客户档案信息", en: "Customer Profile", de: "Kundenprofil", ja: "顧客プロフィール" },
  "cust.edit": { zh: "编辑档案", en: "Edit Profile", de: "Profil bearbeiten", ja: "プロフィール編集" },
  "cust.saveProfile": { zh: "保存档案", en: "Save Profile", de: "Profil speichern", ja: "プロフィール保存" },
  "cust.history": { zh: "历史订单", en: "Order History", de: "Bestellhistorie", ja: "注文履歴" },
  "cust.saved": { zh: "✓ 已保存", en: "✓ Saved", de: "✓ Gespeichert", ja: "✓ 保存済み" },
  "cust.delCustomer": { zh: "删除客户", en: "Delete Customer", de: "Kunde löschen", ja: "顧客削除" },
  "cust.delConfirm": { zh: "删除后不可恢复。", en: "This cannot be undone.", de: "Dies kann nicht rückgängig gemacht werden.", ja: "元に戻せません。" },
  "cust.created": { zh: "建档时间", en: "Created", de: "Erstellt", ja: "登録日" },
  "cust.noOrders": { zh: "该客户暂无订单。", en: "No orders for this customer.", de: "Keine Bestellungen.", ja: "注文はありません。" },
  "cust.region": { zh: "地区", en: "Region", de: "Region", ja: "地域" },
  "cust.hw": { zh: "身高 / 体重", en: "Height / Weight", de: "Größe / Gewicht", ja: "身長 / 体重" },
  "cust.lastOrder": { zh: "最近下单", en: "Last Order", de: "Letzte Bestellung", ja: "最近の注文" },
  "cust.empty": { zh: "暂无客户档案\n去 新建订单 完成首单后，客户会自动出现在这里。", en: "No customers yet.\nCreate your first order and the customer will appear here.", de: "Noch keine Kunden.\nErste Bestellung anlegen, dann erscheint der Kunde hier.", ja: "顧客がいません。\n最初の注文を作成するとここに表示されます。" },
  "cust.notes": { zh: "备注", en: "Notes", de: "Notizen", ja: "メモ" },

  // ===== 历史订单 =====
  "order.eyebrow": { zh: "历史订单", en: "ORDER HISTORY", de: "BESTELLHISTORIE", ja: "注文履歴" },
  "order.title": { zh: "历史订单", en: "Order History", de: "Bestellhistorie", ja: "注文履歴" },
  "order.subtitle": { zh: "下单成功后订单自动归档于此；点击订单行查看款式、尺寸、地址与价格明细。", en: "Orders are archived here automatically. Click a row to view style, measurements, address and price details.", de: "Bestellungen werden automatisch archiviert. Klick für Details.", ja: "注文は自動でここに保存されます。クリックで詳細表示。" },
  "order.all": { zh: "全部订单", en: "All Orders", de: "Alle Bestellungen", ja: "全注文" },
  "order.count": { zh: "订单总数", en: "Orders", de: "Bestellungen", ja: "注文数" },
  "order.amount": { zh: "订单总额", en: "Total Amount", de: "Gesamtbetrag", ja: "注文総額" },
  "order.pending": { zh: "待确认", en: "Pending", de: "Offen", ja: "未確認" },
  "order.unpaid": { zh: "待收款", en: "Unpaid", de: "Offen", ja: "未収金" },
  "order.placeholder": { zh: "搜索订单号、客户姓名或产品", en: "Search order no., customer or product", de: "Bestellnr., Kunde oder Produkt suchen", ja: "注文番号・顧客名・製品を検索" },
  "order.orderNo": { zh: "订单号", en: "Order No.", de: "Bestellnr.", ja: "注文番号" },
  "order.payment": { zh: "付款", en: "Payment", de: "Zahlung", ja: "支払い" },
  "order.action": { zh: "操作", en: "Actions", de: "Aktionen", ja: "操作" },
  "order.time": { zh: "下单时间", en: "Date", de: "Datum", ja: "注文日" },
  "order.collect": { zh: "收款", en: "Collect", de: "Kassieren", ja: "回収" },
  "order.deleteConfirm": { zh: "删除后不可恢复。", en: "This cannot be undone.", de: "Nicht rückgängig machbar.", ja: "元に戻せません。" },
  "order.paid": { zh: "已付款", en: "Paid", de: "Bezahlt", ja: "支払済み" },
  "order.unpaid2": { zh: "未付款", en: "Unpaid", de: "Unbezahlt", ja: "未払い" },
  "order.detail": { zh: "明细", en: "Details", de: "Details", ja: "詳細" },
  "order.measurements": { zh: "尺寸明细", en: "Measurements", de: "Maße", ja: "採寸詳細" },
  "order.shipAddr": { zh: "收货地址", en: "Shipping address", de: "Lieferadresse", ja: "配送先住所" },
  "order.madeTotal": { zh: "订单合计", en: "Order Total", de: "Gesamt", ja: "注文合計" },
  "order.status": { zh: "状态", en: "Status", de: "Status", ja: "ステータス" },
  "order.noMatch": { zh: "没有匹配的订单", en: "No matching orders", de: "Keine passenden Bestellungen", ja: "一致する注文がありません" },
  "order.empty": { zh: "暂无历史订单\n去 新建订单 完成首单后，订单会自动出现在这里。", en: "No orders yet.\nCreate your first order and it will appear here.", de: "Noch keine Bestellungen.\nErste Bestellung anlegen, dann erscheint sie hier.", ja: "注文がありません。\n最初の注文を作成するとここに表示されます。" },
  "order.styleOptions": { zh: "款式选项", en: "Style options", de: "Stiloptionen", ja: "スタイルオプション" },
  "order.itemAmount": { zh: "产品金额", en: "Item amount", de: "Artikelbetrag", ja: "製品金額" },
  "pay.title": { zh: "收款二维码", en: "Payment QR Code", de: "Zahlungs-QR-Code", ja: "支払いQRコード" },
  "pay.amount": { zh: "金额", en: "Amount", de: "Betrag", ja: "金額" },
  "pay.received": { zh: "已收到付款", en: "Payment received", de: "Zahlung erhalten", ja: "支払い受領" },
  "pay.receivedSub": { zh: "订单已自动确认收款，正在刷新订单列表…", en: "Payment confirmed automatically. Refreshing order list…", de: "Zahlung bestätigt. Liste wird aktualisiert…", ja: "支払いを自動確認しました。注文リストを更新中…" },
  "pay.loading": { zh: "二维码加载中…", en: "Loading QR code…", de: "QR-Code wird geladen…", ja: "QRコード読み込み中…" },
  "pay.hint": { zh: "请客人使用扫码支付。到账后由系统自动确认（每 5 秒自动查询），无需人工标记。", en: "Ask the customer to scan to pay. Payment is confirmed automatically (checked every 5s).", de: "Kunde zahlt per Scan. Zahlung wird automatisch bestätigt (alle 5 s).", ja: "お客様にスキャン支払いを依頼。入金は自動確認されます(5秒ごと)。" },
  "pay.error": { zh: "状态查询异常", en: "Status query failed", de: "Statusabfrage fehlgeschlagen", ja: "状態の取得に失敗" },

  // ===== B端主页落地页 =====
  "landing.navHome": { zh: "首页", en: "Home", de: "Startseite", ja: "ホーム" },
  "landing.navCompany": { zh: "公司简介", en: "About Us", de: "Über uns", ja: "会社紹介" },
  "landing.navQuality": { zh: "工厂品质", en: "Factory", de: "Fabrik & Qualität", ja: "工場と品質" },
  "landing.navNews": { zh: "公司动态", en: "News", de: "News", ja: "ニュース" },
  "landing.navContact": { zh: "联系合作", en: "Contact", de: "Kontakt", ja: "お問い合わせ" },
  "landing.navCustomize": { zh: "在线定制", en: "Customize Online", de: "Online anpassen", ja: "オンライン注文" },
  "landing.navLogin": { zh: "登录", en: "Login", de: "Anmelden", ja: "ログイン" },
  "landing.navLogout": { zh: "退出登录", en: "Logout", de: "Abmelden", ja: "ログアウト" },
  "landing.navOrders": { zh: "我的订单", en: "My Orders", de: "Meine Bestellungen", ja: "注文履歴" },
  "landing.navCustomers": { zh: "客户档案", en: "Customers", de: "Kunden", ja: "顧客アーカイブ" },
  "landing.navAdmin": { zh: "后台管理", en: "Admin", de: "Verwaltung", ja: "管理" },
  "landing.heroEyebrow": { zh: "PRIVATE MADE-TO-MEASURE · B2B SUPPLY", en: "PRIVATE MADE-TO-MEASURE · B2B SUPPLY", de: "PRIVATE MADE-TO-MEASURE · B2B SUPPLY", ja: "PRIVATE MADE-TO-MEASURE · B2B SUPPLY" },
  "landing.heroTitleA": { zh: "从面料到成衣", en: "From fabric to finished garment", de: "Vom Stoff zum fertigen Anzug", ja: "生地から仕上がりまで" },
  "landing.heroTitleB": { zh: "为定制门店提供稳定产能", en: "stable supply for tailoring stores", de: "stabile Produktion für Maßschneidereien", ja: "テーラー店舗への安定供給" },
  "landing.heroSub": { zh: "一站式白标定制平台。对接意大利 VBC、STYLBIELLA 等国际面料,西装、西裤、马甲、衬衫全品类小单快返,为欧美定制门店与品牌提供可靠的供应链与数字化下单系统。", en: "An all-in-one white-label tailoring platform. Sourcing Italian mills such as VBC and STYLBIELLA, with low-MOQ production across jackets, trousers, waistcoats and shirts — plus a digital ordering system for stores and brands.", de: "", ja: "" },
  "landing.heroCta": { zh: "在线定制", en: "Customize Online", de: "Online anpassen", ja: "オンライン注文" },
  "landing.heroCtaSub": { zh: "选择面料 · 录入尺寸 · 确认款式", en: "Pick fabric · Enter measurements · Confirm style", de: "", ja: "" },
  "landing.heroCta2": { zh: "联系我们", en: "Contact Us", de: "Kontakt", ja: "お問い合わせ" },
  "landing.statYears": { zh: "年定制生产经验", en: "Years of tailoring", de: "Jahre Maßschneiderei", ja: "年の仕立て経験" },
  "landing.statMarkets": { zh: "合作市场", en: "Partner markets", de: "Partnermärkte", ja: "取引市場" },
  "landing.statLead": { zh: "标准生产周期", en: "Standard lead time", de: "Standard-Lieferzeit", ja: "標準リードタイム" },
  "landing.statMills": { zh: "国际面料品牌", en: "Fabric mills", de: "Stofflieferanten", ja: "海外生地ブランド" },
  "landing.secCompanyEyebrow": { zh: "COMPANY PROFILE · 公司简介", en: "COMPANY PROFILE", de: "COMPANY PROFILE", ja: "COMPANY PROFILE" },
  "landing.secCompanyTitle": { zh: "一体化定制生产平台", en: "One integrated tailoring platform", de: "", ja: "" },
  "landing.secCompanyLead": { zh: "我们专注为欧美定制西装门店、连锁门店与品牌提供稳定、可扩展的中国定制生产能力,从面料采购、量体下单、生产排期到国际物流,全链路数字化管理。", en: "We provide stable, scalable made-to-measure production in China for European & American suit stores, chains and brands — with digital management across fabric sourcing, ordering, production scheduling and international logistics.", de: "", ja: "" },
  "landing.companyPoint1": { zh: "15+ 年定制生产经验,服务 30+ 国际市场", en: "15+ years of tailoring, serving 30+ markets", de: "", ja: "" },
  "landing.companyPoint2": { zh: "白标合作模式:使用您的门店品牌,不出现工厂信息", en: "White-label partnership under your store brand", de: "", ja: "" },
  "landing.companyPoint3": { zh: "全品类覆盖:西装上衣、西裤、马甲、衬衫", en: "Full category: jackets, trousers, waistcoats, shirts", de: "", ja: "" },
  "landing.companyPoint4": { zh: "小单快返:1 件起订,支持快速返单", en: "Low MOQ with fast reorders (from 1 pc)", de: "", ja: "" },
  "landing.secQualityEyebrow": { zh: "FACTORY & QUALITY · 工厂与品质", en: "FACTORY & QUALITY", de: "FABRIK & QUALITÄT", ja: "工場と品質" },
  "landing.secQualityTitle": { zh: "每一张订单都有清晰的生产节点与质量记录", en: "Every order has clear production milestones and quality records", de: "", ja: "" },
  "landing.quality1": { zh: "面料检验与编号管理", en: "Fabric inspection & coding", de: "", ja: "" },
  "landing.quality1Sub": { zh: "到库面料逐卷检验并建立唯一编号,生产全程可追溯。", en: "Every roll is inspected and coded for full traceability.", de: "", ja: "" },
  "landing.quality2": { zh: "独立裁剪 · 缝制 · 整烫", en: "Cutting · Sewing · Pressing", de: "", ja: "" },
  "landing.quality2Sub": { zh: "裁片、缝制与整烫独立分区,标准工序卡控制每一道工艺。", en: "Dedicated zones with standard operation cards for each step.", de: "", ja: "" },
  "landing.quality3": { zh: "尺寸复核与成衣质量标准", en: "Measurement check & QC standard", de: "", ja: "" },
  "landing.quality3Sub": { zh: "按订单净体/成衣尺寸逐项复核,出厂前完成成衣质检。", en: "Every order is re-checked against net & finished measurements.", de: "", ja: "" },
  "landing.quality4": { zh: "产能、交期、证书与验厂", en: "Capacity, lead time & audits", de: "", ja: "" },
  "landing.quality4Sub": { zh: "标准生产周期 4 周,支持验厂,相关资质证书可索取。", en: "4-week standard lead time; factory audits and certificates available.", de: "", ja: "" },
  "landing.cert1": { zh: "ISO 9001", en: "ISO 9001", de: "", ja: "" },
  "landing.cert1Sub": { zh: "质量管理体系", en: "Quality management", de: "", ja: "" },
  "landing.cert2": { zh: "SGS 验厂", en: "SGS Audit", de: "", ja: "" },
  "landing.cert2Sub": { zh: "社会责任审核", en: "Social compliance", de: "", ja: "" },
  "landing.cert3": { zh: "面料溯源", en: "Fabric traceability", de: "", ja: "" },
  "landing.cert3Sub": { zh: "意大利原厂采购单", en: "Italian mill invoices", de: "", ja: "" },
  "landing.cert4": { zh: "成衣质检", en: "Garment QC", de: "", ja: "" },
  "landing.cert4Sub": { zh: "出厂前逐件检验", en: "100% pre-shipment check", de: "", ja: "" },
  "landing.secNewsEyebrow": { zh: "COMPANY NEWS · 公司动态", en: "COMPANY NEWS", de: "COMPANY NEWS", ja: "COMPANY NEWS" },
  "landing.secNewsTitle": { zh: "行业动态与工厂资讯", en: "Industry news & factory updates", de: "", ja: "" },
  "landing.readMore": { zh: "阅读更多 →", en: "Read more →", de: "Mehr lesen →", ja: "続きを読む →" },
  "landing.secContactEyebrow": { zh: "CONTACT & PARTNERSHIP · 联系合作", en: "CONTACT & PARTNERSHIP", de: "KONTAKT & PARTNERSCHAFT", ja: "CONTACT & PARTNERSHIP" },
  "landing.secContactTitle": { zh: "提交样衣、报价或白标系统合作需求", en: "Request samples, quotes or white-label partnership", de: "", ja: "" },
  "landing.contactFormTitle": { zh: "提交合作需求", en: "Send your inquiry", de: "", ja: "" },
  "landing.contactName": { zh: "公司 / 门店名称", en: "Company / store name", de: "", ja: "" },
  "landing.contactEmail": { zh: "联系邮箱 / WhatsApp", en: "Email / WhatsApp", de: "", ja: "" },
  "landing.contactMsg": { zh: "请填写合作需求、预计数量或需要的样衣", en: "Tell us your needs, estimated quantity or sample requests", de: "", ja: "" },
  "landing.contactSubmit": { zh: "提交", en: "Submit", de: "", ja: "" },
  "landing.contactDone": { zh: "✓ 已收到您的需求(演示站点,表单未接入后台)。可复制以下内容通过邮箱或 WhatsApp 发送给我们:", en: "✓ Inquiry received (demo site, not connected to a backend). You can copy the content below and send it to us via email or WhatsApp:", de: "", ja: "" },
  "landing.contactEmailLabel": { zh: "业务邮箱", en: "Business email", de: "", ja: "" },
  "landing.contactWaLabel": { zh: "WhatsApp", en: "WhatsApp", de: "", ja: "" },
  "landing.contactAddrLabel": { zh: "工厂地址", en: "Factory address", de: "", ja: "" },
  "landing.contactHoursLabel": { zh: "工作时间", en: "Working hours", de: "", ja: "" },
  "landing.contactAddr": { zh: "待补充", en: "To be confirmed", de: "", ja: "" },
  "landing.contactHours": { zh: "周一至周六 09:00–18:00 (北京时间)", en: "Mon–Sat 09:00–18:00 (CST)", de: "", ja: "" },
  "landing.heroBadge1": { zh: "全品类定制", en: "Full-category MTM", de: "", ja: "" },
  "landing.heroBadge2": { zh: "小单快返", en: "Low MOQ & fast reorder", de: "", ja: "" },
  "landing.heroBadge3": { zh: "国际物流直达", en: "Global shipping", de: "", ja: "" },
  "landing.footRights": { zh: "© 2026 TailorSupply OS · 定制西装供应链平台", en: "© 2026 TailorSupply OS · Made-to-measure supply platform", de: "", ja: "" },
  "landing.news1Date": { zh: "2026-08-05", en: "2026-08-05", de: "", ja: "" },
  "landing.news1Tag": { zh: "面料动态", en: "Fabric", de: "", ja: "" },
  "landing.news1Title": { zh: "2026 秋冬西服面料册更新", en: "2026 Autumn/Winter suiting book updated", de: "", ja: "" },
  "landing.news1Excerpt": { zh: "新增 VBC 深藏青等 6 款面料,全部支持小单快返。", en: "6 new cloths including VBC navy, all available at low MOQ.", de: "", ja: "" },
  "landing.news2Date": { zh: "2026-07-22", en: "2026-07-22", de: "", ja: "" },
  "landing.news2Tag": { zh: "门店服务", en: "Store service", de: "", ja: "" },
  "landing.news2Title": { zh: "欧洲合作门店远程培训开放预约", en: "Remote training for partner stores now open", de: "", ja: "" },
  "landing.news2Excerpt": { zh: "面向合作门店的量体、下单系统与面料知识培训,支持英文/德文授课。", en: "Training on measuring, ordering system and fabrics for partner stores, in English & German.", de: "", ja: "" },
  "landing.news3Date": { zh: "2026-07-08", en: "2026-07-08", de: "", ja: "" },
  "landing.news3Tag": { zh: "产能动态", en: "Production", de: "", ja: "" },
  "landing.news3Title": { zh: "衬衫小单快返生产线投入使用", en: "Shirt low-MOQ fast line launched", de: "", ja: "" },
  "landing.news3Excerpt": { zh: "衬衫 3 件起订,标准交期缩短至 2 周,支持返单免版费。", en: "Shirts from 3 pcs with 2-week lead time; free reorder pattern fee.", de: "", ja: "" },
  "landing.news4Date": { zh: "2026-06-15", en: "2026-06-15", de: "", ja: "" },
  "landing.news4Tag": { zh: "展会计划", en: "Exhibition", de: "", ja: "" },
  "landing.news4Title": { zh: "下一期海外展会与拜访计划公布", en: "Next overseas exhibitions & visit plan", de: "", ja: "" },
  "landing.news4Excerpt": { zh: "计划参加下一季度欧洲男装展,并开放合作门店到厂参观预约。", en: "Attending next season's European menswear fair; factory visit slots available.", de: "", ja: "" },
  "pi.exportTable": { zh: "导出 PI 表格", en: "Export PI Spreadsheet", de: "PI-Tabelle exportieren", ja: "PI表をエクスポート" },
  "currency.latestRate": { zh: "最新参考汇率", en: "Latest reference rate", de: "Aktueller Referenzkurs", ja: "最新参考為替レート" },
  "currency.loadingRate": { zh: "正在更新汇率", en: "Updating exchange rate", de: "Wechselkurs wird aktualisiert", ja: "為替レートを更新中" },
  "home.styleNotePlaceholder": { zh: "请填写本件产品的特殊要求、制作说明或其他备注（选填）", en: "Add special requests, making instructions or other notes for this item (optional)", de: "Sonderwünsche, Fertigungshinweise oder weitere Notizen zu diesem Artikel (optional)", ja: "この商品の特別なご要望、縫製指示、その他の備考をご記入ください（任意）" },
};

export function translate(key: string, locale?: Locale): string {
  const entry = T[key];
  if (!entry) return key;
  const loc = locale ?? store.locale;
  const european = europeanTranslation(loc, key);
  if (european) return european;
  return entry[loc] ?? entry.en ?? key;
}

/** 客户端 hook：响应语言切换 */
export function useLocale(): { loc: Locale; t: (key: string) => string } {
  const [loc, setLocState] = useState<Locale>(DEFAULT_LOCALE);
  useEffect(() => {
    const cookieLocale = typeof document !== "undefined" ? document.cookie.match(/(?:^|; )atelier_locale=([^;]+)/)?.[1] as Locale | undefined : undefined;
    const saved = typeof window !== "undefined" ? ((window.localStorage.getItem("locale") as Locale | null) ?? cookieLocale ?? null) : null;
    if (saved && LOCALES.some((item) => item.code === saved)) {
      setLocale(saved);
      setLocState(saved);
    }
    return subscribeLocale(() => setLocState(getLocale()));
  }, []);
  return { loc, t: (key: string) => translate(key, loc) };
}
