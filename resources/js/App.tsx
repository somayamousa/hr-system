import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRouter from "./AppRouter";
import "../css/app.css";

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

createRoot(document.getElementById("app")!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter basename="/hr-system/public">
                <AppRouter />
            </BrowserRouter>
        </QueryClientProvider>
    </React.StrictMode>
);
