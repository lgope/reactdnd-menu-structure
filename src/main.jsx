import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";

createRoot(document.getElementById("I-am-groot")).render(
  <DndProvider backend={HTML5Backend}>
    <App />
  </DndProvider>
);
