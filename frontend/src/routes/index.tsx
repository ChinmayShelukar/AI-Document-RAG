import { Typography } from "@mui/material";
import { Route, Routes } from "react-router-dom";
import { ChatBot, Login, Register } from "../pages";
import { PrivateAppLayout } from "./layouts/PrivateLayout";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Typography color="red">404</Typography>} />

      <Route element={<PrivateAppLayout />}>
        <Route path="/chat" element={<ChatBot />} />
      </Route>
    </Routes>
  );
};
