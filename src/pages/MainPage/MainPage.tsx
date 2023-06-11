import { useContext } from "react";
import { Box } from "@mui/material";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import { AppContext } from "../../components/AppContext/AppContext";

const MainPage = (): any  => {
    const { openSidebar } = useContext(AppContext);
    return (
        <div>
            <Header />
            <Box sx={{ display: "flex" }}>
                <Sidebar />
                <Box sx={{ width: "100%" }} className={openSidebar ? "pushSideBar" : "notPushSideBar"}>
                    <Outlet />
                </Box>
            </Box>
        </div>
    );
};

export default MainPage;
