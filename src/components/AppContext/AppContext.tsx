import { createContext } from "react";

interface GlobalState {
    openSidebar: boolean;
    setOpenSidebar: any;
}

const initialState: GlobalState = {
    openSidebar: false,
    setOpenSidebar: () => {},
};

export const AppContext = createContext(initialState);
