import { postRequest } from "../apiConnection/api";
import { useMutation } from "react-query";

const pinataURL = "https://api.pinata.cloud/pinning/pinFileToIPFS";

export function usePinataUpload() {
  const fn = (values) =>
    postRequest(pinataURL, values, {
      pinata_api_key:
        // '3b9908a3dc62146b69d9',
        //  '8039638b9503742b5bf7',
        // "1db5c617462ecf2bd622",
        '896fed676929f0ca9f70',
      pinata_secret_api_key:
        // '4779485d3903763c6d28d56655988cf33f2692f8ff3865cf4edddce16a5be62d'
        // '9f433162a615aef30b7975585c5bf6db4b2472d516f681068443a26a6befacce',
        // "dad68b27e1297adaf61664616a42f2f4e7807aaa6f4d2112c915e87e68a959ff",
        '4c2dc275ed440d218a49de3f9cb35b77b6c074b3bce9adddeeb1665b072ac6dc'
    });
  return useMutation(fn, {
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.log("There was a problem while updating information " + error);
    },
  });
}
