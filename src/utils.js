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
export function renderAggregateResult(odata) {
  let data = {...odata}
  console.log("🚀 ~ file: utils.js:210 ~ renderAggregateResult ~ data:", data)
  const ro = Object.entries(data.results);
  console.log("🚀 ~ file: utils.js:212 ~ renderAggregateResult ~ ro:", ro)
  return `${ro[0]} - ${ro[1].value}`;
}
