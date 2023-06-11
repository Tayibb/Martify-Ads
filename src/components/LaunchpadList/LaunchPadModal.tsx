import React, { useState } from "react";
import { Modal, Box, Typography } from "@mui/material";

import { numericWithDecimal } from "../validations";
// import { CandyMachineBotTaxError } from "@metaplex-foundation/js";
import useDarkMode from "use-dark-mode";
const style1 = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  "@media (max-width:575px)": {
    width: "330px",
  },
  "@media (max-width:485px)": {
    width: "250px",
  },
  background: "#fff",
  "&:focus": {
    outline: "none",
  },
  boxShadow: 24,
  borderRadius: "10px",
  p: 5,
};
const modalHeading1 = {
  fontSize: "28px",
  "@media (max-width:767px)": {
    fontSize: "24px",
  },
  "@media (max-width:575px)": {
    fontSize: "22px",
  },
  "@media (max-width:485px)": {
    fontSize: "20px",
  },
  fontWeight: "700",
  fontFamily: "Segoe_UI",
  color: "#10202F",
  marginBottom: "20px",
};
const InputField = {
  width: "300px",
  "@media (max-width: 767px)": {
    width: "200px",
  },
  height: "30px",
  border: "1px solid #d9d9d9",
  outline: "none",
  padding: "5px 10px",
  borderRadius: "4px",
  fontSize: "14px",
  fontFamily: "Segoe_UI",
  marginTop: "5px",
};
const LaunchPadModal = ({
  title,
  isOpen,
  setisOpen,
  handleClose,
  callExchange,
  item,
}: any) => {
  const [amount, setAmount] = useState("");
  const [tokenRecive, setTokenReceive] : any = useState(0);

  const getAmount = (e: any) => {
    const validate = numericWithDecimal(e.target.value);
    if (validate) {
      setAmount(e.target.value);
      //@ts-ignore
      setTokenReceive(
        (parseFloat(e.target.value) / parseFloat(item?.price)).toFixed(1)
      );
    } else {
      setAmount("");
    }
  };

  const confirm = () => {
    callExchange(amount,setTokenReceive);
    setisOpen(false);
    setAmount("");
  };
  const { value }: any = useDarkMode();
  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={isOpen}
      onClose={handleClose}
    >
      <Box sx={style1} style={{ backgroundColor: value ? "#242525" : "#fff" }}>
        <Typography sx={modalHeading1} variant="h1">
          {title}
        </Typography>
        <Box>
          <Box>
            <label
              style={{
                color: "#222",
                fontFamily: "Segoe_UI",
                fontWeight: "900",
                fontSize: "14px",
              }}
              htmlFor="amount"
            >
              Amount :-
            </label>
            <br />
            <input
              style={InputField}
              type="text"
              name="amount"
              id="amount"
              placeholder="Transfer Amount"
              value={amount}
              onChange={(e) => getAmount(e)}
              className="modalInput"
            />
          </Box>
          <p
            className="modalConverterText"
            style={{
              fontSize: "12px",
              marginBottom: "10px",
              color: value ? "#f95997" : "rgb(0, 188, 212)",
              marginTop: "5px",
              fontWeight: "900",
              fontFamily: "Segoe_UI",
            }}
          >
            You will receive {tokenRecive || 0} tokens!
          </p>
          <Box sx={{ mt: 3 }}>
            <button
              style={{
                background: value ? "#3b0619" : "#f95997",
                width: "100px",
                height: "36px",
                fontSize: "16px",
                borderRadius: "4px",
                cursor: "pointer",
                color: value ? "#f95997" : "#fff",
                marginRight: "10px",
                fontFamily: "Segoe_UI",
                border: "none",
              }}
              onClick={confirm}
              type="submit"
              disabled={amount === ""}
              className={amount === "" ? "disableBtn" : ""}
            >
              Confirm
            </button>
            <button
              style={{
                width: "100px",
                height: "35px",
                fontSize: "16px",
                borderRadius: "4px",
                cursor: "pointer",
                background: value ? "#1e2122" : "#f3f3f4",
                color: value ? "#c9c8c5" : "#222",
                fontFamily: "Segoe_UI",
                border: "none",
              }}
              onClick={handleClose}
            >
              Cancel
            </button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default LaunchPadModal;
