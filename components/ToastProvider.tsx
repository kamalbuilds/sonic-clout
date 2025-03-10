"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: "rgba(0, 0, 0, 0.9)",
          color: "#4ade80",
          border: "1px solid #0d9488",
          backdropFilter: "blur(10px)",
          fontFamily: "monospace",
        },
        success: {
          iconTheme: {
            primary: "#4ade80",
            secondary: "black",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "black",
          },
          style: {
            color: "#ef4444",
            border: "1px solid #ef4444",
          },
        },
      }}
    />
  );
}