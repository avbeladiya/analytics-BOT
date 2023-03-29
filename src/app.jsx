import { useState } from "preact/hooks";
// import preactLogo from "./assets/preact.svg";
// import viteLogo from "/vite.svg";
import "./app.css";
import MY_BOT from "./BOT";

export function App() {
  const [showBOT, setShowBOT] = useState(false);
  return (
    <>
      <div>
        {showBOT ? (
          <div
            style={{
              position: "absolute",
              right: "50px",
              bottom: "150px",
            }}
          >
            <button
              style={{
                alignSelf: "end",
                position: "absolute",
                top: "-50px",
                right: "0px",
              }}
              id="widget-toggle-button"
              onClick={() => setShowBOT(!showBOT)}
            >
              X
            </button>
            <MY_BOT setShowBOT={setShowBOT} showBOT={showBOT} />
          </div>
        ) : null}
        <div class="action">
          <div class="font-bold absolute bottom-10 left-10">
            <button
              id="widget-toggle-button"
              onClick={() => setShowBOT(!showBOT)}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
