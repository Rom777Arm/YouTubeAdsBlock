// YouTube Renderer Ads Blocker for Shadowrocket
// https://github.com/Rom777Arm/YouTubeAdsBlock
// Build: 2026/09/16 — feed/banner aggressive test

(() => {
  // Рекламные renderer, которые встречаются в Home / Search / Browse / Watch API.
  const AD_RENDERERS = new Set([
    // Основные in-feed / display ads
    "adSlotRenderer",
    "inFeedAdLayoutRenderer",
    "displayAdRenderer",
    "searchPyvRenderer",
    "promotedVideoRenderer",
    "promotedSparklesWebRenderer",
    "promotedSparklesTextSearchRenderer",

    // Sponsored / promoted cards
    "compactPromotedItemRenderer",
    "compactPromotedVideoRenderer",
    "gridPromotedVideoRenderer",
    "carouselAdRenderer",
    "adPlacementRenderer",
    "adsEnginePingerRenderer",

    // Banner / promo / statement ads
    "statementBannerRenderer",
    "bannerPromoRenderer",
    "backgroundPromoRenderer",
    "mealbarPromoRenderer",
    "feedNudgeRenderer",
    "brandVideoShelfRenderer",
    "brandVideoSingletonRenderer",
    "brandcastVideoRenderer",
    "primetimePromoRenderer",

    // Masthead / display
    "videoMastheadAdV3Renderer",
    "videoMastheadAdRenderer",
    "videoMastheadAdPrimaryVideoRenderer",
    "videoMastheadAdAdvertiserInfoRenderer",

    // Player / companion ads
    "playerOverlayAdsRenderer",
    "imageAdRenderer",
    "inStreamVideoAdRenderer",
    "adActionInterstitialRenderer",
    "companionAdsRenderer",
    "companionAdRenderer",
    "actionCompanionAdRenderer",
    "instreamAdPlayerOverlayRenderer",
    "playerLegacyDesktopWatchAdsRenderer",
    "adBreakServiceRenderer",
    "mainAppAdsAddedToContextRenderer",
    "adNotificationRenderer",

    // Shopping / commercial promo blocks
    "merchandiseShelfRenderer",
    "shoppingCarouselRenderer",
    "shoppingProductRenderer",
    "productListRenderer",
    "productItemRenderer"
  ]);

  // Поля, которые сами являются рекламными контейнерами.
  const AD_TOP_LEVEL = new Set([
    "playerAds",
    "adPlacements",
    "adSlots",
    "adBreakHeartbeatParams",
    "adParams",
    "adLayoutMetadata",
    "adSlotMetadata",
    "adBreakAdRequestData"
  ]);

  // Прямые маркеры рекламного renderer-объекта.
  const AD_MARKER_KEYS = new Set([
    "adLayoutMetadata",
    "adSlotMetadata",
    "advertiserInfo",
    "adBadgeRenderer",
    "sponsorshipsOffer",
    "sponsoredBadge"
  ]);

  function isAdRendererKey(key) {
    return AD_RENDERERS.has(key);
  }

  function hasAdMarker(obj) {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
      return false;
    }

    for (const key of Object.keys(obj)) {
      if (AD_MARKER_KEYS.has(key)) {
        return true;
      }
    }

    return false;
  }

  function isAdObject(obj) {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
      return false;
    }

    for (const key of Object.keys(obj)) {
      if (isAdRendererKey(key)) {
        return true;
      }
    }

    // Рекламные объекты, которые YouTube может завернуть в обычный
    // richItem / content / layout renderer.
    if (hasAdMarker(obj)) {
      return true;
    }

    return false;
  }

  function clean(value, parentKey = "") {
    if (Array.isArray(value)) {
      const result = [];

      for (const item of value) {
        // Удаляем рекламный объект целиком из массива.
        if (isAdObject(item)) {
          continue;
        }

        const cleaned = clean(item, parentKey);

        if (cleaned !== undefined) {
          result.push(cleaned);
        }
      }

      return result;
    }

    if (!value || typeof value !== "object") {
      return value;
    }

    const result = {};

    for (const [key, child] of Object.entries(value)) {
      // Рекламные контейнеры.
      if (AD_TOP_LEVEL.has(key)) {
        continue;
      }

      // Известные рекламные renderer.
      if (isAdRendererKey(key)) {
        continue;
      }

      // Дополнительная защита: если значение само является рекламным
      // renderer-объектом, не переносим его дальше.
      if (child && typeof child === "object" && !Array.isArray(child) && isAdObject(child)) {
        continue;
      }

      const cleaned = clean(child, key);

      if (cleaned !== undefined) {
        result[key] = cleaned;
      }
    }

    return result;
  }

  function processBody(body) {
    if (!body || typeof body !== "string") {
      return body;
    }

    try {
      const json = JSON.parse(body);
      const cleaned = clean(json);
      return JSON.stringify(cleaned);
    } catch (e) {
      // Не JSON — ничего не меняем.
      return body;
    }
  }

  try {
    if (typeof $response !== "undefined" && $response.body) {
      $done({
        body: processBody($response.body)
      });
    } else {
      $done({});
    }
  } catch (e) {
    $done({});
  }
})();
