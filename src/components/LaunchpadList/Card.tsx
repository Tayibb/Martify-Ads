import React, { useEffect, useState } from "react";
import { Typography, Box } from "@mui/material";
import styles from "../LaunchpadList/styles.module.scss";
import * as anchor from "@project-serum/anchor";
import idl from "../../idl/anchor_token_sale.json";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import axios from "axios";
import {
  notifyError,
  notifySuccess,
} from "../../apiConnection/notification.api";
import { BaseURL } from "../../enviornment";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import useDarkMode from "use-dark-mode";
import LaunchPadModal from "./LaunchPadModal";

const Card = ({ item, getLists }: any) => {
  const wallet = useWallet();
  const [isOpen, setisOpen] = useState(false);

  // const handleOpen = () => {
  //     setisOpen(true);
  // };

  const handleClose = () => {
    setisOpen(false);
  };
  const [currentTime, setCurrentTime] = useState(moment());
  const [targetTime, setTargetTime] = useState(moment());
  const navigate = useNavigate();

  const connection1 = new anchor.web3.Connection(
    "https://api.devnet.solana.com"
  );
  const options = anchor.AnchorProvider.defaultOptions();
  //@ts-ignore
  const provider = new anchor.AnchorProvider(connection1, wallet, options);
  // console.log("Provider: ", provider);

  var ms = moment(targetTime, "DD/MM/YYYY HH:mm:ss").diff(
    moment(currentTime, "DD/MM/YYYY HH:mm:ss")
  );
  var d = moment.duration(ms);
////Get Days and subtract from duration
var days = d.days();
d.subtract(days, 'days');

//Get hours and subtract from duration
var hours = d.hours();
d.subtract(hours, 'hours');

//Get Minutes and subtract from duration
var minutes = d.minutes();
d.subtract(minutes, 'minutes');

//Get seconds
var seconds = d.seconds();

  const { value }: any = useDarkMode();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {}, [wallet]);

  useEffect(() => {
    if (item && item.expiryDate && item.expiryDate !== "") {
      setTargetTime(moment(item.expiryDate));
    }
  }, [item]);

  if (!provider) {
    return null;
  }

  const a = JSON.stringify(idl);
  const b = JSON.parse(a);
  //   console.log(
  //     ':rocket: ~ file: ExecuteSale.tsx ~ line 64 ~ executeSaleFunction ~ b',
  //     b
  //   );
  const program = new anchor.Program(b, idl.metadata.address, provider);
  // console.log(program, "program");

  //   let vault_account_pda = null;
  //   let vault_account_bump = null;
  let vault_authority_pda = null;
  const buyerescrowAccount = anchor.web3.Keypair.generate();

  const updateTokenAmount = async (data: any, amount: any, item: any, setTokenReceive: any) => {
    if (!wallet.publicKey) {
      return null;
    }
    const [_vault_account_pda, _vault_account_bump] =
      await PublicKey.findProgramAddress(
        // [Buffer.from(anchor.utils.bytes.utf8.encode("token-seed"))],
        // [wallet.publicKey.toBuffer()],
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("taker-token-seed")),
          wallet.publicKey.toBuffer(),
          new PublicKey(item?.tokenAddress).toBuffer(),
        ],
        program.programId
      );
    let taker_vault_account_pda = _vault_account_pda;
    axios
      .post(BaseURL + "/launchpade/update", data)
      .then((res) => {
        const exchangeData = {
          name: item?.name,
          price: item.price,
          imageURI: item.imageURI,
          tokens: amount,
          tokenAddressA: item?.tokenAddress,
          tokenAddressB: item?.receiverTokenAddress,
          buyer: wallet.publicKey?.toBase58(),
          buyerEscrowAccount: buyerescrowAccount.publicKey.toBase58(),
          takerVaultAccount: taker_vault_account_pda,
          expiryDate: item?.expiryDate
        };
        notifySuccess("Transaction successful!");
        getLists();
        SaveExchangeDataToDB(exchangeData);
        setTokenReceive(0)
      })
      .catch((error) => notifyError(error));
  };

  const SaveExchangeDataToDB = (data: any) => {
    axios
      .post(BaseURL + "/exchange/create", data)
      .then(() => {
        navigate("/claimlist");
      })
      .catch((error) => notifyError(error));
  };

  const exchange = async (amount: any,setTokenReceive: any) => {
    if (!wallet.publicKey) {
      return null;
    }
    const [_vault_authority_pda, _vault_authority_bump] =
      await PublicKey.findProgramAddress(
        [Buffer.from(anchor.utils.bytes.utf8.encode("escrow"))],
        program.programId
      );
    vault_authority_pda = _vault_authority_pda;

    //token ATA buyer will submit
    const receiverToken = new PublicKey(item?.receiverTokenAddress); //e.g USDT
    // console.log("🚀 ~ file: index.tsx:74 ~ exchange ~ receiverToken:", receiverToken)

    const receiverTokenAccInWallet = await getAssociatedTokenAddress(
      receiverToken,
      wallet.publicKey,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    // console.log("🚀 ~ file: index.tsx:77 ~ exchange ~ receiverTokenAccInWallet:", receiverTokenAccInWallet)
    // let receiverAtA = await getAssociatedTokenAddress(
    //     receiverToken, // mint
    //     wallet.publicKey, // owner
    //     false // allow owner off curve
    // );

    //reward token address
    const token = new PublicKey(item?.tokenAddress);
    // console.log("🚀 ~ file: index.tsx:87 ~ exchange ~ token:", token)
    const tokenAccInWallet = await getAssociatedTokenAddress(
      token,
      wallet.publicKey,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    // console.log("🚀 ~ file: index.tsx:89 ~ exchange ~ tokenAccInWallet:", tokenAccInWallet)
    const checking_tokenAccInWallet = await connection1.getAccountInfo(
      tokenAccInWallet
    );
    // console.log(checking_tokenAccInWallet, "checking_tokenAccInWallet");

    if (checking_tokenAccInWallet === null) {
      let allocateTransaction = new Transaction({
        feePayer: wallet.publicKey,
      });
      allocateTransaction.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          tokenAccInWallet,
          wallet.publicKey,
          token,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );
      // console.log(allocateTransaction, "allocateTransaction");
      try {
        const signature = await wallet.sendTransaction(
          allocateTransaction,
          connection1
        );

        const result = await connection1.confirmTransaction(
          signature,
          "processed"
        );

        if (result.value.err) {
          // console.log("Sending", result.value.err);
          notifyError(`Error! ${result.value.err}`);
        } else {
          // console.log("transaction confirmed signature", signature);
          notifySuccess("Success! Transfered Successfully.");
          setTokenReceive(0)

          // setDisplayMessage("");
        }
      } catch (e) {
        console.log("error:", e);
        notifyError(`Error! ${e}`);
        setTokenReceive(0)

        // setDisplayMessage("");
      }
    }

    // let ata = await getAssociatedTokenAddress(
    //     token, // mint
    //     wallet.publicKey, // owner
    //     false // allow owner off curve
    // );
    // console.log(`ata: ${ata.toBase58()}`);

    //added ny rashid
    let adminWallet = new PublicKey(
      "HW1UxFjZz2ecmmjNtWZZ14XSPUV7hQsDJ3He8o5ewvum"
    );
    // console.log(adminWallet);
    //you can use ATA method that i provided you earlier to create reciver token account in admin wallet
    let adminReceiveTokenAccount;
    adminReceiveTokenAccount = await getAssociatedTokenAddress(
      receiverToken, // mint
      adminWallet, // owner
      false // allow owner off curve
    );
    // console.log(
    //   ` adminReceiveTokenAccount : ${adminReceiveTokenAccount.toBase58()}`
    // );

    const [_vault_account_pda, _vault_account_bump] =
      await PublicKey.findProgramAddress(
        // [Buffer.from(anchor.utils.bytes.utf8.encode("token-seed"))],
        // [wallet.publicKey.toBuffer()],
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("taker-token-seed")),
          wallet.publicKey.toBuffer(),
          new PublicKey(item?.tokenAddress).toBuffer(),
        ],
        program.programId
      );
    let taker_vault_account_pda = _vault_account_pda;
    // console.log(parseFloat(amount.padEnd(Number(item.decimal) + amount.length, "0")))
    let num = parseFloat(amount);
