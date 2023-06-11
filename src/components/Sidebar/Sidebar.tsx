import React, { useContext, useState, useRef, useEffect } from "react";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import { Box, Tooltip } from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import { AppContext } from "../AppContext/AppContext";
import options, { SidebarTypes } from "../SidebarData/SidebarData";
import styles from "../Sidebar/styles.module.scss";
import { NavLink, redirect } from "react-router-dom";
import MobileSidebar from "../MobileSidebar/MobileSidebar";
import ModeChanger from "../ModeChanger/ModeChanger";

const drawerWidth: number = 200;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up("sm")]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const CollapseDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
    }),
    ...(!open && {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
    }),
}));

export default function Sidebar() {
    const theme = useTheme();
    const { openSidebar } = useContext(AppContext);
    const [luanchpadDropdown, setLuanchpadDropdown] = useState<boolean>(true);
    const [iconLaunchpad, setIconLaunchpad] = useState<boolean>(true);

    function handleClick(option: SidebarTypes) {
        if (option.label === "Launchpads" && openSidebar) {
            setLuanchpadDropdown(!luanchpadDropdown);
            setIconLaunchpad(!iconLaunchpad);
            const dropdown = document.querySelector(".launchpad-dropdown");
            if (dropdown) {
                dropdown.classList.toggle("closed");
            }
        }
    }

    return (
        <>
            <Box className="sidebar">
                <Box sx={{ display: "flex" }} className="collapseSidebar">
                    <CollapseDrawer sx={{ height: "100vh", position: "relative", display: { xs: "none", lg: "block" } }} variant="permanent" open={openSidebar}>
                        <Box>
                            {options &&
                                options.map((option) => (
                                    <Box key={option.id} sx={{ cursor: "pointer" }}>
                                        <Box className={option.label === "Launchpads" ? "launchHover" : ""}>
                                            <Box>
                                                {options &&
                                                    options.map((option) => (
                                                        <Box>
                                                            {option.label === "Launchpads" && !openSidebar ? (
                                                                <Box className="tooltipBox">
                                                                    {option.children &&
                                                                        option.children.map((subOptions) => {
                                                                            return (
                                                                                <NavLink to={subOptions.path as string} style={{ textDecoration: "none" }} key={subOptions.id}>
                                                                                    <div className="sidebarActiveBg">
                                                                                        <p className="tooltipText">{subOptions.label}</p>
                                                                                    </div>
                                                                                </NavLink>
                                                                            );
                                                                        })}
                                                                </Box>
                                                            ) : (
                                                                ""
                                                            )}
                                                        </Box>
                                                    ))}
                                            </Box>
                                            {!openSidebar ? (
                                                <NavLink
                                                    onClick={(e) => {
                                                        if (option.label === "Launchpads") {
                                                            e.preventDefault();
                                                        } else {
                                                            handleClick(option);
                                                        }
                                                    }}
                                                    to={option.path as string}
                                                    style={{ textDecoration: "none" }}
                                                    key={option.id}
                                                    target={option.path && option.path.startsWith("http") ? "_blank" : "_self"}
                                                >
                                                    <Tooltip
                                                        title={
                                                            option.label === "Launchpads" ? (
                                                                ""
                                                            ) : (
                                                                <a href={option.path} target="_blank">
                                                                    {option.label}
                                                                </a>
                                                            )
                                                        }
                                                        placement="right"
                                                        arrow
                                                    >
                                                        <Box className="sidebarActiveBg" style={{ padding: "16px 0 16px 19px" }}>
                                                            <div style={{ width: openSidebar ? "20px" : "20px", height: openSidebar ? "20px" : "20px", display: "flex", alignItems: "center" }} onClick={() => handleClick(option)}>
                                                                <span>{option.image}</span>
                                                                <span className={styles.sidebarLabel} style={{ opacity: openSidebar ? 1 : 0 }}>
                                                                    {option.label}
                                                                </span>
                                                                <span className="dropdown-icon" style={{ opacity: openSidebar ? 1 : 0 }}>
                                                                    {iconLaunchpad ? option.iconOpened : option.iconClosed}
                                                                </span>
                                                            </div>
                                                        </Box>
                                                    </Tooltip>
                                                </NavLink>
                                            ) : (
                                                <NavLink
                                                    onClick={(e) => {
                                                        if (option.label === "Launchpads") {
                                                            e.preventDefault();
                                                        } else {
                                                            handleClick(option);
                                                        }
                                                    }}
                                                    to={option.path as string}
                                                    target={option.path && option.path.startsWith("http") ? "_blank" : "_self"}
                                                    style={{ textDecoration: "none" }}
                                                    key={option.id}
                                                >
                                                    <Box className="sidebarActiveBg" style={{ padding: "16px 0 16px 19px" }}>
                                                        <div style={{ width: openSidebar ? "20px" : "20px", height: openSidebar ? "20px" : "20px", display: "flex", alignItems: "center" }} onClick={() => handleClick(option)}>
                                                            <span>{option.image}</span>
                                                            <span className={styles.sidebarLabel} style={{ opacity: openSidebar ? 1 : 0 }}>
                                                                {option.label}
                                                            </span>
                                                            <span className="dropdown-icon" style={{ opacity: openSidebar ? 1 : 0 }}>
                                                                {iconLaunchpad ? option.iconOpened : option.iconClosed}
                                                            </span>
                                                        </div>
                                                    </Box>
                                                </NavLink>
                                            )}
                                        </Box>
                                        {option.label === "Launchpads" && luanchpadDropdown && openSidebar ? (
                                            <div className="launchpad-dropdown">
                                                {option.children &&
                                                    option.children.map((subOptions) => {
                                                        return (
                                                            <NavLink to={subOptions.path as string} style={{ textDecoration: "none" }} key={subOptions.id}>
                                                                <div>
                                                                    <p className="subOptionSidebar" style={{ opacity: openSidebar ? 1 : 0 }}>
                                                                        {subOptions.label}
                                                                    </p>
                                                                </div>
                                                            </NavLink>
                                                        );
                                                    })}
                                            </div>
                                        ) : null}
                                    </Box>
                                ))}
                        </Box>
                        <Box className={openSidebar ? "themeChanger" : "themeChangerCollpase"}>
                            <ModeChanger />
                        </Box>
                    </CollapseDrawer>
                </Box>
                <Box>
                    <MobileSidebar luanchpadDropdown={luanchpadDropdown} iconLaunchpad={iconLaunchpad} setLuanchpadDropdown={setLuanchpadDropdown} setIconLaunchpad={setIconLaunchpad} />
                </Box>
            </Box>
        </>
    );
}
