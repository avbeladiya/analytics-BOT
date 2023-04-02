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

const isListAsked = (message) => {
  const regexStr = /\b(list|top|best)\b/i
  return regexStr.test(message)
}
const areEventsAsked = (message) => {
  const regexStr = /(events?|conversions?|goals?)/i
  return regexStr.test(message)
}
const shouldAggregateBeFiltered = (message) => {
  const regexStr = /\b(from|for)\b/i
  return regexStr.test(message)
}
const parseAggregateStats = (message) => {
  const aggregateRegex = {
    visitors: /(visitors?|people|users|visited)/i,
    visits: /(visit|impression)s?/i,
    pageviews: /((page\s?view)s?)/i,
    bounce_rate: /(bounce|bounce rate)/i,
  }

  for (let pType in aggregateRegex) {
    if (aggregateRegex[pType].test(message)) return pType;
  }
  return 'visitors'
}
const parseAggregateFilter = (message) => {
  const metricFilterRegexes = {
    source: /from (?<fp>(.+?))(source|\s|\.|$)/i, // prelist of keywords
    event_buy_now_click: /clicked (on )?buy(now )?/i,
    event_mint_click: /clicked (on )?mint(now )?/i,
    event_connect_wallet: /connected wallet|wallet connected/i,
    event_purchased: /purchased|bought/i,
    event_minted: /minted/i,
  }

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

const shouldListBeGroupedByDifferentMetric = (message) => {
  const regexStr = /\b(by|based on)\b/i
  return regexStr.test(message)
}
const parseListProperty = (message) => {
  const listRegex = {
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

  for (let pType in listRegex) {
    if (listRegex[pType].test(message)) return pType;
  }
  return 'source'
}
const parseListGroupedMetric = (message) => {
  const listAggregatorRegexes = {
    visitors: /visitors?/i,
    visits: /visits?/i,
    pageviews: /page\s?views?/i,
    bounce_rate: /bounce rate/i,
    events: /events?/i,
  }
  for (let pType in listAggregatorRegexes) {
    if (listAggregatorRegexes[pType].test(message)) return pType;
  }
  return 'visitors'
}

const isEventUnique = (message) => {
  const regexStr = /\b(unique|distinct)\b/i
  return regexStr.test(message)
}
const parseEvent = (message) => {
  const eventRegexes = {
    buy_now_click: /\bbuy\b/i,
    mint_click: /\bmint\b/i,
    connect_wallet: /\b(connected wallet|wallet connected)\b/i,
    purchased: /\b(purchased|bought)\b/i,
    minted: /\bminted\b/i,
  }

  for (let pType in eventRegexes) {
    if (eventRegexes[pType].test(message)) return pType;
  }
}

const parseDateString = (message) => {
  const durationRegex = /(today|yesterday|this week|this month|last week|last month|last year|past \d+ days|between \w+day and \w+day)/i

  const matches = message.match(durationRegex);
  if (!matches) return null;
  const durationStr = matches[0];
  return parseDateDuration(durationStr);
}
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

/**
 * @typedef {Object} PlausibleApiQuery
 * @property {String} [apiType] - type of api (aggregate | breakdown)
 * @property {String} [property] - the property to breakdown the result with
 * @property {String} [period] - the time duration
 * @property {String} [metrics] - the metrics stat to get
 * @property {String} [filters] - extra filter condition
 * @property {String} [date] - csv date value if period is custom
 * @property {String} [limit] - limit the number of responses
 * 
 * @param {String} uMsg 
 * @returns {PlausibleApiQuery} 
 */
export const parseUserMessageWithRegex = (uMsg) => {
  const parsedMsg = {};

  const shouldGetEvents = areEventsAsked(uMsg);
  
  const apiType = isListAsked(uMsg) ? 'breakdown' : 'aggregate';
  parsedMsg['apiType'] = apiType

  const duration = parseDateString(uMsg);
  if (duration) {
    parsedMsg['period'] = 'custom';
    parsedMsg['date'] = duration;
  } else {
    parsedMsg['period'] = '6mo';
  }

  if (apiType == 'aggregate' && !shouldGetEvents) {
    const aggregatedStats = parseAggregateStats(uMsg)
    const aggregatFilter = shouldAggregateBeFiltered(uMsg)
      ? parseAggregateFilter(uMsg)
      : null

    parsedMsg['metrics'] = metricsMap[aggregatedStats]

    if (aggregatFilter) {
      const { filterKey, filterValue } = aggregatFilter;
      parsedMsg['filters'] = `${propertiesMap[filterKey]}==${filterValue}|${uppercaseEveryWord(filterValue)}|${lowercaseEveryWord(filterValue)}|${capitilizeEveryWord(filterValue)}|${capitilizeFirstWord(filterValue)}`
    }
  }
  else if (apiType == 'breakdown' && !shouldGetEvents) {
    const listProperty = parseListProperty(uMsg)
    const listGroupMetric = shouldListBeGroupedByDifferentMetric(uMsg)
      ? parseListGroupedMetric(uMsg)
      : 'visitors';
    parsedMsg['property'] = propertiesMap[listProperty]
    parsedMsg['metrics'] = metricsMap[listGroupMetric]
  }
  else if (apiType == 'aggregate' && shouldGetEvents) {
    const getEventType = parseEvent(uMsg)
    parsedMsg['metrics'] = isEventUnique(uMsg) ? metricsMap['visitors'] : metricsMap['events'];
    parsedMsg['filters'] = 'event:name==' + eventMap[getEventType]
  }
  else if (apiType == 'breakdown' && shouldGetEvents) {
    const listProperty = parseListProperty(uMsg)
    const getEventType = parseEvent(uMsg)
    parsedMsg['metrics'] = isEventUnique(uMsg) ? metricsMap['visitors'] : metricsMap['events'];
    parsedMsg['property'] = propertiesMap[listProperty]
    parsedMsg['filters'] = 'event:name==' + eventMap[getEventType]
  }

  parsedMsg['limit'] = 5;
  return parsedMsg;
}