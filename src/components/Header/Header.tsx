import React, { useContext } from "react";
import styles from "./styles.module.scss";
import { Typography, Box } from "@mui/material";
import { ReactComponent as ToggleIcon1 } from "../../assets/images/toggleIcon1.svg";
import { ReactComponent as ToggleIcon2 } from "../../assets/images/toggleIcon2.svg";
import ETH from "../../assets/images/eth.png";
import { ReactComponent as Dexview } from "../../assets/images/dexview.svg";
import { AppContext } from "../AppContext/AppContext";
import useDarkMode from "use-dark-mode";
import { WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Link } from "react-router-dom";
const Header = () => {
    const { openSidebar, setOpenSidebar } = useContext(AppContext);
    const { value }: any = useDarkMode();
    return (
        <Box className={styles.header} sx={{ background: value ? "#242525" : "#fff" }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    marginLeft: "15px",
                    cursor: "pointer",
                }}
            >
                <Box sx={{ width: "25px", height: "25px" }} onClick={() => setOpenSidebar(!openSidebar)}>
                    {openSidebar ? <ToggleIcon1 /> : <ToggleIcon2 />}
                </Box>
                <Link to='/' style={{display:'flex', alignItems:'center',textDecoration:'none'}}>
                <Box sx={{ width: "35px", height: "35px", marginLeft: "8px" }}>
                    <img src="https://www.pinksale.finance/static/media/pinkswap.a95de4f3.png" onClick={() => setOpenSidebar(!openSidebar)} alt="" />
                </Box>
                
                <Typography variant="h1">Martify</Typography>
                </Link>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: "15px",
                    cursor: "pointer",
                    marginRight: "20px",
                }}
            >
                {/* <Box className={styles.headerBtn} sx={{ background: value ? "#1e2122" : "#f3f3f4" }}>
                    <Box sx={{ width: "20px", height: "20px" }}>
                        <Dexview />
                    </Box>
                    <Typography variant="h2">dexview.com</Typography>
                </Box>
                <Box className={styles.headerBtn} sx={{ background: value ? "#1e2122" : "#f3f3f4" }}>
                    <Box sx={{ width: "24px", height: "24px" }}>
                        <img src={ETH} alt="" />
                    </Box>
                    <Typography variant="h2">dexview.com</Typography>
                </Box> */}
                <WalletMultiButton className="headerBtn" style={{ background: value ? "#1e2122" : "#f3f3f4", color: value ? "#c9c8c5" : "#222" }} /> &nbsp;
                <WalletDisconnectButton className="headerBtn" style={{ background: value ? "#1e2122" : "#f3f3f4", color: value ? "#c9c8c5" : "#222" }} />
            </Box>
        </Box>
    );
};

export default Header;
