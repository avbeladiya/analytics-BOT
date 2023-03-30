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
import {
  buildAPIQuery,
  renderBreakdownResult,
  renderAggregateResult,
} from "./utils";
import api from "./apiService";
import { parseUserStringService } from "./openaiService";
import { parseUserStringFromRegexService } from "./regexMatcherService";

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
    // const extractedParams = await parseUserMessage(userMessage);

    const extractedBody = await parseUserStringFromRegexService(
      userMessage
    );
    console.log("🚀 ~ file: BOT.js:40 ~ parseUserMessageFromInput ~ extractedBody:", extractedBody)

    let body =
      extractedBody.apiType === "aggregate"
        ? {
            duration: extractedBody.duration,
            filters: extractedBody.filters,
            metric: extractedBody.metric,
          }
        : {
            duration: extractedBody.duration,
            metric: extractedBody.metric,
            property: extractedBody.property,
            filters: extractedBody.filters,
          };

    if (!Object.keys(body).length) {
      showSuggestionMsg(null, msgStack);
      return;
    }

    const urlPath = config.API_FILTER_PATH[extractedBody.apiType];

    const res = await getAPIData(urlPath, body);
    if (!res.results) {
      showSuggestionMsg(null, msgStack);
      return;
    }

    const formateResp =
      extractedBody.apiType === "breakdown"
        ? renderBreakdownResult(res)
        : renderAggregateResult(res);

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
                return (
                  <Message model={{ ...item }}>
                    <Message.HtmlContent
                      model={{ ...item }}
                      html={item?.message}
                    />
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
              console.log({ val });
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
