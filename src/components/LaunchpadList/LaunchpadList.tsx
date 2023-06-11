import React, { useEffect, useState } from "react";
import { Box, Grid } from "@mui/material";
// import options from "../LuanchListData";
import styles from "../LaunchpadList/styles.module.scss";
import { BaseURL } from "../../enviornment";
import { notifyError } from "../../apiConnection/notification.api";
import axios from "axios";
import Card from "./Card";
import useDarkMode from "use-dark-mode";

const LaunchpadList = () => {
    const [lists, setLists] = useState<any[]>([]);

    const getLists = async () => {
        await axios
            .get(BaseURL + "/launchpade/list")
            .then((res) => {
                // console.log(res, "response");
               const listData = res.data.list.filter((list:any) => !list.isDeleted)
                setLists(listData);
            })
            .catch((error) => notifyError(error));
    };

    useEffect(() => {
        getLists();
    }, []);
    // console.log(lists, "lists");
    const { value }: any = useDarkMode();
    return (
        <Box className="themeBg">
            <Box className={styles.luanchList}>
                <Box className={styles.container}>
                    <Box sx={{ px: { xs: 3 }, width: "100%" }}>
                        <Box className={styles.launchListBox} sx={{ backgroundColor: value ? "#242525" : "#fff" }}>
                            <Grid spacing={3} container>
                                {lists.length ? (
                                    lists?.map((list) => (
                                        <Grid item xs={12} md={6} xl={4}>
                                            <Card item={list} getLists={getLists} />
                                        </Grid>
                                    ))
                                ) : (
                                    <p style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#f95192", fontFamily: "Segoe_UI", padding: "80px" }}>No lists right now.</p>
                                )}
                            </Grid>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default LaunchpadList;
