const config = {
  BASE_URL: "https://phantom.flolio.com",
  TOKEN: "pC2jSWFU4NV7ZkHJ78y84hd4BvRvzfQ4Qcc4wAK1hX_UuNVnJdZMAEMvWkKMJ6SX",
  SITE_ID: "exceed.story-demo.ogn-review.net",
  OPEN_API_KEY: "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",
  PERIOD: "6mo",
  EVENT_METRICS: "visitors,events",
  PAGE_VIEW_METRICS: "visitors,pageviews",
  DATA_LIMIT: 5,
  API_FILTER_PATH: {
    breakdown: "/api/v1//stats/breakdown",
    aggregate: "/api/v1//stats/aggregate",
  },
  // ...window.BOT_CONFIG,
  EVENTS: {
    mint_click: "Mint Click",
    minted: "Minted",
    connect_wallet: "Connect Wallet",
    buy_now_click: "Buy Now Click",
    purchased: "Purchased",
  },
  QUERY_PARAMS: {
    conversion_rate: {
      apiType: "breakdown",
      body: {
        property: "visit:source",
        metric: "conversions",
      },
    },
    top_pages: {
      apiType: "breakdown",
      body: {
        property: "event:page",
      },
    },
    top_countries: {
      apiType: "breakdown",
      body: {
        property: "visit:country",
      },
    },
    bounce_rate: {
      apiType: "breakdown",
      body: {
        property: "visit:country",
        metrics: "bounce_rate",
      },
    },
    top_referrer: {
      apiType: "breakdown",
      body: {
        // property:"event:name"
      },
    },
    top_utms: {
      apiType: "breakdown",
      body: {
        property: "visit:utm_source",
      },
    },
    pageviews: {
      apiType: "aggregate",
      body: {
        metrics: "pageviews",
      },
    },
    visitors: {
      apiType: "aggregate",
      body: {
        metrics: "visitors",
      },
    },
    devices: {
      apiType: "breakdown",
      body: {
        property: "visit:device",
      },
    },
  },
};
export default config;
