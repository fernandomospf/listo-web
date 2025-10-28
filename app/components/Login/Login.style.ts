import { Button, ButtonProps, styled, TextField, TextFieldProps } from '@mui/material';

const InputLogin = styled(TextField) <TextFieldProps>`
  width: 100%;
  
  && .MuiOutlinedInput-root {
    background-color: transparent !important;
  }
  
  && .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline {
    border: 1px solid #1F2937 !important;
    background-color: transparent !important;
  }
  
  && .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
    border-color: #1F2937 !important;
    background-color: transparent !important;
  }
  
  && .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: #1F2937 !important;
    border-width: 2px !important;
    background-color: transparent !important;
  }
  
  && .MuiOutlinedInput-input {
    color: #1F2937 !important;
    background-color: transparent !important;
    font-family: var(--font-poppins) !important;
  }
  
  && .MuiInputLabel-root {
    color: #1F2937 !important;
    background-color: transparent !important;
    font-family: var(--font-poppins) !important;
  }
  
  && .MuiFormHelperText-root {
    color: #1F2937 !important;
    background-color: transparent !important;
    font-family: var(--font-poppins) !important;
  }
`;

const LoginButton = styled(Button) <ButtonProps>`
    color: #f7fafdff;
    font-size: '1rem';
    font-weight: 600;
    border-color: '#4285F4';
    width: 100%;
    font-family: var(--font-poppins) !important;

`;


export {
  InputLogin,
  LoginButton
}