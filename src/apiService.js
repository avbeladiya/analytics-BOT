import config from "./config";
const api = {
  get: function (url, headers = {}, data = "") {
    try {
      const opts = {
        headers: {
          ...headers,
          Authorization: `Bearer ${config.TOKEN}`,
        },
      };
      return new Promise(function (resolve, reject) {
        fetch(url, opts)
          .then((response) => response.json())
          .then(function (data) {
            resolve(data);
          })
          .catch((error) => {
            let err = {
              resError: error,
              message: "Server not responding!",
            };
            reject(err);
          });
      });
    } catch (error) {
      console.log({ error });
      return null;
    }
  },
};

export default api;

// requestedData;

// - aggregate
// - "Conversion Rate" => conversions => metric => breakdown
// - breakdown;
// - "Top Pages"
// - "Top Countries";
// Bounce Rate
// Top Referrer
// Top UTMs
// Pageviews
// Visitors
// Devices

// filter;
// period;
