import React, { useEffect, useState } from "react";
import { Typography, Box } from "@mui/material";
import Select from "react-select";
import styles from "../Gumdrop/styles.module.scss";
import { useFormik } from "formik";
import { GumdropValidation } from "../../schema";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { isValidSolanaAddress } from "@nfteyez/sol-rayz";
import {
  AccountLayout,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  bundlrStorage,
  keypairIdentity,
  Metaplex,
} from "@metaplex-foundation/js";
import {
  notifyError,
  notifySuccess,
} from "../../apiConnection/notification.api";
import Loader from "../Loader/Loader";
import useDarkMode from "use-dark-mode";
// import { numeric } from "../validations";

let initialValues = {
  amount: "",
};

// const optionToken = [
//     { value: "Token1", label: "" },
//     { value: "Token2", label: "" },
//     { value: "Token3", label: "Select Token3" },
//     { value: "Token4", label: "Select Token4" },
// ];

const Gumdrop = () => {
  const wallet = useWallet();
  const [tokenAddresses, setTokenAddresses] = useState("");
  const [userTokens, setUserTokens]: any = useState([]);
  const [selectedTokenDecimal, setSelectedTokenDecimal] = useState("");
  const [loader, setLoader] = useState(false);
  const [selectedTokenName, setSelectedTokenName] = useState({
    label: "Select Token",
    value: "",
  });
  const [selectedTokenMintAddress, setSelectedBuyTokenMintAddress] =
    useState("");
  const [displayMessage, setDisplayMessage] = useState("");

  let toWalletAddressArray = [];

  let connection = new Connection(
    clusterApiUrl("devnet"),
    // web3.clusterApiUrl("mainnet-beta"),
    "confirmed"
  );

  const getAccountTokens = async () => {
    if (!connection || !wallet.publicKey) {
      return;
    }

    const accounts = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
      filters: [
        {
          dataSize: 165, // number of bytes
        },
        {
          memcmp: {
            offset: 32, // number of bytes
            bytes: wallet.publicKey.toBase58(), // base58 encoded string
          },
        },
      ],
    });
    const tokensObjArray: any = [];
    const fromWallet = Keypair.generate();
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(fromWallet))
      .use(bundlrStorage());
    // console.log(accounts)
    accounts.map(async (account, i) => {
      //Parse the account data
      const accountInfo = AccountLayout.decode(account.account.data);
      const mintAddress = new PublicKey(accountInfo.mint);
      //Log results
      // console.log(account);
      // console.log(`Token Account No. ${i + 1}: ${account.pubkey.toString()}`);
      // console.log(`--Token Mint: ${mintAddress}`);
      const tokenInfo = await metaplex.nfts().findByMint({ mintAddress });
      const tokenSupply = await connection.getTokenSupply(mintAddress);
      // console.log(tokenInfo);
      if (
        tokenSupply.value.decimals > 0 &&
        Number(tokenSupply?.value?.uiAmount) > 1 &&
        !tokenInfo.name.startsWith("USD")
      ) {
        tokensObjArray.push({
          label: tokenInfo.name,
          symbol: tokenInfo.symbol,
          amount: tokenSupply.value.uiAmountString,
          decimal: `${tokenSupply.value.decimals}`,
          imageURI: tokenInfo.json?.image,
          mintAddress: mintAddress.toBase58(),
        });
        setUserTokens([...tokensObjArray]);
      }
    });
  };

  useEffect(() => {
    getAccountTokens();
  }, [wallet]);

  const sendSolana = async (
    sendTransaction: any,
    toWalletAddress: any,
    values: any
  ) => {
    // handleShow();
    const amount = values.amount;
    setLoader(true);
    setDisplayMessage("Sending...");
    if (!wallet.publicKey) {
      return;
    }

    if (!wallet.publicKey) throw new WalletNotConnectedError();
    var answ = toWalletAddress.split(",");
    toWalletAddressArray = answ;
    let allocateTransaction = new Transaction({
      feePayer: wallet.publicKey,
    });
    for (let i = 0; i < toWalletAddressArray.length; i++) {
      const result1 = isValidSolanaAddress(toWalletAddressArray[i]);
      if (result1 === false) {
        notifyError(`Error! Not Valid recepient Wallet Address`);
        setLoader(false);
        setDisplayMessage("");
        values.amount = ''
        // initialValues = initialValues;
        setTokenAddresses("");
        setSelectedTokenName({
          label: "Select Token",
          value: "",
        });
        throw "not valid recipient wallet Address ";
      }
      let toKeypair = new PublicKey(toWalletAddressArray[i]);
      const mint = new PublicKey(selectedTokenMintAddress);

      const fromTokenAccount = await getAssociatedTokenAddress(
        mint,
        wallet.publicKey,
        true,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      // console.log(fromTokenAccount, "fromTokenAccount");

      const toTokenAccount = await getAssociatedTokenAddress(
        mint,
        toKeypair,
        true,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      // console.log(toTokenAccount, "toTokenAccount");

      // console.log(toTokenAccount.toString(), "toTokenAccount.toString()");

      const receiverAccount = await connection.getAccountInfo(toTokenAccount);

      // console.log(receiverAccount, "receiverAccount");
      if (receiverAccount === null) {
        allocateTransaction.add(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            toTokenAccount,
            toKeypair,
            mint,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      allocateTransaction.add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          wallet.publicKey,
          parseInt(
            amount
              .toString()
              .padEnd(
                Number(selectedTokenDecimal) + amount.toString().length,
                "0"
              )
          )
        )
      );
    }

    try {
      const signature = await sendTransaction(allocateTransaction, connection);

      const result = await connection.confirmTransaction(
        signature,
        "processed"
      );

      if (result.value.err) {
        setLoader(false);
        setDisplayMessage("");
        // initialValues = initialValues;
        setTokenAddresses("");
        values.amount = ''
        // console.log("Sending", result.value.err);
        notifyError(`Error! ${result.value.err}`);
        setSelectedTokenName({
          label: "Select Token",
          value: "",
        });
      } else {
        // console.log("transaction confirmed signature", signature);
        notifySuccess("Success! Transfered Successfully.");
        setLoader(false);
        setDisplayMessage("");
        values.amount = ''
        // initialValues = initialValues;
        setTokenAddresses("");
        setSelectedTokenName({
          label: "Select Token",
          value: "",
        });
      }
    } catch (e) {
      console.log("error:", e);
      notifyError(`Error! ${e}`);
      setLoader(false);
      setDisplayMessage("");
      values.amount = ''
      // initialValues = initialValues;
      setTokenAddresses("");
      setSelectedTokenName({
        label: "Select Token",
        value: "",
      });
    }
  };

  const getTokenAddresses = (e: any) => {
    setTokenAddresses(e.target.value);
  };

  const getDepositeTokenInfo = (e: any) => {
    setSelectedTokenName({ label: e?.label, value: e?.mintAddress });
    setSelectedTokenDecimal(e.decimal);
    setSelectedBuyTokenMintAddress(e.mintAddress);
  };

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    isValid,
  } = useFormik({
    initialValues: initialValues,
    validationSchema: GumdropValidation,
    validateOnMount: true,
    onSubmit: async (values: any, action: any) => {
      action.resetForm();
    },
  });
  const { value }: any = useDarkMode();
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
      backgroundColor: state.isSelected
        ? "#f95192"
        : value
        ? "#1e2122"
        : "#fff",
      color: state.isSelected ? "white" : value ? "#fff" : "#222",
      fontFamily: "Segoe_UI",
      "&:hover": {
        backgroundColor: state.isSelected
          ? "#f95192"
          : value
          ? "#f95192"
          : "#fff0f3",
        color: value ? "#fff" : "",
      },
    }),
    control: (base: any, state: any) => ({
      ...base,
      transition: "none",
      border: state.isFocused
        ? "1px solid #888"
        : value
        ? "1px solid #888"
        : "1px solid #dadada",
      // This line disable the blue border
      boxShadow: state.isFocused ? 0 : 0,
      color: value ? "#fff" : "#d9d9d9",
      backgroundColor: value ? "#242525" : "#fff",
      "&:hover": {
        border: state.isFocused
          ? "1px solid #f95192"
          : value
          ? "1px solid #f95192"
          : "1px solid #f95192",
      },
      "&:focus-within": {
        border: state.isFocused ? "1px solid #f95192" : "none",
        boxShadow: state.isFocused
          ? "0 0 0 0.125em rgba(249, 81, 146, 0.25)"
          : "none",
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
  //   console.log(selectedTokenName, "hhhhhhhhhh");
  //   console.log(userTokens, "kkkkkkkk");
  return (
    <Box className="themeBg">
      <Box className={styles.airdrop}>
        <Box className={styles.container}>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Box sx={{ px: { xs: 3 } }}>
              <Box>
                <Typography variant="h1">Create New Airdrop</Typography>
              </Box>
              <Box
                className={styles.airdropFormBox}
                sx={{ backgroundColor: value ? "#242525" : "#fff" }}
              >
                <form onSubmit={handleSubmit}>
                  <div className={styles.selector}>
                  <label htmlFor="token">
                        Token <span>*</span>
                      </label>
                      <br />
                    <Select
                      // options={optionToken}
                      styles={colourStyles}
                      value={selectedTokenName || null}
                      onChange={(e) => getDepositeTokenInfo(e)}
                      options={userTokens}
                      placeholder="Select Token"
                      className="customSelector"
                    />
                  </div>
                  <div className={styles.formStyle}>
                    <label htmlFor="description">Description</label>
                    <br />
                    <textarea
                      value={tokenAddresses}
                      onChange={(e) => getTokenAddresses(e)}
                      name="amount"
                      id="amount"
                      placeholder="Insert address: Do not separate with separate lines. Each wallet address separated by comma(,) symbol. The format just like CSV file
                                            Ex:
                                            0x34E7f6A4d0BB1fa7aFe548582c47Df337FC337E6,0xd8Ebc66f0E3D638156D6F5eFAe9f43B1eBc113B1,                              0x968136BB860D9534aF1563a7c7BdDa02B1A979C2"
                    />
                  </div>
                  <div className={styles.formStyle}>
                    <label htmlFor="amount">
                      Transfer Amount <span>*</span>
                    </label>
                    <br />
                    <input
                      type="number"
                      name="amount"
                      id="amount"
                      placeholder="Transfer Amount"
                      className={
                        errors.amount && touched.amount
                          ? styles.errorBorder
                          : ""
                      }
                      value={values.amount}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.amount && touched.amount ? (
                      <p className={styles.formErrors}>{errors.amount}</p>
                    ) : null}
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <button
                      disabled={!isValid || values.amount === "" || loader}
                      className={
                        !isValid || values.amount === "" || loader ? "disableBtn" : ""
                      }
                      onClick={async () =>
                        await sendSolana(
                          wallet.sendTransaction,
                          tokenAddresses,
                          values
                        )
                      }
                      type="submit"
                    >
                      {loader ? (
                        <div>
                          <Loader />
                        </div>
                      ) : (
                        "Transfer"
                      )}
                    </button>
                  </div>
                  {loader ? (
                    <p className={styles.statusMsg}>{displayMessage}</p>
                  ) : (
                    ""
                  )}
                </form>
              </Box>
              <Box sx={{ display: "center", justifyContent: "center", mt: 4 }}>
                <p className={styles.disclaimer}>
                  Disclaimer: Martify will never endorse or encourage that you
                  invest in any of the projects listed and therefore, accept no
                  liability for any loss occasioned. It is the user(s)
                  responsibility to do their own research and seek financial
                  advice from a professional. More information about (DYOR) can
                  be found via Binance Academy.
                </p>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Gumdrop;
