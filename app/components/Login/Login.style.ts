import { Button, ButtonProps, styled, TextField, TextFieldProps } from '@mui/material';

const InputLogin = styled(TextField) <TextFieldProps>`
  width: 100%;
  
  & .MuiOutlinedInput-root {
    & .MuiOutlinedInput-notchedOutline {
      border: 1px solid #1F2937;
    }
    
    &:hover .MuiOutlinedInput-notchedOutline {
      border-color: #1F2937;
    }
    
    &.Mui-focused .MuiOutlinedInput-notchedOutline {
      border-color: #1F2937; 
      border-width: 2px;
    }
    
    & .MuiInputBase-input {
      color: #1F2937; 
    }
  }
  
  & .MuiInputLabel-root {
    color: #1F2937;
    
    &.Mui-focused {
      color: #1F2937;
    }
  }
  
  & .MuiFormHelperText-root {
    color: #1F2937; 
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