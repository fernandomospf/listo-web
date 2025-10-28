import { Button, ButtonProps, styled, TextField, TextFieldProps } from '@mui/material';

const InputLogin = styled(TextField) <TextFieldProps>`
  width: 100%;
  
  & .MuiOutlinedInput-root {
    background-color: transparent !important;
    
    & {
      background-color: transparent !important;
    }
    
    & .MuiOutlinedInput-notchedOutline {
      border: 1px solid #1F2937 !important;
      background-color: transparent !important;
    }
    
    &:hover .MuiOutlinedInput-notchedOutline {
      border-color: #1F2937 !important;
      background-color: transparent !important;
    }
    
    &.Mui-focused .MuiOutlinedInput-notchedOutline {
      border-color: #1F2937 !important; 
      border-width: 2px !important;
      background-color: transparent !important;
    }
    
    &.Mui-filled {
      background-color: transparent !important;
    }
    
    & .MuiOutlinedInput-input {
      color: #1F2937 !important;
      background-color: transparent !important;
      font-family: var(--font-poppins) !important;
      
      & {
        background-color: transparent !important;
      }
      
      &:-webkit-autofill,
      &:-webkit-autofill:hover,
      &:-webkit-autofill:focus,
      &:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
        -webkit-text-fill-color: #1F2937 !important;
        background-color: transparent !important;
        background-clip: content-box !important;
      }
    }
  }
  
  & .MuiInputLabel-root {
    color: #1F2937 !important;
    background-color: transparent !important;
    font-family: var(--font-poppins) !important;
    
    &.Mui-focused {
      color: #1F2937 !important;
      background-color: transparent !important;
    }
    
    &.MuiFormLabel-filled {
      background-color: transparent !important;
    }
  }
  
  & .MuiFormHelperText-root {
    color: #1F2937 !important;
    background-color: transparent !important;
    font-family: var(--font-poppins) !important;
  }
  
  & .MuiInputBase-root {
    background-color: transparent !important;
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