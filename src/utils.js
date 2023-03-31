import config from "./config";
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
  // console.log("🚀 ~ file: utils.js:26 ~ renderBreakdownResult ~ data:", data)
  return data.results
    .map((ro) => {
      // console.log("🚀 ~ file: utils.js:29 ~ .map ~ ro:", ro)
      let roKey = [...Object.entries(ro)[0]][1];
      let roVal = [...Object.entries(ro)[1]][1];
      let roMetric = [...Object.entries(ro)[1]][0];

      return `${roKey} - ${roVal} (${roMetric.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())})`;
    })
    .join("\n");
}
export function renderAggregateResult(odata) {
  let data = {...odata}
  // console.log("🚀 ~ file: utils.js:210 ~ renderAggregateResult ~ data:", data)
  const ro = Object.entries(data.results)[0];
  // console.log("🚀 ~ file: utils.js:40 ~ renderAggregateResult ~ ro:", ro)
  return `${ro[0]} - ${ro[1].value}`;
}
