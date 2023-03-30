import { Configuration, OpenAIApi } from "openai";

export const parseUserStringService = async (openai_api_key, userMessage) => {
  try {
    const configuration = new Configuration({
      apiKey: openai_api_key,
    });
    const openai = new OpenAIApi(configuration);

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `There is a stats api with 3 parameters:\n\n1 Metric which specify which data to fetch\n2 Properties which is used to filter rows for Metric\n3 Duration to pick rows within timeframe\n\n# Metric Parametes:\nvisitors-The number of unique visitors.\nvisits-The number of visits/sessions\npageviews-The number of pageview events\nviews_per_visit-The number of pageviews divided by the number of visits.\nbounce_rate-Bounce rate percentage\nvisit_duration-Visit duration in seconds\nevents-The number of events (pageviews + custom events)\n\n## Available Event Types\nBuy Now Click-clicks on buy now button\nMint Click-clicks on mint button\nConnect Wallet-connects any ethereum wallet\nPurchased-Buy now click followed by nft purchase\nMinted-Mint now click followed by nft mints\n\nIf Event is request, the metric should events along with other key in csv value\n\nIn properties the following are the parameters available:\nevent:name-Name of the event triggered.\nevent:page-Pathname of the page where the event is triggered\nvisit:utm_medium-Raw value of the utm_medium query param on the entry page.\nvisit:utm_source-Raw value of the utm_source query param on the entry page.\nvisit:utm_campaign-Raw value of the utm_campaign query param on the entry page.\nvisit:browser-Browsers like Chrome, safari\nvisit:os-Os like Mac, Windows, iOS and Android.\nvisit:country-ISO 3166-1 alpha-2 code of the visitor country.\n\nApi Types\nType 1: Aggregate api to give aggregated data as a single value\nType 2: Breakdown api which will give list of grouped rows by some filter params\n\nIf its Aggregate api, properties with values are used to filter data\nIf its breakdown api, only one most significant property key is used\n\nExample 1: \nUser Message: What were the visitors count in last month\nParesd User Message:\n    Api Type: Aggregate\n    Metric: visitors\n    Property: -\n    Duration: 2023-02-01 to 2023-01-01\n\nExample 2: \nUser Message: how many distinct people visited from facebook utm source in this week\nParesd User Message:\n    Api Type: Aggregate\n    Metric: visitors\n    Property: visit:source=facebook\n    Duration: 2023-03-26 to 2023-04-01\n\nExample 3: \nUser Message: Monthly traffic from Google in last 6 months\nParesd User Message:\n    Api Type: Breakdown\n    Metric: visitors\n    Property: visit:source=google\n    Duration: 2022-10-01 to 2023-03-01\n\nQuestion:\nUser Message: ${userMessage}\n`,
      temperature: 0.7,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    if (response.status !== 200) return null;

    const str = response?.data?.choices[0].text;

    if (!str) return null;

    const parsedMessage = Object.fromEntries(
      str
        .trim()
        .split("\n")
        .slice(1)
        .map((s) => s.trim().split(": "))
    );

    const apiType = parsedMessage["Api Type"].toLowerCase();

    const reqBody = {
      apiType,
    };

    if (apiType == "aggregate") {
      reqBody["metric"] = parsedMessage["Metric"].toLowerCase();
      reqBody["filters"] = parsedMessage["Property"].trim().split(", ");
      reqBody["duration"] = parsedMessage["Duration"].replace(" to ", ",");
    } else if (apiType == "breakdown") {
      reqBody["metric"] = parsedMessage["Metric"].toLowerCase();
      reqBody["property"] = parsedMessage["Property"].toLowerCase();
      reqBody["duration"] = parsedMessage["Duration"].replace(" to ", ",");
    }

    return reqBody;
  } catch (error) {
    throw new Error(
      "Openai Serivce Error. Either key is invalid or something is not working"
    );
  }
};

// parseUserStringService('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', 'how many people clicked on buy now button from US Country in this week with flolio utm source').then(console.log)
// parseUserStringService('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', 'List top pages based on visitor count in last 7 days').then(console.log)
