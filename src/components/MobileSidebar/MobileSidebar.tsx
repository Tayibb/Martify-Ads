import React, { useContext } from "react";
import { AppContext } from "../AppContext/AppContext";
import { Box, Drawer } from "@mui/material";
import options, { SidebarTypes } from "../SidebarData/SidebarData";
import { NavLink } from "react-router-dom";
import ModeChanger from "../ModeChanger/ModeChanger";
import styles from "../MobileSidebar/styles.module.scss";

interface StateType {
    luanchpadDropdown?: boolean;
    iconLaunchpad?: boolean;
    setLuanchpadDropdown?: any;
    setIconLaunchpad?: any;
}
const MobileSidebar = (props: StateType) => {
    const { luanchpadDropdown, iconLaunchpad, setLuanchpadDropdown, setIconLaunchpad } = props;
    const { openSidebar, setOpenSidebar } = useContext(AppContext);
    function handleClick(option: SidebarTypes, event: React.MouseEvent<HTMLAnchorElement>) {
        if (option.label === "Launchpads") {
            setLuanchpadDropdown(!luanchpadDropdown);
            setIconLaunchpad(!iconLaunchpad);
            setOpenSidebar(true);
            event.preventDefault();
        } else if (option.label !== "Launchpads") {
            setOpenSidebar(false);
        }
    }
    return (
        <Box sx={{ overFlow: "auto" }}>
            <Drawer sx={{ display: { xs: "block", lg: "none" } }} open={openSidebar} anchor="left" onClose={() => setOpenSidebar(false)}>
                <Box>
                    {options &&
                        options.map((option) => (
                            <Box key={option.id} sx={{ cursor: "pointer" }} className={styles.sidebarMobileContent}>
                                <NavLink to={option.path as string} style={{ textDecoration: "none" }} onClick={(event) => handleClick(option, event)} key={option.id}>
                                    <div style={{ margin: "10px 0 10px 17px", display: "flex", alignItems: "center" }}>
                                        <span className={styles.sidebarIconsMobile}>{option.image}</span>
                                        <span>{option.label}</span>
                                        <span>{iconLaunchpad ? option.iconOpened : option.iconClosed}</span>
                                    </div>
                                </NavLink>
                                {option.label === "Launchpads" && luanchpadDropdown ? (
                                    <div>
                                        {option.children &&
                                            option.children.map((subOptions) => {
                                                return (
                                                    <NavLink to={subOptions.path as string} style={{ textDecoration: "none" }} onClick={() => setOpenSidebar(false)} key={subOptions.id}>
                                                        <p className={styles.subOptionSidebar}>{subOptions.label}</p>
                                                    </NavLink>
                                                );
                                            })}
                                    </div>
                                ) : null}
                            </Box>
                        ))}
                </Box>
                <Box className="themeChanger">
                    <ModeChanger />
                </Box>
            </Drawer>
        </Box>
    );
};

export default MobileSidebar;
