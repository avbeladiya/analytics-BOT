import config from "./config";
export function formatResp(apiType, data) {
  switch (apiType) {
    case "conversion_rate":
      return data.map((item) => ({
        key: item.source,
        value: item.events ? item.events : item.visitors,
      }));
    case "top_pages":
      return data.map((item) => ({ key: item.page, value: item.events }));
    case "top_countries":
      return data.map((item) => ({ key: item.country, value: item.visitors }));
    case "bounce_rate":
      return data.map((item) => ({
        key: item.country,
        value: item.bounce_rate,
      }));
    case "top_referrer":
      return data.map((item) => ({ key: item.source, value: item.events }));
    case "top_utms":
      return data.map((item) => ({
        key: item.utm_source,
        value: item.visitors,
      }));
    case "pageviews":
      return [{ key: "Page Views", value: data.pageviews.value }];
    case "visitors":
      return [{ key: "Visitors", value: data.visitors.value }];
    case "devices":
      return data.map((item) => ({ key: item.device, value: item.visitors }));
    default:
      break;
  }
}
export function buildAPIQuery(body) {
  const finalQuery = new URLSearchParams({
    site_id: config.SITE_ID,
    limit: config.DATA_LIMIT,
    ...body,
  });
  return finalQuery;
}

// take message => return requestedData, filte, period
// 1. Give me conversion rate for mint events in last 7 days
// 2. Give me top pages visited for purchased nfts in last month
// 3. I need total visitors in last month
// 4. How many people came from linkdin in last 7 days
// 5. What were the page views count for people visiting from twitter campaigns
export const parseUserMessage = (message) => {
  const query = getQueryPart(message);
  const filter = getFilterPart(message);
  const duration = getDurationPart(message);

  return { query, filter, duration };
};

export const getQueryPart = (message) => {
  const queryRegexes = {
    conversion_rate: /(conversion rate|conversions?)/i,
    top_pages: /((top)?\s?pages\s?(count)?)/i,
    top_countries: /((top)?\s?countries\s?(count)?)/i,
    bounce_rate: /bounce rate/i,
    top_referrer: /top referrers?/i,
    top_utms: /top utms/i,
    pageviews: /pageviews/i,
    visitors: /visitors/i,
    devices: /devices/i,
  };

  for (let pType in queryRegexes) {
    if (queryRegexes[pType].test(message)) return pType;
  }
};

export const getFilterPart = (message) => {
  const filterRegexes = {
    cross_website: /across website/i,
    buy_now_click: /(buy now click)|(click on buy now)/i,
    mint_click: /mint click/i,
    connect_wallet: /((connect wallet)|(wallets connected))/i,
    purchased: /(purchased|bought)/i,
    minted: /minted|mint/i,
  };

  for (let pType in filterRegexes) {
    if (filterRegexes[pType].test(message)) return pType;
  }
};

export const getDurationPart = (message) => {
  const durationRegexe =
    /(today|yesterday|this week|this month|last week|last month|last year|past \d+ days|between \w+day and \w+day)/i;

  const matches = message.match(durationRegexe);

  if (!matches) return null;

  const durationStr = matches[0];

  return parseDateDuration(durationStr);
};

export const parseDateDuration = (dateString) => {
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

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
};
export function stringifyObjectArray(arr) {
  let result = "";
  try {
    result = arr.map((obj) => JSON.stringify(obj)).join(", ");
  } catch (e) {
    // Handle the exception appropriately, e.g. by logging the error and returning an empty string
    console.error(e);
    result = "";
  }
  return result;
}

export function renderBreakdownResult(odata) {
  let data = { ...odata };
  return data.results
    .map((ro) => {
      let roKey = [...Object.entries(ro)[0]][1];
      let roVal = [...Object.entries(ro)[1]][1];

      return `${roKey} - ${roVal}`;
    })
    .join("\n");
}
export function renderAggregateResult(data) {
  const ro = Object.entries(data.results);
  return `${ro[0]} - ${ro[1].value}`;
}
