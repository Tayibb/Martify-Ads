import React, { useRef, useState } from "react";
import styles from "../CreateToken/styles.module.scss";
import { Typography, Box } from "@mui/material";
import { useFormik } from "formik";
import { CreateTokenValidation } from "../../schema";
import { Keypair, Transaction, SystemProgram } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { findMetadataPda } from "@metaplex-foundation/js";
import {
  DataV2,
  createCreateMetadataAccountV2Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import { usePinataUpload } from "../../hooks/pinata";
import {
  notifyError,
  notifySuccess,
} from "../../apiConnection/notification.api";
import Loader from "../Loader/Loader";
import useDarkMode from "use-dark-mode";

// Special setup to add a Buffer class, because it's missing
window.Buffer = window.Buffer || require("buffer").Buffer;

let initialValues = {
  name: "",
  symbol: "",
  supply: "",
  description: "",
  decimal: "",
  tokenImage: "",
};

const CreateToken = () => {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const [image, setImage] = useState("");
  const [displayMessage, setDisplayMessage] = useState("");
  const [loader, setLoader] = useState(false);
  const [imageError, setImageError] = useState("");

  const fileRef = useRef('');

  const { mutate: mutatePinata } = usePinataUpload();
  const fromWallet = Keypair.generate();

  async function createToken(URI: any, values: any) {
    if (!connection || !publicKey) {
      return;
    }
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    const metadataPDA = await findMetadataPda(fromWallet.publicKey);
    const tokenATA = await getAssociatedTokenAddress(
      fromWallet.publicKey,
      publicKey
    );
    const tokenMetadata = {
      name: values.name,
      symbol: values.symbol,
      uri: URI,
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    } as DataV2;

    const createNewTokenTransaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: fromWallet.publicKey,
        space: MINT_SIZE,
        lamports: lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        fromWallet.publicKey,
        parseInt(values.decimal),
        publicKey,
        publicKey,
        TOKEN_PROGRAM_ID
      ),
      createAssociatedTokenAccountInstruction(
        publicKey,
        tokenATA,
        publicKey,
        fromWallet.publicKey
      ),
      createMintToInstruction(
        fromWallet.publicKey,
        tokenATA,
        publicKey,
        parseInt(values.supply) * Math.pow(10, parseInt(values.decimal))
      ),
      createCreateMetadataAccountV2Instruction(
        {
          metadata: metadataPDA,
          mint: fromWallet.publicKey,
          mintAuthority: publicKey,
          payer: publicKey,
          updateAuthority: publicKey,
        },
        {
          createMetadataAccountArgsV2: {
            data: tokenMetadata,
            isMutable: false,
          },
        }
      )
    );

    const TokenTxn = await sendTransaction(
      createNewTokenTransaction,
      connection,
      {
        signers: [fromWallet],
      }
    )
      .then((res) => {
        console.log(res);
        return res;
      })
      .catch((error) => console.log(error));

    return TokenTxn;
  }

  const getFile = (e: any) => {
    const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
    if (e.target.files.length === 0) {
      setImage("");
      setImageError("Image is required");
    } else if (
      e.target.files.length > 0 &&
      SUPPORTED_FORMATS.includes(e.target.files[0].type)
    ) {
      setImage(e.target.files[0]);
      setImageError("");
    } else {
      setImageError(
        "Only the following formats are accepted: .jpeg, .jpg, .png, .webp"
      );
      setImage("");
    }
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
    validateOnMount: true,
    validationSchema: CreateTokenValidation,
    onSubmit: async (values: any, action: any) => {
      if (!connected) {
        return notifyError("Please connect your wallet!");
      }
      if (!connection || !publicKey) {
        return;
      }
      if (image === "") {
        return setImageError("Image is required");
      }
      const walletBalance = await connection.getBalance(publicKey);
      if (walletBalance <= 0) {
        // initialValues = initialValues;
        setLoader(false);
        return notifyError("Balance is insuficiant!");
      }
      const formData = new FormData();
      formData.append("file", image);
      setLoader(true);
      setDisplayMessage("Uploading to Pinata...");
      try {
        mutatePinata(formData, {
          onSuccess: (res) => {
            const jsonData = {
              name: values.name,
              symbol: values.symbol,
              description: values.description,
              image: "https://gateway.pinata.cloud/ipfs/" + res.IpfsHash,
            };
            const json = JSON.stringify(jsonData);
            const blob = new Blob([json], { type: "text/json" });
            const formDataJSON = new FormData();
            formDataJSON.append("file", blob);
            mutatePinata(formDataJSON, {
              onSuccess: async (resJSON) => {
                const URI =
                  "https://gateway.pinata.cloud/ipfs/" + resJSON.IpfsHash;
                setDisplayMessage("Minting...");
                const tx = await createToken(URI, values);
                if (tx) {
                  notifySuccess("Token created successfully!");
                  // initialValues = initialValues;
                  action.resetForm();
                  setImage("");
                  setLoader(false);
                   //@ts-ignore
        fileRef.current.value = ''
                } else {
                  notifyError("Transaction failed!");
                  setLoader(false);
                  // initialValues = initialValues;
                  action.resetForm();
                  setImage("");
                   //@ts-ignore
        fileRef.current.value = ''
                }
              },
            });
          },
        });
      } catch (error) {
        notifyError(error);
        setLoader(false);
        // initialValues = initialValues;
        action.resetForm();
        setImage("");
        //@ts-ignore
        fileRef.current.value = ''
      }
    },
  });
  
  const { value }: any = useDarkMode();
  return (
    <Box className="themeBg">
      <Box className={styles.createToken}>
        <Box className={styles.container}>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Box sx={{ px: { xs: 3 } }}>
              <Box
                className={styles.createTokenFormBox}
                sx={{ backgroundColor: value ? "#242525" : "#fff" }}
              >
                <Box>
                  <Typography variant="h1">(*) is required field</Typography>
                </Box>
                <form onSubmit={handleSubmit}>
                  <div className={styles.formStyle}>
                    <label htmlFor="name">
                      Name <span>*</span>
                    </label>
                    <br />
                    <input
                      className={
                        errors.name && touched.name ? styles.errorBorder : ""
                      }
                      type="text"
                      name="name"
                      id="name"
                      placeholder="Name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.name && touched.name ? (
                      <p className={styles.formErrors}>{errors.name}</p>
                    ) : null}
                  </div>
                  <div className={styles.formStyle}>
                    <label htmlFor="symbol">
                      Symbol <span>*</span>
                    </label>
                    <br />
                    <input
                      type="text"
                      name="symbol"
                      id="symbol"
                      placeholder="Ex: ETH"
                      className={
                        errors.symbol && touched.symbol
                          ? styles.errorBorder
                          : ""
                      }
                      value={values.symbol}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.symbol && touched.symbol ? (
                      <p className={styles.formErrors}>{errors.symbol}</p>
                    ) : null}
                  </div>
                  <div className={styles.formStyle}>
                    <label htmlFor="description">
                      Description <span>*</span>
                    </label>
                    <br />
                    <input
                      type="text"
                      name="description"
                      id="description"
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Description"
                    />
                    {errors.description && touched.description ? (
                      <p className={styles.formErrors}>{errors.description}</p>
                    ) : null}
                  </div>
                  <div className={styles.formStyle}>
                    <label htmlFor="supply">
                      Total Supply <span>*</span>
                    </label>
                    <br />
                    <input
                      type="number"
                      name="supply"
                      id="supply"
                      placeholder="Ex: 1000000000"
                      className={
                        errors.supply && touched.supply
                          ? styles.errorBorder
                          : ""
                      }
                      value={values.supply}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.supply && touched.supply ? (
                      <p className={styles.formErrors}>{errors.supply}</p>
                    ) : null}
                  </div>
                  <div className={styles.formStyle}>
                    <label htmlFor="decimal">
                      Decimal <span>*</span>
                    </label>
                    <br />
                    <input
                      type="number"
                      name="decimal"
                      id="decimal"
                      placeholder="Decimal"
                      className={
                        errors.decimal && touched.decimal
                          ? styles.errorBorder
                          : ""
                      }
                      value={values.decimal}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.decimal && touched.decimal ? (
                      <p className={styles.formErrors}>{errors.decimal}</p>
                    ) : null}
                  </div>
                  <div className="tokenFileChosen">
                    <input
                    //@ts-ignore
                    ref={fileRef}
                      name="tokenImage"
                      type="file"
                      id="file-input"
                      onChange={(e) => getFile(e)}
                    />
                    {imageError !== "" ? (
                      <p className={styles.formErrors}>{imageError}</p>
                    ) : null}
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <button
                      disabled={
                        !isValid ||
                        values.name === "" ||
                        values.symbol === "" ||
                        values.description === "" ||
                        values.decimal === "" ||
                        values.supply === "" ||
                        loader 
                      }
                      className={
                        !isValid ||
                        values.name === "" ||
                        values.symbol === "" ||
                        values.description === "" ||
                        values.decimal === "" ||
                        values.supply === "" ||
                        loader
                          ? "disableBtn"
                          : ""
                      }
                      type="submit"
                    >
                      {loader ? (
                        <div>
                          <Loader />
                        </div>
                      ) : (
                        "Create Token"
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

export default CreateToken;
