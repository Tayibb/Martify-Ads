import * as Yup from "yup";

export const CreateTokenValidation = Yup.object().shape({
  name: Yup.string()
    .matches(/^[a-zA-Z ]+$/, "Token name can only contain alphabets")
    .trim()
    .required("Token name cannot be blank"),
  symbol: Yup.string()
    .matches(/^[a-zA-Z]+$/, "Token symbol can only contain alphabets")
    .required("Token symbol is a required field"),
  description: Yup.string().trim().required("Description is required"),
  supply: Yup.number()
    .required("Total supply is a required field")
    .min(2, "Total supply must be greater than 1"),
    // .max(1000000,'Total supply must be less than or equal to 1M'),
  decimal: Yup.number()
    .required("Decimal is a required field")
    .min(1, "Decimal value must be greater than 0")
    .max(9, "Decimal value must be less than or equal to 9"),
});

export const LaunchPadValidation = Yup.object().shape({
  amount: Yup.string().required("Please enter a valid amount"),
  price: Yup.string().required("Please enter a valid price"),
  // select: Yup.string().required("Please Select a Option"),
});

export const GumdropValidation = Yup.object().shape({
  amount: Yup.string().required("Please write your amount"),
});
