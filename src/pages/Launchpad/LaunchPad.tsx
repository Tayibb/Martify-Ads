import React, { useEffect, useState } from "react";
import * as anchor from "@project-serum/anchor";
import idl from "../../idl/anchor_token_sale.json";
import { PublicKey, Keypair, Transaction } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { AccountLayout, ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import axios from "axios";
import { notifyError, notifySuccess } from "../../apiConnection/notification.api";
import { bundlrStorage, keypairIdentity, Metaplex } from "@metaplex-foundation/js";
import Loader from "../../components/Loader/Loader";
// import { numeric, allnumeric } from '../../components/validations';
import { BaseURL } from "../../enviornment";
import { Typography, Box, Stepper, Step, StepLabel, Button } from "@mui/material";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../Launchpad/styles.module.scss";
import { useFormik } from "formik";
import { LaunchPadValidation } from "../../schema";
import useDarkMode from "use-dark-mode";

let initialValues = {
    amount: "",
    price: "",
    select: "",
};

const steps = [
    {
        label: "Verify Token",
        desc: "Enter the token address and verify",
    },
    {
        label: "DeFi Launchpad Info",
        desc: "Enter the launchpad information that you want to raise , that should be enter all details about your presale",
    },
    {
        label: "Add Additional Info",
        desc: "Let people know who you are",
    },
    {
        label: "Finish",
        desc: "Review your information",
    },
];
// const optionToken = [{ value: "Select Token", label: "Select Token" }];
// const optionTime = [
//     { value: "5min", label: "5min" },
//     { value: "1 Day", label: "1 Day" },
//     { value: "5 Day", label: "5 Day" },
//     { value: "10 Day", label: "10 Day" },
//     { value: "15 Day", label: "15 Day" },
// ];

const LaunchPad = () => {
    window.Buffer = window.Buffer || require("buffer").Buffer;
    const wallet = useWallet();
    const [mintA, setmintA] = useState("");
    const [mintB, setmintB] = useState("");
    const [userDepositTokens, setUserDepositTokens]: any = useState([]);
    const [userBuyToken, setUserBuyToken]: any = useState([]);
    const [selectedTokenURI, setSelectedTokenURI] = useState("");
    const [loader, setLoader] = useState(false);
    const [startDate, setStartDate]: any = useState(new Date());
    const [endDate, setEndDate]: any = useState(new Date());
    const [dateError, setDateError] = useState("");
    const [activeStep, setActiveStep] = React.useState(0);
    const [selectedTokenName, setSelectedTokenName] = useState({
        label: "Select Token",
        value: "",
    });
    const [selectedBuyTokenName, setSelectedBuyTokenName] = useState({
        label: "Select Token",
        value: "",
    });
    const [selectedTokenDecimals, setSelectedTokenDecimals] = useState("");
    const [selectedBuyTokenSymbol, setSelectedBuyTokenSymbol] = useState("");
    const [selectedBuyTokenDecimals, setSelectedBuyTokenDecimals] = useState("");
    const [displayMessage, setDisplayMessage] = useState("");
    // const launcpadDurationOptions = [
    //     { value: "5 mins", label: "5 mins" },
    //     { value: "1 Day", label: "1 Day" },
    //     { value: "5 Day", label: "5 Day" },
    //     { value: "10 Day", label: "10 Day" },
    //     { value: "15 Day", label: "15 Day" },
    // ];
    // const [launchpadDur, setLaunchpadDur] = useState({
    //     label: "5 mins",
    //     value: "5 mins",
    // });

    const connection1 = new anchor.web3.Connection("https://api.devnet.solana.com");
    const options = anchor.AnchorProvider.defaultOptions();
    //@ts-ignore
    const provider = new anchor.AnchorProvider(connection1, wallet, options);
    //   console.log('Provider: ', provider);

    const getAccountTokens = async () => {
        if (!connection1 || !wallet.publicKey) {
            return;
        }

        const accounts = await connection1.getProgramAccounts(TOKEN_PROGRAM_ID, {
            filters: [
                {
                    dataSize: 165, /// number of bytes
                },
                {
                    memcmp: {
                        offset: 32, // number of bytes
                        bytes: wallet.publicKey.toBase58(), // base58 encoded string
                    },
                },
            ],
        });
        // console.log(accounts, 'accounts');
        const tokensObjArray: any = [];
        const buyTokensObjArray: any = [];
        const fromWallet = Keypair.generate();
        const metaplex = Metaplex.make(connection1).use(keypairIdentity(fromWallet)).use(bundlrStorage());
        accounts.map(async (account, i) => {
            //Parse the account data
            const accountInfo = AccountLayout.decode(account.account.data);
            const mintAddress = new PublicKey(accountInfo.mint);
            const tokenInfo = await metaplex.nfts().findByMint({ mintAddress });
            const tokenSupply = await connection1.getTokenSupply(mintAddress);
            if (tokenSupply.value.decimals > 0 && Number(tokenSupply?.value?.uiAmount) > 1 && !tokenInfo.name.includes("USD")) {
                tokensObjArray.push({
                    label: tokenInfo.name,
                    symbol: tokenInfo.symbol,
                    amount: tokenSupply.value.uiAmountString,
                    decimal: `${tokenSupply.value.decimals}`,
                    imageURI: tokenInfo?.json?.image,
                    value: mintAddress.toBase58(),
                });
                setUserDepositTokens([...tokensObjArray]);
            }
            if (tokenSupply.value.decimals > 0 && Number(tokenSupply?.value?.uiAmount) > 1 && tokenInfo.name.includes("USD")) {
                buyTokensObjArray.push({
                    label: tokenInfo.name,
                    symbol: tokenInfo.symbol,
                    value: mintAddress.toBase58(),
                    decimal: `${tokenSupply.value.decimals}`,
                });
                setUserBuyToken([...buyTokensObjArray]);
            }
        });
    };

    const { value }: any = useDarkMode();

    const a = JSON.stringify(idl);
    const b = JSON.parse(a);
    //   console.log(
    //     ':rocket: ~ file: ExecuteSale.tsx ~ line 64 ~ executeSaleFunction ~ b',
    //     b
    //   );
    const program = new anchor.Program(b, idl.metadata.address, provider);
    //   console.log(program, 'program');

    let vault_account_pda = null;
    let vault_account_bump = null;
    let vault_authority_pda = null;

    const getDepositeTokenInfo = (e: any) => {
        setmintA(e?.value);
        setSelectedTokenURI(e?.imageURI);
        setSelectedTokenName({
            label: e?.label,
            value: e?.value,
        });
        setSelectedTokenDecimals(e?.decimal);
    };

    const getBuyTokenInfo = (e: any) => {
        setSelectedBuyTokenName({ label: e?.label, value: e?.value });
        setmintB(e?.value);
        setSelectedBuyTokenSymbol(e?.symbol);
        setSelectedBuyTokenDecimals(e?.decimal);
    };
    const handleLaunchPadStartDate = (e: any) => {
        // setLaunchpadDur({ label: e?.label, value: e?.value });
        // console.log(new Date(e))
    };

    const handleLaunchPadEndDate = (e: any) => {
        // setLaunchpadDur({ label: e?.label, value: e?.value });
        // console.log(new Date(e))
        //@ts-ignore
        if (new Date(e).getTime() > new Date().getTime()) {
            setEndDate(e);
            setDateError("");
        } else {
            setDateError("End date should be greater than the current date and time!");
        }
    };
    // console.log(new Date(endDate).getTime())

    const escrowAccount = Keypair.generate();

    const saveDataToDB = (data: Object, action: any) => {
        axios
            .post(BaseURL + "/launchpade/create", data)
            .then(() => {
                notifySuccess("Launchpad created successfully!");
                setDisplayMessage("");
                setLoader(false);
                // initialValues = initialValues;
                setSelectedBuyTokenName({
                    label: "Select Token",
                    value: "",
                });
                setSelectedTokenName({
                    label: "Select Token",
                    value: "",
                });
                setmintA("");
                setmintB("");
                // setLaunchpadDur({
                //     label: "5 mins",
                //     value: "5 mins",
                // });
                setEndDate(new Date());
                action.resetForm();
            })
            .catch((error) => {
                notifyError("Transaction failed!");
                setDisplayMessage("");
                setLoader(false);
                // initialValues = initialValues;
                setSelectedBuyTokenName({
                    label: "Select Token",
                    value: "",
                });
                setSelectedTokenName({
                    label: "Select Token",
                    value: "",
                });
                setmintA("");
                setmintB("");
                // setLaunchpadDur({
                //     label: "5 mins",
                //     value: "5 mins",
                // });
                setEndDate(new Date());
                action.resetForm();
            });
    };

    const getTime = () => {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        const milliseconds = Math.abs(end - start).toString();
        //@ts-ignore
        const seconds = parseInt(milliseconds / 1000);
        return seconds;
    };
    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };
    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };
    const { values, errors, touched, handleBlur, handleChange, handleSubmit, isValid } = useFormik({
        initialValues: initialValues,
        validationSchema: LaunchPadValidation,
        validateOnMount: true,
        onSubmit: async (values: any, action: any) => {
            const amount = values?.amount;
            const price = values?.price;
            if (!wallet.connected) {
                return notifyError("Please connect your wallet!");
            }
            if (!wallet.publicKey) {
                return;
            }
            setLoader(true);
            const tokenAccountPubkey = new PublicKey(mintA);

            const tokenBAccountPubkey = new PublicKey(mintB);
            setDisplayMessage("Creating launchpad...");
            //   let tokenAccount = await getAccount(connection1, tokenAccountPubkey);
            //   console.log(tokenAccount);
            //@ts-ignore
            let mintATokenAccInWallet = await getAssociatedTokenAddress(tokenAccountPubkey, wallet.publicKey, true, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
            //@ts-ignore
            let mintBTokenAccInWallet = await getAssociatedTokenAddress(tokenBAccountPubkey, wallet.publicKey, true, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);

            //code added for admin wallet token account
            let adminWallet = new PublicKey("HW1UxFjZz2ecmmjNtWZZ14XSPUV7hQsDJ3He8o5ewvum");
            //   console.log(adminWallet);
            let mintBTokenAccInadminWallet = await getAssociatedTokenAddress(tokenBAccountPubkey, adminWallet, true, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
            //   console.log(
            //     "🚀 ~ file: index.tsx:217 ~ account ~ mintBTokenAccInadminWallet:",
            //     mintBTokenAccInadminWallet
            //   );
            const admin_receiverTokenAccount = await connection1.getAccountInfo(mintBTokenAccInadminWallet);
            //   console.log(
            //     "🚀 ~ file: index.tsx:219 ~ account ~ admin_receiverTokenAccount:",
            //     admin_receiverTokenAccount
            //   );
            if (admin_receiverTokenAccount === null) {
                let allocateTransaction = new Transaction({
                    feePayer: wallet.publicKey,
                });
                allocateTransaction.add(createAssociatedTokenAccountInstruction(wallet.publicKey, mintBTokenAccInadminWallet, adminWallet, tokenBAccountPubkey, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID));
                // console.log(allocateTransaction, "allocateTransaction");
                try {
                    const signature = await wallet.sendTransaction(allocateTransaction, connection1);

                    const result = await connection1.confirmTransaction(signature, "processed");

                    if (result.value.err) {
                        console.log("Sending", result.value.err);
                        notifyError(`Error! ${result.value.err}`);
                    } else {
                        console.log("transaction confirmed signature", signature);
                        notifySuccess("Success! Transfered Successfully.");
                        setDisplayMessage("");
                        //   initialValues = initialValues;
                        setSelectedBuyTokenName({
                            label: "Select Token",
                            value: "",
                        });
                        setSelectedTokenName({
                            label: "Select Token",
                            value: "",
                        });
                        setmintA("");
                        setmintB("");
                        // setLaunchpadDur({
                        //     label: "5 mins",
                        //     value: "5 mins",
                        // });
                        setEndDate(new Date());
                        setDisplayMessage("");
                        setLoader(false);
                        action.resetForm();
                    }
                } catch (e) {
                    console.log("error:", e);
                    notifyError(`Error! ${e}`);
                    // initialValues = initialValues;
                    setSelectedBuyTokenName({
                        label: "Select Token",
                        value: "",
                    });
                    setSelectedTokenName({
                        label: "Select Token",
                        value: "",
                    });
                    setDisplayMessage("");
                    setmintA("");
                    setLoader(false);
                    // setLaunchpadDur({
                    //     label: "5 mins",
                    //     value: "5 mins",
                    // });
                    setEndDate(new Date());
                    setmintB("");
                    action.resetForm();
                }
            }
            //code added for admin wallet token account end

            //   console.log(mintATokenAccInWallet.toBase58());
            //   console.log(mintBTokenAccInWallet.toBase58());
            const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
                // [Buffer.from(anchor.utils.bytes.utf8.encode("token-seed"))],
                // [wallet.publicKey.toBuffer()],
                [Buffer.from(anchor.utils.bytes.utf8.encode("token-seed")), wallet.publicKey.toBuffer(), new PublicKey(mintA).toBuffer()],
                program.programId
            );

            vault_account_pda = _vault_account_pda;
            vault_account_bump = _vault_account_bump;

            const [_vault_authority_pda, _vault_authority_bump] = await PublicKey.findProgramAddress([Buffer.from(anchor.utils.bytes.utf8.encode("escrow"))], program.programId);
            vault_authority_pda = _vault_authority_pda;

            //   console.log("vaultAccount ===>", vault_account_pda.toBase58());
            //   console.log("programID ====>", program.programId.toBase58());
            //   console.log(amount, "amount", selectedBuyTokenDecimals, "decimals");
            // console.log(amount.toString().length)
            // console.log(selectedTokenDecimals)
            // console.log(price)
            // console.log(selectedBuyTokenDecimals)
            // console.log(parseInt(
            //   amount
            //     .toString()
            //     .padEnd(parseInt(selectedTokenDecimals) + amount.toString().length, "0")
            // ))
            // console.log(parseInt(
            //   price
            //     .toString()
            //     .padEnd(Number(selectedBuyTokenDecimals) + price.toString().length, "0")
            // ))
            // console.log(parseFloat(price.toString().padEnd(Number(selectedBuyTokenDecimals) + price.toString().length, "0")))
            let num = parseFloat(amount);
            let decimalPlaces = parseInt(selectedTokenDecimals);
            let factor = Math.pow(10, decimalPlaces);
            let formattedNum = Math.round(num * factor);
            // console.log(formattedNum)

            let numPrice = parseFloat(price);
            let decimalPlacesPrice = parseInt(selectedBuyTokenDecimals);
            let factorPrice = Math.pow(10, decimalPlacesPrice);
            let formattedNumPrice = Math.round(numPrice * factorPrice);
            // console.log(formattedNumPrice)
            const tx_initialize = await program.rpc
                .initialize(
                    vault_account_bump,
                    new anchor.BN(formattedNum),
                    new anchor.BN(formattedNumPrice),
                    // new anchor.BN(parseInt(price)),
                    getTime(),
                    {
                        accounts: {
                            initializer: wallet.publicKey,
                            vaultAccount: vault_account_pda,
                            mint: new PublicKey(mintA),
                            initializerDepositTokenAccount: mintATokenAccInWallet,
                            // initializerReceiveTokenAccount: initializerTokenAccountB,
                            escrowAccount: escrowAccount.publicKey,
                            systemProgram: anchor.web3.SystemProgram.programId,
                            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                            tokenProgram: TOKEN_PROGRAM_ID,
                        },
                        instructions: [await program.account.escrowAccount.createInstruction(escrowAccount)],
                        signers: [escrowAccount],
                    }
                )
                .catch((error) => {
                    console.log(error);
                    notifyError("Transaction failed!");
                    // initialValues = initialValues;
                    setmintA("");
                    setmintB("");
                    setDisplayMessage("");
                    setLoader(false);
                    setSelectedBuyTokenName({
                        label: "Select Token",
                        value: "",
                    });
                    setSelectedTokenName({
                        label: "Select Token",
                        value: "",
                    });
                    // setLaunchpadDur({
                    //     label: "5 mins",
                    //     value: "5 mins",
                    // });
                    setEndDate(new Date());
                    action.resetForm();
                });

            const data = {
                name: selectedTokenName.label,
                amount,
                price,
                decimal: selectedBuyTokenDecimals,
                ownerAddress: wallet.publicKey.toBase58(),
                tokenAddress: mintA,
                tokenATA: mintATokenAccInWallet.toBase58(),
                escrowAddress: escrowAccount.publicKey.toBase58(),
                receiverTokenAddress: mintB,
                receiverTokenSymbol: selectedBuyTokenSymbol,
                receiverTokenATA: mintBTokenAccInWallet.toBase58(),
                vaultAccount: vault_account_pda.toBase58(),
                imageURI: selectedTokenURI,
                launchpadTime: new Date(endDate).toISOString(),
            };

            if (tx_initialize !== undefined) {
                saveDataToDB(data, action);
                console.log(tx_initialize, "tx_initialize");
            }
        },
    });
    // console.log(Math.floor(new Date(endDate).getTime()/1000))
    // console.log(selectedTokenURI)
    useEffect(() => {
        getAccountTokens();
        if (new Date(endDate).getTime() > new Date().getTime()) {
            setEndDate(endDate);
            setDateError("");
        } else {
            setDateError("End date should be greater than the current date and time!");
        }
    }, [wallet]);
    if (!provider) {
        //@ts-ignore
        return null;
    }

    const colourStyles = {
        // ...colourStyles,
        menu: (provided: any, state: any) => ({
            ...provided,
            marginTop: 0,
            marginBottom: 0,
        }),
        menuList: (provided: any, state: any) => ({
            ...provided,
            paddingTop: 0,
            paddingBottom: 0,
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected ? "#f95192" : value ? "#1e2122" : "#fff",
            color: state.isSelected ? "white" : value ? "#fff" : "#222",
            fontFamily: "Segoe_UI",
            "&:hover": {
                backgroundColor: state.isSelected ? "#f95192" : value ? "#f95192" : "#fff0f3",
                color: value ? "#fff" : "",
            },
        }),
        control: (base: any, state: any) => ({
            ...base,
            transition: "none",
            border: state.isFocused ? "1px solid #888" : value ? "1px solid #888" : "1px solid #dadada",
            // This line disable the blue border
            boxShadow: state.isFocused ? 0 : 0,
            color: value ? "#fff" : "#d9d9d9",
            backgroundColor: value ? "#242525" : "#fff",
            "&:hover": {
                border: state.isFocused ? "1px solid #f95192" : value ? "1px solid #f95192" : "1px solid #f95192",
            },
            "&:focus-within": {
                border: state.isFocused ? "1px solid #f95192" : "none",
                boxShadow: state.isFocused ? "0 0 0 0.125em rgba(249, 81, 146, 0.25)" : "none",
            },
            fontWeight: "600",
            fontFamily: "Segoe_UI",
            cursor: "pointer",
        }),
        placeholder: (provided: any, state: any) => ({
            ...provided,
            color: value ? "#c9c8c5f" : "#d9d9d9",
            fontSize: "16px",
        }),
    };
    return (
        <>
            <Box className="themeBg">
                <Box className={styles.launchpad}>
                    <Box className={styles.container}>
                        <Box style={{ paddingTop: "130px" }}>
                            <Stepper activeStep={activeStep}>
                                {steps.map((item, index) => {
                                    const stepProps = {};
                                    const labelProps = {};
                                    // const descProps = {};
                                    return (
                                        <Step {...stepProps}>
                                            <StepLabel {...labelProps}>
                                                {/* <Box sx={{ width: "50px", height: "30px" }}></Box> */}
                                                <Box>
                                                    <Typography sx={{ m: 0, fontSize: "18px", pt: 5.3 }} variant="h1">
                                                        {item.label}
                                                    </Typography>
                                                    <Typography sx={{ m: 0, fontSize: "14px", pt: 1 }} variant="h2">
                                                        {item.desc}
                                                    </Typography>
                                                </Box>
                                            </StepLabel>
                                        </Step>
                                    );
                                })}
                            </Stepper>
                            {activeStep === steps.length ? (
                                <React.Fragment>
                                    <Typography sx={{ mt: 2, mb: 1 }}>All steps completed - you&apos;re finished</Typography>
                                    <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                                        <Box sx={{ flex: "1 1 auto" }} />
                                    </Box>
                                </React.Fragment>
                            ) : (
                                <React.Fragment>
                                    {activeStep === 0 && (
                                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                                            <Box sx={{ px: { xs: 3 } }}>
                                                <Box className={styles.launchpadFormBox} sx={{ backgroundColor: value ? "#242525" : "#fff" }}>
                                                    <Box>
                                                        <Typography variant="h1">(*) is required field</Typography>
                                                    </Box>
                                                    <form onSubmit={handleSubmit}>
                                                        <div className={styles.formStyle}>
                                                            <label htmlFor="amount">
                                                                Amount <span>*</span>
                                                            </label>
                                                            <br />
                                                            <input
                                                                className={errors.amount && touched.amount ? styles.errorBorder : ""}
                                                                type="number"
                                                                name="amount"
                                                                id="amount"
                                                                value={values.amount}
                                                                placeholder="Amount"
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                            />
                                                            {errors.amount && touched.amount ? <p className={styles.formErrors}>{errors.amount}</p> : null}
                                                        </div>
                                                        <div className={styles.formStyle}>
                                                            <label htmlFor="price">
                                                                Price <span>*</span>
                                                            </label>
                                                            <br />
                                                            <input
                                                                type="number"
                                                                name="price"
                                                                id="price"
                                                                placeholder="Price"
                                                                className={errors.price && touched.price ? styles.errorBorder : ""}
                                                                value={values.price}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                            />
                                                            {errors.price && touched.price ? <p className={styles.formErrors}>{errors.price}</p> : null}
                                                        </div>
                                                        <div className={styles.selector}>
                                                            <label htmlFor="token">
                                                                Token <span>*</span>
                                                            </label>
                                                            <Select
                                                                isClearable={true}
                                                                value={selectedTokenName || null}
                                                                onChange={(e) => getDepositeTokenInfo(e)}
                                                                options={userDepositTokens}
                                                                styles={colourStyles}
                                                                placeholder="Select Token"
                                                            />
                                                        </div>
                                                        <div className={styles.selector}>
                                                            <label htmlFor="currency">
                                                                Currency <span>*</span>
                                                            </label>
                                                            <Select isClearable={true} value={selectedBuyTokenName || null} options={userBuyToken} styles={colourStyles} onChange={(e) => getBuyTokenInfo(e)} placeholder="Select Token" />
                                                        </div>
                                                        <div className={styles.selector}>
                                                            {/* <label htmlFor="duration">
                                                Duration <span>*</span>
                                            </label> */}
                                                            <div className={styles.datePickerWrapper}>
                                                                <div className={styles.datePicker}>
                                                                    <label htmlFor="start date">
                                                                        Start Date <span>*</span>
                                                                    </label>
                                                                    <DatePicker disabled selected={startDate} onChange={(e: any) => handleLaunchPadStartDate(e)} timeInputLabel="Time:" dateFormat="MM/dd/yyyy h:mm aa" showTimeInput />
                                                                </div>
                                                                <div className={styles.datePicker}>
                                                                    <label htmlFor="end date">
                                                                        End Date <span>*</span>
                                                                    </label>
                                                                    <DatePicker selected={endDate} onChange={(e: any) => handleLaunchPadEndDate(e)} timeInputLabel="Time:" dateFormat="MM/dd/yyyy h:mm aa" showTimeInput />
                                                                    {dateError ? <p className={styles.statusMsg}>{dateError}</p> : ""}
                                                                </div>
                                                            </div>

                                                            {/* <Select isClearable={true} value={launchpadDur || null} options={launcpadDurationOptions} onChange={(e) => handleLaunchPad(e)} styles={colourStyles} placeholder="Select Token" /> */}
                                                        </div>
                                                        <div style={{ display: "flex", justifyContent: "center" }}>
                                                            <button
                                                                disabled={!isValid || mintA === "" || mintB === "" || loader || values.amount === "" || values.price === "" || endDate === "" || dateError !== ""}
                                                                className={!isValid || mintA === "" || mintB === "" || loader || values.amount === "" || values.price === "" || endDate === "" || dateError !== "" ? "disableBtn" : ""}
                                                                type="submit"
                                                            >
                                                                {loader ? (
                                                                    <div>
                                                                        <Loader />
                                                                    </div>
                                                                ) : (
                                                                    "Initialize Launchpad"
                                                                )}
                                                            </button>
                                                        </div>
                                                        {loader ? <p className={styles.statusMsg}>{displayMessage}</p> : ""}
                                                    </form>
                                                </Box>
                                                <Box sx={{ display: "center", justifyContent: "center", mt: 4 }}>
                                                    <p className={styles.disclaimer}>
                                                        Disclaimer: Martify will never endorse or encourage that you invest in any of the projects listed and therefore, accept no liability for any loss occasioned. It is the user(s)
                                                        responsibility to do their own research and seek financial advice from a professional. More information about (DYOR) can be found via Binance Academy.
                                                    </p>
                                                </Box>
                                            </Box>
                                        </Box>
                                    )}
                                    {activeStep === 1 && "2"}
                                    {activeStep === 2 && "3"}
                                    {activeStep === 3 && "Finished"}
                                    <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                                        <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                                            Back
                                        </Button>
                                        <Box sx={{ flex: "1 1 auto" }} />
                                        <Button onClick={handleNext}>{activeStep === steps.length - 1 ? "Finish" : "Next"}</Button>
                                    </Box>
                                </React.Fragment>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default LaunchPad;
