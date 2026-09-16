// YouTube Renderer Ads Blocker for Shadowrocket
// https://github.com/Rom777Arm/MyScripPremium
// Build: 2026/09/16

(() => {
  const AD_RENDERERS = new Set([
    // Основные рекламные renderer
    "adSlotRenderer",
    "inFeedAdLayoutRenderer",
    "displayAdRenderer",
    "searchPyvRenderer",
    "promotedVideoRenderer",
    "promotedSparklesWebRenderer",
    "promotedSparklesTextSearchRenderer",

    // Promoted / sponsored
    "compactPromotedItemRenderer",
    "compactPromotedVideoRenderer",
    "gridPromotedVideoRenderer",

    // Другие рекламные renderer
    "carouselAdRenderer",
    "adPlacementRenderer",
    "adsEnginePingerRenderer",
    "playerLegacyDesktopWatchAdsRenderer",
    "adBreakServiceRenderer",
    "mainAppAdsAddedToContextRenderer",
    "adNotificationRenderer",

    // Masthead / display
    "videoMastheadAdV3Renderer",
    "videoMastheadAdRenderer",
    "videoMastheadAdRendererBetaPreview",

    // Overlay / companion
    "playerOverlayAdsRenderer",
    "imageAdRenderer",
    "inStreamVideoAdRenderer",
    "adActionInterstitialRenderer",
    "companionAdsRenderer",
    "companionAdRenderer",
    "actionCompanionAdRenderer",
    "instreamAdPlayerOverlayRenderer"
  ]);

  // Рекламные поля верхнего уровня
  const AD_TOP_LEVEL = new Set([
    "playerAds",
    "adPlacements",
    "adSlots",
    "adBreakHeartbeatParams",
    "adParams"
  ]);

  function isAdRendererKey(key) {
    return AD_RENDERERS.has(key);
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

    return false;
  }

  function clean(value, parentKey = "") {
    if (Array.isArray(value)) {
      const result = [];

      for (const item of value) {
        // Полностью удаляем рекламный renderer из массива
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

      // Удаляем стандартные рекламные поля
      if (AD_TOP_LEVEL.has(key)) {
        continue;
      }

      // Удаляем renderer с рекламой
      if (isAdRendererKey(key)) {
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
      // Если ответ не JSON — оставляем без изменений
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