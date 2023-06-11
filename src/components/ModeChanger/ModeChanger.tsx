import React from "react";
import useDarkMode from "use-dark-mode";
import { ReactComponent as Sun } from "../../assets/images/sun.svg";
import { ReactComponent as Diff } from "../../assets/images/diff.svg";
import { ReactComponent as Moon } from "../../assets/images/moon.svg";

interface IDarkMode {
    value: boolean;
    enable: () => void;
    disable: () => void;
    toggle: () => void;
}
const ModeChanger = () => {
    const [isMounted, setIsMounted] = React.useState(false);
    const darkMode: IDarkMode = useDarkMode(false);
    React.useEffect(() => {
        setIsMounted(true);
    }, []);
    React.useEffect(() => {
        if (isMounted) {
            const isDarkModeEnabled = JSON.parse(localStorage.getItem("darkMode") || "false");
            if (isDarkModeEnabled) {
                darkMode.enable();
            } else {
                darkMode.disable();
            }
        }
    }, [isMounted, darkMode]);

    return (
        <div className="dark-mode-toggle">
            <div style={{ display: "flex", marginRight: "5px" }}>
                <button
                    className="themeSunBtn"
                    onClick={() => {
                        localStorage.setItem("darkMode", "false");
                        darkMode.disable();
                    }}
                >
                    <Sun />
                </button>
                <Diff className="themeDiff" />
                <button
                    className="themeMoonBtn"
                    onClick={() => {
                        localStorage.setItem("darkMode", "true");
                        darkMode.enable();
                    }}
                >
                    <Moon />
                </button>
            </div>
        </div>
    );
};

export default ModeChanger;