let decimalPlaces = parseInt(item.decimal);
let factor = Math.pow(10, decimalPlaces);
let formattedNum = Math.round(num * factor)
// console.log(formattedNum)

    const tx_exchange = await program.rpc
      .exchange(
        // new anchor.BN(takerAmount),
        new anchor.BN(formattedNum),
        // new anchor.BN(parseFloat(amount.padEnd((Number(item.decimal)+amount.length),'0'))),
        {
          accounts: {
            taker: wallet.publicKey,
            tokenAddressA: new PublicKey(item?.tokenAddress),
            tokenAddressB: new PublicKey(item?.receiverTokenAddress),
            takerDepositTokenAccount: receiverTokenAccInWallet, //takerTokenAccountB, receiverToken ATA
            takerReceiveTokenAccount: tokenAccInWallet, //takerTokenAccountA, token ATA
            initializerDepositTokenAccount: new PublicKey(item?.tokenATA), //initializerTokenAccountA,
            initializerReceiveTokenAccount: new PublicKey(
              item?.receiverTokenATA
            ), //initializerTokenAccountB,
            adminWallet,
            adminReceiveTokenAccount,
            initializer: new PublicKey(item?.ownerAddress), //initializerMainAccount.publicKey,
            escrowAccount: new PublicKey(item?.escrowAddress), //escrowAccount.publicKey,
            buyerEscrowAccount: buyerescrowAccount.publicKey, //new
            vaultAccount: new PublicKey(item?.vaultAccount),
            takerVaultAccount: taker_vault_account_pda, //new
            vaultAuthority: new PublicKey(vault_authority_pda),
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId, //new
            rent: anchor.web3.SYSVAR_RENT_PUBKEY, //new
          },
          instructions: [
            await program.account.buyerEscrowAccount.createInstruction(
              buyerescrowAccount
            ),
          ],
          signers: [buyerescrowAccount],
          // signers: [takerMainAccount]
        }
      )
      .catch((error) => {
        console.log(error);
        notifyError("Transaction failed!");
        setTokenReceive(0)
      });
    //@ts-ignore
    const deductAmount: any = (
      parseFloat(amount) / parseFloat(item?.price)
    ).toFixed(1);
    // console.log(deductAmount, "amount");
    const data = {
      id: item?._id,
      amount: parseFloat(item?.amount) - deductAmount,
    };

    if (tx_exchange !== undefined) {
      updateTokenAmount(data, deductAmount, item, setTokenReceive);
    }

    console.log(tx_exchange, 'tx_exchange');
  };

  const deleteData = (data: any) => {
    axios
      .post(BaseURL + "/launchpade/delete", data)
      .then((res) => {
        notifySuccess(res.data.status);
        getLists();
      })
      .catch((error) => notifyError(error));
  };

  const deleteLaunchpade = async () => {
    if (item?.expiryDate && moment(currentTime).isBefore(item?.expiryDate)) {
      return notifyError("You cannot cancel the launchpad before time end");
    }
    let vault_authority_pda = null;
    const [_vault_authority_pda, _vault_authority_bump] =
      await PublicKey.findProgramAddress(
        [Buffer.from(anchor.utils.bytes.utf8.encode("escrow"))],
        program.programId
      );
    vault_authority_pda = _vault_authority_pda;

    const cancel_tx = await program.rpc.cancel({
      accounts: {
        initializer: new PublicKey(item?.ownerAddress), //initializerMainAccount.publicKey,
        initializerDepositTokenAccount: new PublicKey(item?.tokenATA), //initializerTokenAccountA,
        vaultAccount: new PublicKey(item?.vaultAccount), //vault_account_pda,
        vaultAuthority: new PublicKey(vault_authority_pda), //vault_authority_pda,
        escrowAccount: new PublicKey(item?.escrowAddress), //escrowAccount.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      // signers: [initializerMainAccount]
    });
    // .catch(() => {
    //   notifyError('Transaction failed!')

    // })

    const data = {
      id: item?._id,
    };

    if (cancel_tx !== undefined) {
      deleteData(data);
      //   console.log(cancel_tx, 'cancel_tx');
    }
  };

  const clickHandler = async () => {
    if (!wallet.connected) {
      return notifyError("Please connect your wallet!");
    }
    setisOpen(true);
  };
  return (
    <>
      <Box
        className={styles.launchCards}
        sx={{ backgroundColor: value ? "#1e2122" : "#fff" }}
      >
        <Box className={styles.firstImg}>
          <img src={item?.imageURI} alt="" />
        </Box>
        <Typography
          sx={{ color: "rgba(0,0,0,0.85)", fontSize: "22px", pt: 1 }}
          variant="h1"
        >
          {item.name}
        </Typography>
        <Typography
          className="darkModeGrey"
          sx={{ color: "#888", fontSize: "16px", pt: 0.7 }}
          variant="h2"
        >
          {item?.receiverTokenSymbol}
        </Typography>
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", pt: 4 }}>
            <Typography
              sx={{ color: "rgba(0,0,0,0.85)", fontSize: "16px" }}
              variant="h5"
            >
              Supply :
            </Typography>
            <Typography sx={{ color: "#888", fontSize: "16px" }} variant="h6">
              {item?.amount}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1 }}>
            <Typography
              sx={{ color: "rgba(0,0,0,0.85)", fontSize: "16px" }}
              variant="h1"
            >
              Price :
            </Typography>
            <Typography sx={{ color: "#888", fontSize: "16px" }} variant="h2">
              {item?.price} {item?.receiverTokenSymbol}
            </Typography>
          </Box>
          <Box sx={{ outline: "1px solid #f0f0f0", mt: 1 }}></Box>
          <Typography
            sx={{ color: "#f95192", fontSize: "18px", pt: 1 }}
            variant="h3"
          >
            {item?.status}
          </Typography>
          {item?.expiryDate &&
          moment(currentTime).isBefore(item?.expiryDate) ? (
            <>
              <Typography
                className="customDarkPinkr"
                sx={{ color: "#888", fontSize: "16px", pt: 1, width: "292px" }}
                variant="h5"
              >
                Sale Ends In.
              </Typography>
              <Typography
                sx={{ color: "rgba(0,0,0,0.85)", fontSize: "18px", pt: 2 }}
                variant="h4"
              >
                {/* {Math.floor(d.asDays())}D:{(Math.floor((d.asDays() * 24)/1000))}H:{d.minutes()}
                M:{d.seconds()}S */}
                
                {/* {Math.floor(d.asHours())}H:{d.minutes()}
                M:{d.seconds()}S */}
               {Math.floor(days)}D: {Math.floor(hours)}H:{minutes}
                M:{seconds}S
              </Typography>
            </>
          ) : (
            <>
              <Typography
                className="customDarkPink"
                sx={{ color: "#f95192", fontSize: "18px", pt: 1 }}
                variant="h6"
              >
                Presale:
              </Typography>
              <p
                className="customDarkPink customHeight"
                style={{
                  color: "#f95192",
                  fontSize: "18px",
                  margin: "2px 0 0 0",
                }}
              >
                Ended
              </p>
            </>
          )}
          {item?.ownerAddress !== wallet.publicKey?.toBase58() ? (
            <>
              <button
                className={value ? "cardBtnBuyNight" : "cardBtnBuyDay"}
                onClick={clickHandler}
                style={{
                  display:
                    item?.expiryDate &&
                    !moment(currentTime).isBefore(item?.expiryDate)
                      ? "none"
                      : "block",
                }}
              >
                Buy
              </button>
            </>
          ) : (
            <button
              className={value ? "cancelBtnBuyNight" : "cancelBtnBuyDay"}
              onClick={deleteLaunchpade}
            >
              Cancel
            </button>
          )}
        </Box>
        <LaunchPadModal
          title="Confirmation"
          isOpen={isOpen}
          setisOpen={setisOpen}
          handleClose={handleClose}
          callExchange={exchange}
          item={item}
        />
      </Box>
    </>
  );
};
export default Card;
