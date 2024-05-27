import React from 'react';
import ReactDOM from 'react-dom/client';
import router from "./routing.tsx";
import { RouterProvider } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@/style/index.css";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router} />
)
