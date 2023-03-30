const eventMap = {
  buy_now_click: 'Buy Now Click',
  mint_click:'Mint Click',
  connect_wallet: 'Connect Wallet',
  purchased: 'Purchased',
  minted: 'Minted',
}
const metricsMap = {
  visitors: 'visitors',
  visits: 'visits',
  pageviews: 'pageviews',
  bounce_rate: 'bounce_rate',
  events: 'events',
}
const propertiesMap = {
  event: 'event:name',
  page: 'event:page',
  source: 'visit:source',
  referrer: 'visit:referrer',
  utm_medium: 'visit:utm_medium',
  utm_source: 'visit:utm_source',
  utm_campaign: 'visit:utm_campaign',
  device: 'visit:device',
  browser: 'visit:browser',
  os: 'visit:os',
  country: 'visit:country',
  region: 'visit:region',
  city: 'visit:city',
}
const dataTypeRegexes = {
  // Counts or aggregates
  visitors_count: /(visitors? count|(count|number) of visitors)/i,
  visits_count: /((visit|impression)s? count|(count|number) of (visit|impression)s?)/i,
  pageviews_count: /((page view)s? count|(count|number) of (page view)s?)/i,
  bounce_rate_count: /((bounce)s? count|(count|number) of (bounce)s?)/i,
  events_count: /((event)s? count|(count|number) of (event)s?)/i,

  // Custom Count or aggregates
  // conversion_rate: /conversions/i

  // Lists or Breakdowns available
  event_list: /(list of (events|goals))|((events|goals) list)/i,
  page_list: /(list of pages?)|(pages? list)/i,
  source_list: /(list of sources?)|(sources? list)/i,
  referrer_list: /(list of referrers?)|(referrers? list)/i,
  utm_medium_list: /(list of mediums?)|(mediums? list)/i,
  utm_source_list: /(list of utm sources?)|(utm sources? list)/i,
  utm_campaign_list: /(list of campaigns?)|(campaigns? list)/i,
  device_list: /(list of devices?)|(devices? list)/i,
  browser_list: /(list of browsers?)|(browsers? list)/i,
  os_list: /(list of (os|operating systems?))|((os|operating systems?) list)/i,
  country_list: /(list of countr(y|ies))|(countr(y|ies) list)/i,
  region_list: /(list of regions?)|(regions? list)/i,
  city_list: /(list of citys?)|(citys? list)/i,

  // Custom List or breakdown
  // event_conversions_list: /conversion rates|success rates|conversions? list/i,
}

const metricFilterRegexes = {
  event: /(of|from|for)(?<fp>(.+?))(event|goal)/i,
  page: /(of|from|for)(?<fp>(.+?))(page)/i,
  source: /(of|from|for)(?<fp>(.+?))(source)/i,
  referrer: /(of|from|for)(?<fp>(.+?))(referrer)/i,
  utm_medium: /(of|from|for)(?<fp>(.+?))(medium)/i,
  utm_source: /(of|from|for)(?<fp>(.+?))(source)/i,
  utm_campaign: /(of|from|for)(?<fp>(.+?))(campaign)/i,
  device: /(of|from|for)(?<fp>(.+?))(device)/i,
  browser: /(of|from|for)(?<fp>(.+?))(browser)/i,
  os: /(of|from|for)(?<fp>(.+?))(os|operating system)/i,
  country: /(of|from|for)(?<fp>(.+?))(country)/i,
  region: /(of|from|for)(?<fp>(.+?))(region)/i,
  city: /(of|from|for)(?<fp>(.+?))(city)/i,
}

const listAggregatorRegexes = {
  visitors: /by visitors?/i,
  visits: /by visits?/i,
  pageviews: /by pageviews?/i,
  bounce_rate: /by bounce/i,
  events: /(by)(events)/i,

  buy_now_click: /by buy now (events?|clicks?)/i,
  mint_click: /by mint (events?|clicks?)/i,
  connect_wallet: /by (wallet connects?|connected wallets?|wallets?)/i,
  purchased: /by (bought|purchas(ed)?)/i,
  minted: /by minted/i,
}

const durationRegex = /(today|yesterday|this week|this month|last week|last month|last year|past \d+ days|between \w+day and \w+day)/i

