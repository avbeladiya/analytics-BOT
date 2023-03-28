import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import { useState } from "preact/hooks";
import config from "./config";
import { buildAPIQuery, parseUserMessage, stringifyObjectArray } from "./utils";
import api from "./apiService";

const MY_BOT = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [messageStack, setMessageStack] = useState([
    {
      message: "Hello my friend",
      sentTime: new Date().toString(),
      sender: "Flolio",
    },
  ]);

  async function parseUserMessageFromInput(userMessage) {
    // getFilterData from userMessage
    // create body
    const extractedParams = await parseUserMessage(userMessage);
    console.log({ extractedParams });
    let body = {};
    if (extractedParams.query) {
      body = {
        ...config.QUERY_PARAMS[extractedParams.query].body,
      };
    }

    if (extractedParams.duration) {
      body = {
        ...body,
        period: "custom",
        date: `${extractedParams.duration.startDate},${extractedParams.duration.endDate}`,
      };
    } else {
      body = { ...body, period: "6mo" };
    }

    if (extractedParams.filter) {
      const filterEvent = config.EVENTS[extractedParams.filter];
      body = {
        ...body,
        metrics: body.metrics ? body.metrics + ",events" : "events",
        "event:name": filterEvent,
      };
    }

    if (!Object.keys(body).length) {
      showSuggestionMsg();
      return;
    }

    const urlPath =
      config.API_FILTER_PATH[
        config.QUERY_PARAMS[extractedParams.query].apiType
      ];
    const res = await getAPIData(urlPath, body);

    setMessageStack([
      ...messageStack,
      {
        message: stringifyObjectArray(res.results),
        sender: "Flolio",
        sentTime: new Date().toString(),
      },
    ]);
    setShowTypingIndicator(false);

    if (!res) {
      showSuggestionMsg();
      return;
    }
    // render message
  }

  async function getAPIData(urlPath, body) {
    const queryString = buildAPIQuery(body);
    const eventURL = `${config.BASE_URL}${urlPath}?${queryString.toString()}`;
    const res = await api.get(eventURL);
    return res;
  }

  function showSuggestionMsg() {
    setShowTypingIndicator(false);
    setMessageStack([
      ...messageStack,
      {
        message:
          "I did not understand your request.To get stats please write your message in this format.\n Give me conversion rate for mint events in last 7 days",
        sentTime: new Date().toString(),
        sender: "Flolio",
      },
    ]);
  }

  return (
    <div style={{ position: "relative", height: "500px" }}>
      <MainContainer>
        <ChatContainer>
          <MessageList>
            {messageStack.map((item) => {
              return <Message model={{ ...item }} />;
            })}
            {showTypingIndicator ? <TypingIndicator /> : null}
          </MessageList>

          <MessageInput
            placeholder="Type message here"
            value={inputMessage}
            attachButton={null}
            onChange={(msg) => {
              setInputMessage(msg);
            }}
            onSend={(val) => {
              setShowTypingIndicator(true);
              setMessageStack([
                ...messageStack,
                {
                  message: val,
                  sentTime: new Date().toString(),
                  sender: "User",
                },
              ]);
              parseUserMessageFromInput(val);
              setInputMessage("");
            }}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};
export default MY_BOT;
