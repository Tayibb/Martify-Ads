import React, { useState, useMemo } from "react";
import { AppContext } from "./components/AppContext/AppContext";
import MainPage from "./pages/MainPage/MainPage";
import HomePage from "./pages/HomePage/HomePage";
import LaunchPad from "./pages/Launchpad/LaunchPad";
import CreateToken from "./components/CreateToken/CreateToken";
import Airdrop from "./components/Gumdrop/Gumdrop";
import CliamList from "./components/ClaimList/CliamList";
import Loader from "./components/Loader/Loader";
import LaunchpadList from "./components/LaunchpadList/LaunchpadList";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import useDarkMode from "use-dark-mode";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { clusterApiUrl } from "@solana/web3.js";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import "../src/index.scss";

require("@solana/wallet-adapter-react-ui/styles.css");
const App = () => {
    const network: any = "devnet";
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network })], [network]);
    const [openSidebar, setOpenSidebar] = useState(false);
    const { value }: any = useDarkMode();
    const sidebarValue = {
        openSidebar,
        setOpenSidebar,
    };
    const theme = createTheme({
        breakpoints: {
            values: {
                xs: 0,
                sm: 576,
                md: 768,
                lg: 992,
                xl: 1200,
            },
        },
    });
    return (
        <ThemeProvider theme={theme}>
            <ConnectionProvider endpoint={endpoint}>
                <WalletProvider
                    // @ts-ignore
                    wallets={wallets}
                    autoConnect
                >
                    <WalletModalProvider>
                        <div className={value ? "dark-theme" : "light-theme"}>
                            <AppContext.Provider value={sidebarValue}>
                                <BrowserRouter>
                                    <Routes>
                                        <Route path="/" element={<MainPage />}>
                                            <Route index element={<HomePage />} />
                                            <Route path="createToken" element={<CreateToken />} />
                                            <Route path="/Launchpad">
                                                <Route index path="CreateLunchpad" element={<LaunchPad />} />
                                                <Route path="Launchpadlist" element={<LaunchpadList />} />
                                                <Route path="loader" element={<Loader />} />
                                            </Route>
                                            <Route path="gumdrop" element={<Airdrop />} />
                                            <Route path="claimlist" element={<CliamList />} />
                                        </Route>
                                    </Routes>
                                </BrowserRouter>
                            </AppContext.Provider>
                        </div>
                    </WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        </ThemeProvider>
    );
};

export default App;
