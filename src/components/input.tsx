import { useState } from "react";
import validator from "validator"

export enum Validation{
  None = "None",
  NonEmpty = "NonEmpty",
  Email = "Email",
  Password = "Password",
}

interface InputConfig {
  name: string;
  type: string;
  placeholder: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>; //TODO: Try fixing
  valid: boolean;
  setValid: React.Dispatch<React.SetStateAction<boolean>>;
  validation: Validation
}

function checkValidity(value: string, validation: Validation): boolean {
  if(validation === Validation.None) return true
  else if(validation === Validation.NonEmpty && value !== "") return true
  else if(validation === Validation.Email && validator.isEmail(value)) return true
  else if(validation === Validation.Password && validator.isStrongPassword(value)) return true
  return false
}

function getInvalidReason(validation: Validation): string {
  if(validation === Validation.NonEmpty) return "This field cannot be empty."
  else if(validation === Validation.Email) return "This field must contain a valid email address."
  else if(validation === Validation.Password) return "This field must contain a password at least 8 characters long, with 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol."
  return "This error is in error."
}

export function InputField({
  name,
  type,
  placeholder,
  value,
  setValue,
  valid,
  setValid,
  validation
  }: InputConfig) {
  
  let validity = checkValidity(value, validation)
  if(validity !== valid) setValid(validity)

  return (
    <>   
      <label>{name}:</label> 
      <input
        className={`rounded-xl focus:outline-none border-2 ${valid ? "border-black" : "border-red-600"} p-3`}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {!valid && <p className="text-red-600">{getInvalidReason(validation)}</p>}
    </>
  );
}
