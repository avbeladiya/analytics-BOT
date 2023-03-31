import { useState } from "preact/hooks";
// import preactLogo from "./assets/preact.svg";
// import viteLogo from "/vite.svg";
import "./app.css";
import MY_BOT from "./BOT";

export function App() {
  const [showBOT, setShowBOT] = useState(false);
  return (
    <>
      <div style={{margin: "10px"}}>
        {showBOT ? (
          <div
            style={{
              position: "absolute",
              right: "50px",
              bottom: "150px",
            }}
          >
            <MY_BOT setShowBOT={setShowBOT} showBOT={showBOT} />
          </div>
        ) : null}
        <div class="action">
          <div class="font-bold absolute bottom-10 left-10 action-container">
            <button
              style={{color: "#fff"}}
              id="widget-toggle-button"
              onClick={() => setShowBOT(!showBOT)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
