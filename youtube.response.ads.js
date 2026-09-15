// YouTube Renderer Ads Blocker for Shadowrocket
// https://github.com/Rom777Arm/YouTubeAdsBlock
// Build: 2026/09/16 — safe rollback

(() => {
  const AD_RENDERERS = new Set([
    "adSlotRenderer",
    "inFeedAdLayoutRenderer",
    "displayAdRenderer",
    "searchPyvRenderer",
    "promotedVideoRenderer",
    "promotedSparklesWebRenderer",
    "promotedSparklesTextSearchRenderer",
    "compactPromotedItemRenderer",
    "compactPromotedVideoRenderer",
    "gridPromotedVideoRenderer",
    "carouselAdRenderer",
    "adPlacementRenderer",
    "videoMastheadAdV3Renderer",
    "videoMastheadAdRenderer",
    "playerOverlayAdsRenderer",
    "imageAdRenderer",
    "inStreamVideoAdRenderer",
    "companionAdsRenderer",
    "companionAdRenderer",
    "actionCompanionAdRenderer",
    "instreamAdPlayerOverlayRenderer"
  ]);

  const AD_TOP_LEVEL = new Set([
    "playerAds",
    "adPlacements",
    "adSlots"
  ]);

  function clean(value) {
    if (Array.isArray(value)) {
      return value
        .filter(item => {
          if (!item || typeof item !== "object" || Array.isArray(item)) return true;
          return !Object.keys(item).some(key => AD_RENDERERS.has(key));
        })
        .map(clean);
    }

    if (!value || typeof value !== "object") return value;

    const result = {};
    for (const [key, child] of Object.entries(value)) {
      if (AD_TOP_LEVEL.has(key)) continue;
      if (AD_RENDERERS.has(key)) continue;
      result[key] = clean(child);
    }
    return result;
  }

  function processBody(body) {
    if (!body || typeof body !== "string") return body;
    try {
      return JSON.stringify(clean(JSON.parse(body)));
    } catch (e) {
      return body;
    }
  }

  try {
    if (typeof $response !== "undefined" && $response.body) {
      $done({ body: processBody($response.body) });
    } else {
      $done({});
    }
  } catch (e) {
    $done({});
  }
})();
