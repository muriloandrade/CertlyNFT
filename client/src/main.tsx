import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { ThemeProvider, createTheme } from '@mui/material';
import { LineaTestnet } from "@thirdweb-dev/chains";
import { Toaster } from "react-hot-toast";

import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8c9eff',
    },
    secondary: {
      main: '#c15f41',
    },
  },
});

// This is the chain your dApp will work on.
// Change this to the chain your app is built for.
// You can also import additional chains from `@thirdweb-dev/chains` and pass them directly.
const activeChain = "mumbai";
// const activeChain = LineaTestnet;

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Toaster
        position="top-right"
        reverseOrder={true}
        toastOptions={{ duration: 3000 }}
      />
      <ThirdwebProvider
        clientId={import.meta.env.VITE_THIRDWEB_CLIENT_ID}
        activeChain={activeChain}>
        <App />
      </ThirdwebProvider>
    </ThemeProvider>
  </React.StrictMode>
);
