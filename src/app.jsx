import { useState } from "preact/hooks";
import preactLogo from "./assets/preact.svg";
import viteLogo from "/vite.svg";
import "./app.css";
import MY_BOT from "./BOT";

export function App() {
  return (
    <>
      <h1>Hello</h1>
      <MY_BOT />
    </>
  );
}
