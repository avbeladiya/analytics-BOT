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
import { buildAPIQuery, formatResp, parseUserMessage } from "./utils";
import api from "./apiService";

const MY_BOT = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [messageStack, setMessageStack] = useState([
    {
      message: "Hello my friend",
      sentTime: new Date().toString(),
      sender: "Flolio",
      position: "single",
      direction: "incoming",
    },
  ]);

  async function parseUserMessageFromInput(userMessage, msgStack) {
    try {
      const extractedParams = await parseUserMessage(userMessage);
      // console.log({ extractedParams });
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
        showSuggestionMsg(null, msgStack);
        return;
      }

      const urlPath = extractedParams?.query
        ? config.API_FILTER_PATH[
            config.QUERY_PARAMS[extractedParams?.query].apiType
          ]
        : null;

      const res = await getAPIData(urlPath, body);
      if (!res.results) {
        showSuggestionMsg(null, msgStack);
        return;
      }

      const formateResp = formatResp(extractedParams.query, res.results);
      console.log({ formateResp });
      setMessageStack([
        ...msgStack,
        {
          message: formateResp,
          sender: "Flolio",
          sentTime: new Date().toString(),
          direction: "incoming",
          position: "single",
          showInHTML: true,
        },
      ]);
      setShowTypingIndicator(false);
    } catch (error) {
      showSuggestionMsg(
        "Hello! If you're looking for event analytics stats, I can help. Just provide the details in the following format: `Give me [metric] for [event] in the last [time period].` For example, you can ask `Give me the conversion rate for mint events in the last 7 days.`",
        msgStack
      );
      setShowTypingIndicator(false);
    }
  }

  async function getAPIData(urlPath, body) {
    const queryString = buildAPIQuery(body);
    const eventURL = `${config.BASE_URL}${urlPath}?${queryString.toString()}`;
    const res = await api.get(eventURL);
    return res;
  }

  function showSuggestionMsg(msg, msgStack) {
    setShowTypingIndicator(false);
    setMessageStack([
      ...msgStack,
      {
        message: msg
          ? msg
          : "I did not understand your request.To get stats please write your message in this format.\n Give me conversion rate for mint events in last 7 days",
        sentTime: new Date().toString(),
        sender: "Flolio",
      },
    ]);
  }

  return (
    <div style={{ position: "relative", height: "500px", width: "400px" }}>
      <MainContainer>
        <ChatContainer>
          <MessageList>
            {messageStack.map((item) => {
              if (item.showInHTML) {
                let res = item?.message
                  ?.map((msg) => `${msg.key} - ${msg.value}`)
                  .join("\n");

                let msg = res;
                return (
                  <Message model={{ ...item }}>
                    <Message.HtmlContent model={{ ...item }} html={msg} />
                  </Message>
                );
              } else return <Message model={{ ...item }} />;
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
              const msgStack = [
                ...messageStack,
                {
                  message: val,
                  sentTime: new Date().toString(),
                  direction: "outgoing",
                  position: "single",
                  sender: "User",
                },
              ];
              setMessageStack(msgStack);
              setTimeout(() => {
                parseUserMessageFromInput(val, msgStack);
              }, 2000);

              setInputMessage("");
            }}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};
export default MY_BOT;
