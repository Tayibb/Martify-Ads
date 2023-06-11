import React, { useEffect, useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
import styles from "../HomePage/styles.module.scss";
import {  EcosystemCards, toolCards } from "../../components/HomeMapData/HomeMapData";
import useDarkMode from "use-dark-mode";
import { Link } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../../enviornment";
import { notifyError } from "../../apiConnection/notification.api";

const HomePage = () => {
    const { value }: any = useDarkMode();

    const [lists, setLists] : any = useState('');
    const [details, setDetails] : any = useState('');

  const getLists = async () => {
    await axios
      .get(BaseURL + "/launchpade/list")
      .then((res) => {
        // console.log(res, "response");
        setLists(res.data.totalAmount[0]);
      })
      .catch((error) => notifyError(error));
  };

  const getDetails = async () => {
    await axios
      .get(BaseURL + "/exchange/details")
      .then((res) => {
        // console.log(res, "response");
        setDetails(res.data.details.totalAmount[0]);
      })
      .catch((error) => notifyError(error));
  };

  useEffect(() => {
    getLists();
    getDetails()
  }, []);
    const counterCards = [
        {
            id: 0,
            counter: details !== undefined ? `$${details?.totalAmount}`  : "$0",
            text: "Total Liquidity Raised",
        },
        {
            id: 1,
            counter: lists !== undefined ? `${lists?.count}` : "0",
            text: "Total Projects",
        },
        {  
            counter: details !== undefined ? details?.count + lists?.count : "0",
            text: "Total Participants",
        },
        {
            id: 4,
            counter: lists !== undefined ? `$${lists?.totalAmount}` : "$0",
            text: "Total Values Locked",
        },
    ];
    return (
        <Box className="themeBg">
            <Box className={styles.home}>
                <Box className={styles.container}>
                    <Box sx={{ pt: 6 }}>
                        <Typography className={styles.homeHeadings} variant="h1">
                            The Launchpad Protocol for Everyone!
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <p>Martify helps everyone to create their own tokens and token sales in few seconds. Tokens created on Martify will be verified and published on explorer websites.</p>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "center", pt: 1 }}>
                            <Link to='/Launchpad/CreateLunchpad'>
                            <button>Create Now</button>
                            </Link>
                            <button onClick={() => window.open('https://docs.martify.finance/')}>Learn More</button>
                        </Box>
                        <Grid container spacing={3} sx={{ display: "flex", justifyContent: "center", pt: 5, px: 5 }}>
                            {counterCards &&
                                counterCards.map((option) => (
                                    <Grid item xs={12} md={6} xl={3} key={option.id}>
                                        <Box className={styles.counterCards} sx={{ backgroundColor: value ? "#242525" : "#fff" }}>
                                            <Box>
                                                <Typography variant="h2">{option.counter}</Typography>
                                                <Typography variant="h3">{option.text}</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                ))}
                        </Grid>
                    </Box>
                    <Box sx={{ pt: 3 }}>
                        <Typography className={styles.homeHeadings} variant="h4">
                            A Suite of Tools for Token Sales.
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <p>A suite of tools were built to help you create your own tokens and launchpads in a fast, simple and cheap way, with no prior code knowledge required and 100% decentralized!</p>
                        </Box>
                        <Grid container spacing={3} sx={{ display: "flex", justifyContent: "center", pt: 5, px: 5 }}>
                            {toolCards &&
                                toolCards.map((option) => (
                                    <Grid item xs={12} md={6} xl={3} key={option.id}>
                                        <Box className={styles.toolCards} sx={{ backgroundColor: value ? "#242525" : "#fff" }}>
                                            <Box>
                                                <Box sx={{ display: "flex", justifyContent: "center" }}>
                                                    <img src={option.image} alt="" />
                                                </Box>
                                                <Typography variant="h5">{option.label}</Typography>
                                                <Typography variant="h6">{option.text}</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                ))}
                        </Grid>
                    </Box>
                    <Box sx={{ pt: 3 }}>
                        <Typography className={`${styles.homeHeadings} ${styles.customHeadings}`} variant="h1">
                            A Growing Protocol Ecosystem.
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <p>We build a suite of tools for the world of decentralized finance. PinkMoon, Martify, PinkElon PinkLock, PinkSwap, we Pink everything!</p>
                        </Box>
                        <Grid container spacing={3} sx={{ display: "flex", justifyContent: "center", pt: 5, px: 5 }}>
                            {EcosystemCards &&
                                EcosystemCards.map((option) => (
                                    <Grid item xs={12} md={6} xl={3} key={option.id}>
                                        <Box className={styles.EcosystemCards} sx={{ backgroundColor: value ? "#242525" : "#fff" }}>
                                            <Box>
                                                <Box sx={{ display: "flex", justifyContent: "center" }}>
                                                    <img src={option.image} alt="" />
                                                </Box>
                                                <Typography variant="h2">{option.label}</Typography>
                                                <Typography variant="h3">{option.text}</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                ))}
                        </Grid>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default HomePage;
