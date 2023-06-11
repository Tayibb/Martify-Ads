import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import styles from "../ClaimListData/styles.module.scss";
import moment from "moment";

const ClaimListRow = ({ claimList, params }: any) => {
    const [currentTime, setCurrentTime] = useState(moment());
    const [targetTime, setTargetTime] = useState(moment());
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
    useEffect(() => {
        if (params && params?.row?.expiryDate && params?.row?.expiryDate !== "") {
            setTargetTime(moment(params?.row?.expiryDate));
        }
    }, [params]);
    return (
        <div className={styles.TokenColText}>
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
        </div>
    );
};

export default ClaimListRow;

export const CliamListBtn = ({ claimList, params, claimTokens }: any) => {
    const [currentTime, setCurrentTime] = useState(moment());
    const [targetTime, setTargetTime] = useState(moment());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(moment());
        }, 1000);

        return () => clearInterval(interval);
    }, []);
    useEffect(() => {
        if (params && params?.row?.expiryDate && params?.row?.expiryDate !== "") {
            setTargetTime(moment(params?.row?.expiryDate));
        }
    }, [params]);
    return (
        <div className={styles.ActionCol}>
            <button
                disabled={moment(currentTime).isBefore(claimList.length && params?.row?.expiryDate)}
                className={moment(currentTime).isBefore(claimList.length && params?.row?.expiryDate) ? "disableBtn" : ""}
                onClick={async () => claimTokens(params)}
            >
                Claim
            </button>
        </div>
    );
};
