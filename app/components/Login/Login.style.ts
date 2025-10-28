import { Button, ButtonProps, styled, TextField, TextFieldProps } from '@mui/material';

const InputLogin = styled(TextField) <TextFieldProps>`
  width: 100%;
  
  & .MuiOutlinedInput-root {
    background-color: transparent;
    
    & .MuiOutlinedInput-notchedOutline {
      border: 1px solid #1F2937;
      background-color: transparent;
    }
    
    &:hover .MuiOutlinedInput-notchedOutline {
      border-color: #1F2937;
      background-color: transparent;
    }
    
    &.Mui-focused .MuiOutlinedInput-notchedOutline {
      border-color: #1F2937; 
      border-width: 2px;
      background-color: transparent;
    }
    
    & .MuiInputBase-input {
      color: #1F2937;
      background-color: transparent;
      
      &::placeholder {
        color: #6B7280;
      }
    }
  }
  
  & .MuiInputLabel-root {
    color: #1F2937;
    background-color: transparent;
    
    &.Mui-focused {
      color: #1F2937;
      background-color: transparent;
    }
  }
  
  & .MuiFormHelperText-root {
    color: #1F2937;
    background-color: transparent;
  }
`;
const LoginButton = styled(Button) <ButtonProps>`
    color: #f7fafdff;
    font-size: '1rem';
    font-weight: 600;
    border-color: '#4285F4';
    width: 100%;

`;


export {
  InputLogin,
  LoginButton
}