interface HomeCounterType {
    id: number;
    counter: string;
    text: string;
}
interface HomeToolsType {
    id: number;
    image: string;
    label: string;
    text: string;
}
interface HomeEcosystemType {
    id: number;
    image: string;
    label: string;
    text: string;
}

// const counterCards: HomeCounterType[] = [
//     {
//         id: 0,
//         counter: "$488.1M",
//         text: "Total Liquidity Raised",
//     },
//     {
//         id: 1,
//         counter: "15369",
//         text: "Total Projects",
//     },
//     {
//         id: 3,
//         counter: "1.6M",
//         text: "Total Participants",
//     },
//     {
//         id: 4,
//         counter: "$258.9M",
//         text: "Total Values Locked",
//     },
// ];
const toolCards: HomeToolsType[] = [
    {
        id: 0,
        image: "https://www.pinkswap.finance/pinkmoon.png",
        label: "Standard",
        text: "Mint standard tokens on Solana.",
    },
    // {
    //     id: 1,
    //     image: "https://www.pinkswap.finance/pinkmoon.png",
    //     label: "Deflationary",
    //     text: "Generate deflationary tokens with tax and/or charity functions.",
    // },
    {
        id: 2,
        image: "https://www.pinkswap.finance/pinkmoon.png",
        label: "Customization",
        text: "Create a token sale for your own custom token easily.",
    },
    {
        id: 3,
        image: "https://www.pinkswap.finance/pinkmoon.png",
        label: "Launchpad",
        text: "Use the token you mint to create a launchpad with just a few clicks",
    },
    // {
    //     id: 4,
    //     image: "https://www.pinkswap.finance/pinkmoon.png",
    //     label: "Branding",
    //     text: "Adding logo, social links, description, listing on Martify.",
    // },
    // {
    //     id: 5,
    //     image: "https://www.pinkswap.finance/pinkmoon.png",
    //     label: "Management",
    //     text: "The portal to help you easily update content for your launchpad.",
    // },
    // {
    //     id: 6,
    //     image: "https://www.pinkswap.finance/pinkmoon.png",
    //     label: "Community",
    //     text: "Promote your launchpad to thousands of buyers on Martify.",
    // },
    {
        id: 7,
        image: "https://www.pinkswap.finance/pinkmoon.png",
        label: "Locking",
        text: "Lock your liquidity to Orca/Raydium.",
    },
];
const EcosystemCards: HomeEcosystemType[] = [
    {
        id: 0,
        image: "https://www.pinkswap.finance/pinkmoon.png",
        label: "PinkMoon",
        text: "The best launchpad for professional teams",
    },
    {
        id: 1,
        image: "https://www.pinksale.finance/static/media/pinkswap.a95de4f3.png",
        label: "Martify",
        text: "Launch a token sale with a few clicks.",
    },
    {
        id: 2,
        image: "https://www.pinkswap.finance/pinkswap.png",
        label: "PinkSwap",
        text: "Swap tokens and farming $PinkS.",
    },
    {
        id: 3,
        image: "https://www.pinkswap.finance/pinklock.png",
        label: "PinkLock",
        text: "Locking liquidity on PinkSwap.",
    },
    {
        id: 4,
        image: "https://www.pinkswap.finance/pinkmoon.png",
        label: "PinkElon",
        text: "The first meme token on PinkMoon.",
    },
    {
        id: 5,
        image: "https://www.pinkswap.finance/pinkmoon.png",
        label: "PinkWallet",
        text: "Crypto wallet, buy, store, exchange & earn.",
    },
];

export { toolCards, EcosystemCards };
