// src/Lojinha/AdminContext/AdminContext.js
import { createContext } from "react";

export const AdminContext = createContext({
  selectedSection: "Home",
  setSelectedSection: () => {},
});
