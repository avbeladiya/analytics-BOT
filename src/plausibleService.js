import config from "./config";

export const getPlausibleData = async ({baseUrl, apiToken, siteId, queryParams, limit = 5}) => {
  const queryString = new URLSearchParams({
    site_id: siteId,
    limit,
    ...queryParams,
  });

  const urlPath = queryParams['apiType'] == 'aggregate' 
    ? config.API_FILTER_PATH['aggregate'] 
    : config.API_FILTER_PATH['breakdown'];
  const apiURL = `${baseUrl}${urlPath}?${queryString.toString()}`

  try {
    return await fetch(apiURL, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
      }
    }).then((response) => response.json())
  } catch (error) {
    console.log({ error });
    return null;
  }
}

export function renderBreakdownResult(odata) {
  let data = { ...odata };
  return data.results
    .map((ro) => {
      let roKey = [...Object.entries(ro)[0]][1];
      let roVal = [...Object.entries(ro)[1]][1];
      let roMetric = [...Object.entries(ro)[1]][0];

      // return `${roKey} - ${roVal} (${roMetric.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())})`;
      return `${roKey} - ${parseFloat(roVal).toLocaleString('en-US')}`;
    })
    .join("\n");
}
export function renderAggregateResult(odata) {
  let data = {...odata}
  const ro = Object.entries(data.results)[0];
  // return `${ro[0]} - ${ro[1].value}`;
  return `${parseFloat(ro[1].value).toLocaleString('en-US')}`;
}