const getDataTypePart = (message) => {
  for (let pType in dataTypeRegexes) {
    if (dataTypeRegexes[pType].test(message)) return pType;
  }
}
const getMetricFilterPart = (message) => {
  for (let pType in metricFilterRegexes) {
    if (metricFilterRegexes[pType].test(message)) {
      const {groups: {fp: filterParam}} = metricFilterRegexes[pType].exec(message);
      return {
        filterKey: pType,
        filterValue: filterParam.trim(),
      }
    }
  }

  return {
    filterKey: null,
    filterValue: null,
  }
}
const getListAggregatePart = (message) => {
  for (let pType in listAggregatorRegexes) {
    if (listAggregatorRegexes[pType].test(message)) return pType;
  }

  return null
}

const getDurationPart = (message) => {
  const matches = message.match(durationRegex);

  if (!matches) return null;

  const durationStr = matches[0];

  return parseDateDuration(durationStr);
};

const parseDateDuration = (dateString) => {
  const now = new Date();
  const dateParts = dateString.split(" ");

  let startDate, endDate;
  if (dateParts[0] === "today") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    endDate = now;
  } else if (dateParts[0] === "yesterday") {
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    startDate = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate()
    );
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (dateParts[0] === "this") {
    if (dateParts[1] === "week") {
      const startOfWeek = new Date(
        now.getTime() - now.getDay() * 24 * 60 * 60 * 1000
      );
      startDate = new Date(
        startOfWeek.getFullYear(),
        startOfWeek.getMonth(),
        startOfWeek.getDate()
      );
      endDate = now;
    } else if (dateParts[1] === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = now;
    } else {
      // Unsupported format
      return null;
    }
  } else if (dateParts[0] === "last") {
    if (dateParts[1] === "week") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      endDate = now;
    } else if (dateParts[1] === "month") {
      const lastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );
      startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (dateParts[1] === "year") {
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = now;
    }
  } else if (dateParts[0] === "past") {
    const daysAgo = parseInt(dateParts[1], 10);
    startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    endDate = now;
  } else if (dateParts[0] === "between") {
    const daysOfWeek = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const startDayIndex = daysOfWeek.indexOf(dateParts[2]);
    const endDayIndex = daysOfWeek.indexOf(dateParts[4]);
    const daysBetween = (endDayIndex - startDayIndex + 7) % 7;
    startDate = new Date(
      now.getTime() - (daysBetween + 7) * 24 * 60 * 60 * 1000
    );
    endDate = new Date(now.getTime() - daysBetween * 24 * 60 * 60 * 1000);
  } else {
    // Unsupported format
    return null;
  }

  return `${startDate.toISOString().split("T")[0]},${endDate.toISOString().split("T")[0]}`
};


export const parseUserStringFromRegexService = async (userMessage) => {
  const dataType = getDataTypePart(userMessage);
  const duration = getDurationPart(userMessage) ?? '6mo';

  let reqBody = {};
  reqBody["duration"] = duration;

  if (dataType.includes('count')) {
    reqBody["apiType"] = "aggregate";

    reqBody["metric"] = metricsMap[dataType.replace('_count','')];
    const {filterKey, filterValue} = getMetricFilterPart(userMessage);
    if(filterKey) {
      reqBody["filters"] = `${propertiesMap[filterKey]}==${filterValue}`
    }    
  } else if (dataType.includes('list')) {
    reqBody["apiType"] = "breakdown";

    reqBody["property"] = propertiesMap[dataType.replace('_list','')];
    const aggregateKey = getListAggregatePart(userMessage);
    reqBody["metrics"] = aggregateKey;

    if([
      'buy_now_click',
      'mint_click',
      'connect_wallet',
      'purchased',
      'minted',
    ].includes(aggregateKey)) {
      reqBody["metrics"] = 'events';
      reqBody["filters"] = 'event:name=='+eventMap[aggregateKey];
    }

  }

  console.log(reqBody);

  return reqBody;
};

// parseUserStringFromRegexService('What were the page view count from twitter source')
parseUserStringFromRegexService('list of events')
// parseUserStringFromRegexService('give me visitors count for Minted events')
// parseUserStringFromRegexService('what was traffic in last week')
// parseUserStringFromRegexService('what is traffic in this week')
// parseUserStringFromRegexService('give me visitors count for Minted event from this week')
