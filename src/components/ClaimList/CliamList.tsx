import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import styles from "../ClaimList/styles.module.scss";
import axios from "axios";
import { BaseURL } from "../../enviornment";
import { useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import idl from "../../idl/anchor_token_sale.json";
import useDarkMode from "use-dark-mode";
import ClaimListRow, { CliamListBtn } from "./ClaimListRow";
import { PublicKey } from "@solana/web3.js";
import { rows, columns } from "../ClaimListData/index";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { notifyError, notifySuccess } from "../../apiConnection/notification.api";
import moment from "moment";
const CliamList = () => {
    const [claimList, setClaimList]: any = useState([]);

    const [currentTime, setCurrentTime] = useState(moment());
    const [targetTime, setTargetTime] = useState(moment());

    const wallet = useWallet();

    const connection1 = new anchor.web3.Connection("https://api.devnet.solana.com");
    const options = anchor.AnchorProvider.defaultOptions();
    //@ts-ignore
    const provider = new anchor.AnchorProvider(connection1, wallet, options);

    const { value }: any = useDarkMode();

    var ms = moment(targetTime, "DD/MM/YYYY HH:mm:ss").diff(moment(currentTime, "DD/MM/YYYY HH:mm:ss"));
    var d = moment.duration(ms);
    ////Get Days and subtract from duration
    var days = d.days();
    d.subtract(days, "days");

    //Get hours and subtract from duration
    var hours = d.hours();
    d.subtract(hours, "hours");

    //Get Minutes and subtract from duration
    var minutes = d.minutes();
    d.subtract(minutes, "minutes");

    //Get seconds
    var seconds = d.seconds();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(moment());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const getClaimList = async () => {
        axios.post(BaseURL + "/exchange/list", { user: wallet.publicKey?.toBase58() }).then((res) => {
            setClaimList(res.data.claimList);
            res.data.claimList.length &&
                res.data.claimList.map((claim: any) => {
                    if (claim && claim.expiryDate && moment(currentTime).isBefore(claim.expiryDate)) {
                        setTargetTime(moment(claim.expiryDate));
                    }
                });
        });
    };

    useEffect(() => {
        getClaimList();
    }, [wallet]);

    if (!provider) {
        return null;
    }
    const a = JSON.stringify(idl);
    const b = JSON.parse(a);

    const program = new anchor.Program(b, idl.metadata.address, provider);

    const deleteClaim = (data: any) => {
        axios
            .post(BaseURL + "/exchange/delete", data)
            .then(async() => {
                notifySuccess("Claimed successfully!");
                await getClaimList()
            })
            .catch(() => notifyError("Failed to calim!"));
    };

    const claimTokens = async (params: any) => {
        const item = params?.row;
        let vault_authority_pda = null;

        const [_vault_authority_pda, _vault_authority_bump] = await PublicKey.findProgramAddress([Buffer.from(anchor.utils.bytes.utf8.encode("escrow"))], program.programId);
        vault_authority_pda = _vault_authority_pda;
        if (!wallet.publicKey) {
            return null;
        }
        //token ATA buyer will submit
        const receiverToken = new PublicKey(item?.tokenAddressB); //e.g USDT

        const receiverTokenAccInWallet = await getAssociatedTokenAddress(receiverToken, wallet.publicKey, true, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
        // let receiverAtA = await getAssociatedTokenAddress(
        //   receiverToken, // mint
        //   wallet.publicKey, // owner
        //   false // allow owner off curve
        // );

        //reward token address
        const token = new PublicKey(item?.tokenAddressA);
        const tokenAccInWallet = await getAssociatedTokenAddress(token, wallet.publicKey, true, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);

        // let ata = await getAssociatedTokenAddress(
        //   token, // mint
        //   wallet.publicKey, // owner
        //   false // allow owner off curve
        // );

        let adminWallet = new PublicKey("HW1UxFjZz2ecmmjNtWZZ14XSPUV7hQsDJ3He8o5ewvum");
        // let adminReceiveTokenAccount;
        // adminReceiveTokenAccount = await getAssociatedTokenAddress(
        //   receiverToken, // mint
        //   adminWallet, // owner
        //   false // allow owner off curve
        // );

        const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
            [Buffer.from(anchor.utils.bytes.utf8.encode("taker-token-seed")), wallet.publicKey.toBuffer(), new PublicKey(item?.tokenAddressA).toBuffer()],
            program.programId
        );
        let taker_vault_account_pda = _vault_account_pda;

        const tx_claim = await program.rpc
            .claim({
                accounts: {
                    taker: wallet.publicKey,
                    tokenAddressA: new PublicKey(item?.tokenAddressA),
                    tokenAddressB: new PublicKey(item?.tokenAddressB),
                    takerDepositTokenAccount: receiverTokenAccInWallet,
                    takerReceiveTokenAccount: tokenAccInWallet,
                    buyerEscrowAccount: new PublicKey(item?.buyerEscrowAccount),
                    takerVaultAccount: taker_vault_account_pda,
                    vaultAuthority: vault_authority_pda,
                    tokenProgram: TOKEN_PROGRAM_ID,
                },
            })
            .then()
            .catch((error) => {
                notifyError("Transaction failed!");
            });

        const data = {
            id: item?._id,
        };

        if (tx_claim !== undefined) {
            deleteClaim(data);
        }
    };

    interface ClaimListTypes {
        _id: number;
        imageURI: any;
        name: string;
        price: string;
        tokens: string;
        // tokenNumber: string;
    }

    const rows: ClaimListTypes[] = claimList;
    const columns: GridColDef[] = [
        {
            field: "name",
            headerName: "Name",
            width: 300,
            headerClassName: "column-header-name",
            cellClassName: "column-cell-name",
            renderCell: (params) => (
                <>
                    <Box className={styles.nameColImg}>
                        <img src={params.row.imageURI} alt={params.row.name} />
                    </Box>
                    <Box className={styles.nameColText}>
                        <p>{params.row.name}</p>
                        <p>{params.row.price} USDT</p>
                    </Box>
                </>
            ),
        },
        {
            field: "labelToken",
            headerName: "Token",
            width: 300,
            headerClassName: "column-header-token",
            cellClassName: "column-cell-token",
            renderCell: (params) => (
                <>
                    <div className={styles.TokenColText}>
                        <p>{params.row.tokens}</p>
                        {/* <p>{params.row.tokenNumber}</p> */}
                    </div>
                </>
            ),
        },
        {
            field: "PresaleTimer",
            headerName: "Presale ends in",
            width: 300,
            headerClassName: "column-header-token",
            cellClassName: "column-cell-token",
            renderCell: (params: any) => (
                <>
                    {/* <div className={styles.TokenColText}>
                        {claimList.length && params?.row?.expiryDate && moment(currentTime).isBefore(claimList.length && params?.row?.expiryDate) ? (
                            <p>
                                {Math.floor(days)}D: {Math.floor(hours)}H:{minutes}
                                M:{seconds}S
                            </p>
                        ) : (
                            <Typography className="customDarkPinkr" sx={{ color: "#f95192", fontSize: "16px", pt: 1, width: "292px" }} variant="h5">
                                Presale Ended.
                            </Typography>
                        )}
                    </div> */}
                    <ClaimListRow claimList={claimList} params={params} />
                </>
            ),
        },
        {
            field: "action",
            headerName: "Action",
            headerClassName: "column-header-action",
            cellClassName: "column-cell-action",
            width: 150,
            renderCell: (params: any) => (
                <>
                    <CliamListBtn claimList={claimList} params={params} claimTokens={claimTokens} />
                </>
            ),
        },
    ];

    return (
        <Box className="themeBg">
            <Box className={styles.claimList}>
                <Box className={styles.container}>
                    <Box sx={{ px: 3 }}>
                        <Box sx={{ display: "flex", justifyContent: "center", px: 3 }}>
                            <Box className={styles.claimListBox} sx={{ backgroundColor: value ? "#242525" : "#fff" }}>
                                <p style={{ color: "#f95192", fontFamily: "Segoe_UI" }}>Note: The tokens can only be claimed after the presale ends.</p>
                                <DataGrid
                                    autoHeight
                                    getRowId={(row) => row._id}
                                    rows={rows}
                                    columns={columns}
                                    rowHeight={90}
                                    initialState={{
                                        pagination: {
                                            paginationModel: { pageSize: 5, page: 5 },
                                        },
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default CliamList;
