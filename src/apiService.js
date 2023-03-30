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
