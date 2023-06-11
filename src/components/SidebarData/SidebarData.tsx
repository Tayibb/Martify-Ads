
import { ReactComponent as Home } from "../../assets/images/home.svg";
import { ReactComponent as Launch } from "../../assets/images/launch.svg";
import { ReactComponent as Token } from "../../assets/images/token.svg";
import { ReactComponent as Balloon } from "../../assets/images/air.svg";
import { ReactComponent as List } from "../../assets/images/list.svg";
import { ReactComponent as Up } from "../../assets/images/up.svg";
import { ReactComponent as Down } from "../../assets/images/down.svg";
import { ReactComponent as Doc } from "../../assets/images/docs.svg";
import { ReactComponent as Telegram } from "../../assets/images/telegram.svg";
import { ReactComponent as Twitter } from "../../assets/images/twitter.svg";
import { ReactComponent as Fb } from "../../assets/images/fb.svg";

export interface SidebarTypes {
    id: number;
    image: any;
    label: string;
    path?: string;
    iconOpened?: any;
    iconClosed?: any;
    children?: ChildLocation[];
}

export interface ChildLocation {
    id: number;
    value: string;
    label: string;
    path?: string;
}

const options: SidebarTypes[] = [
    {
        id: 1,
        image: <Home />,
        label: "Home",
        path: "/",
    },
    {
        id: 2,
        image: <Token />,
        label: "Create Token",
        path: "/createToken",
    },
    {
        id: 3,
        image: <Launch />,
        label: "Launchpads",
        iconOpened: <Up />,
        iconClosed: <Down />,
        path: "/Launchpad",
        children: [
            { id: 0, value: "Create Lunchpad", label: "Create Lunchpad", path: "/Launchpad/CreateLunchpad" },
            { id: 1, value: "Launchpad List", label: "Launchpad List", path: "/Launchpad/Launchpadlist" },
        ],
    },
    {
        id: 4,
        image: <Balloon />,
        label: "Gumdrop",
        path: "/gumdrop",
    },
    {
        id: 6,
        image: <List />,
        label: "Claim List",
        path: "/claimlist",
    },
    {
        id: 7,
        image: <Doc />,
        label: "Docs",
        path: "https://medium.com/@solanalanders",
    },
    {
        id: 8,
        image: <Telegram />,
        label: "Telegram",
        path: "https://t.me/slandofficial2",
    },
    {
        id: 9,
        image: <Fb />,
        label: "Facebook",
        path: "https://medium.com/@solanalanders",
    },
    {
        id: 10,
        image: <Twitter />,
        label: "Twitter",
        path: "https://twitter.com/slandofficial",
    },
];

export default options;
