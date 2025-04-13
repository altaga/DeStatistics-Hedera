"use client";
import { ContextProvider } from "@/utils/contextModule";
import { ThemeProvider } from "@emotion/react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { createTheme } from "@mui/material";
import { lightBlue, lightGreen } from "@mui/material/colors";
import { PrivyProvider } from "@privy-io/react-auth";
import { hedera } from "viem/chains";
import { ToastContainer } from "react-toastify";

const theme = createTheme({
  palette: {
    myButton: {
      dark: lightGreen[150],
      main: lightBlue[100],
      light: lightBlue[50],
    },
    executeButton: {
      main: lightBlue[300],
    },
  },
});

export default function Providers({ children }) {
  return (
    <ContextProvider>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
        clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID}
        config={{
          defaultChain: hedera,
          supportedChains: [hedera],
          appearance: {
            theme: "dark",
          },
          embeddedWallets: {
            createOnLogin: "all-users",
          },
        }}
      >
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </PrivyProvider>
      <ToastContainer position="bottom-center" autoClose={1000} theme="dark"  />
    </ContextProvider>
  );
}
