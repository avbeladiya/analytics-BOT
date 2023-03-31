const eventMap = {
  buy_now_click: 'Buy Now Click',
  mint_click: 'Mint Click',
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

const listTypeRegex = /(list|top|best)/i
const aggregateRegex = {
  visitors: /(visitors?|people|users|visited)/i,
  visits: /(visit|impression)s?/i,
  pageviews: /((page\s?view)s?)/i,
  bounce_rate: /(bounce|bounce rate)/i,
}
const listRegex = {
  event: /(conversions|events|goals)/i,
  page: /(pages|url)/i,
  source: /sources/i,
  referrer: /(referr?ers?|referr?al|referr?er)/i,
  utm_medium: /medium/i,
  utm_source: /utm source/i,
  utm_campaign: /campaign/i,
  browser: /browser/i,
  os: /(\bos\b|operating system)/i,
  country: /(countr(y|ies))/i,
}

const haveMetricFilterRegex = /(from|for)/i
const metricFilterRegexes = {
  source: /from (?<fp>(.+?))(source|\s|\.|$)/i, // prelist of keywords
  event_buy_now_click: /clicked (on )?buy(now )?/i,
  event_mint_click: /clicked (on )?mint(now )?/i,
  event_connect_wallet: /connected wallet|wallet connected/i,
  event_purchased: /purchased|bought/i,
  event_minted: /minted/i,
}

const haveListAggregateRegex = /\bby\b/i
const listAggregatorRegexes = {
  visitors: /visitors?/i,
  visits: /visits?/i,
  pageviews: /page\s?views?/i,
  bounce_rate: /bounce rate/i,
  events: /events?/i,
}

const durationRegex = /(today|yesterday|this week|this month|last week|last month|last year|past \d+ days|between \w+day and \w+day)/i

const getDataTypePart = (message) => {
  if (listTypeRegex.test(message)) {
    for (let pType in listRegex) {
      if (listRegex[pType].test(message)) return ['breakdown', pType];
    }
  } else {
    for (let pType in aggregateRegex) {
      if (aggregateRegex[pType].test(message)) return ['aggregate', pType];
    }
  }

  return [null,null];
}

const getMetricFilterPart = (message) => {
  for (let pType in metricFilterRegexes) {
    if (metricFilterRegexes[pType].test(message)) {
      const { groups: filterParam } = metricFilterRegexes[pType].exec(message);
      return {
        filterKey: pType,
        filterValue: filterParam?.fp.trim(),
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

const uppercaseEveryWord = str => str.toUpperCase();
const lowercaseEveryWord = str => str.toLowerCase();
const capitilizeEveryWord = str => str.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
const capitilizeFirstWord = str => str.replace(/(^\w{1})/g, letter => letter.toUpperCase());

export const parseUserStringFromRegexService = async (userMessage) => {
  const [apiType, dataType] = getDataTypePart(userMessage);
  // console.log("🚀 ~ file: regexMatcherService.js:203 ~ parseUserStringFromRegexService ~ apiType, dataType:", apiType, dataType)
  const duration = getDurationPart(userMessage) ?? '6mo';

  if (!dataType) return {}

  let reqBody = {};
  reqBody["duration"] = duration;
  reqBody["apiType"] = apiType;
  if (apiType == "aggregate") {
    reqBody["metric"] = metricsMap[dataType];
    if (haveMetricFilterRegex.test(userMessage)) {
      const { filterKey, filterValue } = getMetricFilterPart(userMessage);
      if (filterKey && filterKey.includes('event_')) {
        reqBody["filters"] =
          `event:name==${eventMap[filterKey.replace('event_', '')]}`
      } else if (filterKey) {
        reqBody["filters"] =
          `${propertiesMap[filterKey]}==${filterValue}|${uppercaseEveryWord(filterValue)}|${lowercaseEveryWord(filterValue)}|${capitilizeEveryWord(filterValue)}|${capitilizeFirstWord(filterValue)}`
          // `source==${filterValue}|${uppercaseEveryWord(filterValue)}|${lowercaseEveryWord(filterValue)}|${capitilizeEveryWord(filterValue)}|${capitilizeFirstWord(filterValue)}`
      }
    }
  } else if (apiType == "breakdown") {
    reqBody["property"] = propertiesMap[dataType];
    const aggregateKey = getListAggregatePart(userMessage);
    // console.log("🚀 ~ file: regexMatcherService.js:229 ~ parseUserStringFromRegexService ~ aggregateKey:", aggregateKey)
    reqBody["metric"] = 'visitors';

    // console.log("🚀 ~ file: regexMatcherService.js:233 ~ parseUserStringFromRegexService ~ haveListAggregateRegex.test(userMessage):", haveListAggregateRegex.test(userMessage))
    if (haveListAggregateRegex.test(userMessage))
      reqBody["metric"] = getListAggregatePart(userMessage) || 'visitors';

    if (haveListAggregateRegex.test(userMessage) &&
      [
        'buy_now_click',
        'mint_click',
        'connect_wallet',
        'purchased',
        'minted',
      ].includes(aggregateKey)) {
      reqBody["metric "] = 'events';
      reqBody["filters"] = 'event:name==' + eventMap[aggregateKey];
    }
  }
  // console.log("🚀 ~ file: regexMatcherService.js:246 ~ parseUserStringFromRegexService ~ reqBody:", reqBody)
  return reqBody;
};

// parseUserStringFromRegexService('What were the page view count from twitter source')
// parseUserStringFromRegexService('list of events')
// parseUserStringFromRegexService('give me visitors count for Minted events')
// parseUserStringFromRegexService('what was traffic in last week')
// parseUserStringFromRegexService('what is traffic in this week')
// parseUserStringFromRegexService('give me visitors count for Minted event from this week')
//  parseUserStringFromRegexService(process.argv[2] ?? '')
