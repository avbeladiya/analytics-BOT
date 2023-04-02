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
import { getPlausibleData, renderAggregateResult, renderBreakdownResult } from "./plausibleService"
import { parseUserMessageWithRegex } from "./userMessageRegexParserService";

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
    const parsedMessage = await parseUserMessageWithRegex(
      userMessage
    );

    if (!Object.keys(parsedMessage).length) {
      showSuggestionMsg(null, msgStack);
      return;
    }

    const res = await getPlausibleData({
      baseUrl: config.BASE_URL,
      apiToken: config.TOKEN,
      siteId: config.SITE_ID,
      queryParams: parsedMessage,
      limit: config.DATA_LIMIT
    });
    if (!res.results) {
      showSuggestionMsg(null, msgStack);
      return;
    }

    const formateResp =
      parsedMessage.apiType === "breakdown"
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
          : `I'm sorry, I couldn't understand your query. Please try rephrasing your question or providing more context. Here are some examples of the kinds of questions you can ask me: \n - Give me visitor count from facebook in last week`,
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
