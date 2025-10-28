import { Button, ButtonProps, styled, TextField, TextFieldProps } from '@mui/material';

const InputLogin = styled(TextField) <TextFieldProps>`
  width: 100%;
  font-family: var(--font-poppins) !important;
  
  & .MuiOutlinedInput-root {
    background-color: transparent !important;
    font-family: var(--font-poppins) !important;
    
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
    
    & .MuiInputBase-input {
      color: #1F2937 !important;
      background-color: transparent !important;
      font-family: var(--font-poppins) !important;
      font-weight: 400;
      
      &[type="password"] {
        color: #1F2937 !important;
        background-color: transparent !important;
        -webkit-text-fill-color: #1F2937 !important;
        font-family: var(--font-poppins) !important;
      }
    }
    
    & .MuiIconButton-root {
      color: #1F2937 !important;
    }
  }
  
  & .MuiInputLabel-root {
    color: #1F2937 !important;
    background-color: transparent !important;
    font-family: var(--font-poppins) !important;
    font-weight: 500;
    
    &.Mui-focused {
      color: #1F2937 !important;
      background-color: transparent !important;
      font-family: var(--font-poppins) !important;
    }
  }
  
  & .MuiFormHelperText-root {
    color: #1F2937 !important;
    background-color: transparent !important;
    font-family: var(--font-poppins) !important;
    font-weight: 400;
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