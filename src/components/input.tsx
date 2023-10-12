import { useState } from "react";
import validator from "validator";
import React from "react";
import { UserRoles } from "~/utils/enums";

export enum Validation {
  None = "None",
  NonEmpty = "NonEmpty",
  Email = "Email",
  Password = "Password",
  Role = "Role",
}

interface InputConfig {
  name: string;
  type: string;
  placeholder: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>; //TODO: Try fixing
  valid: boolean;
  setValid: React.Dispatch<React.SetStateAction<boolean>>;
  validation: Validation;
}

interface DropdownFieldProps {
  name: string;
  value: string;
  values: string[]; // Define as an array of strings
  setValue: React.Dispatch<React.SetStateAction<UserRoles>>;
}

function checkValidity(value: string, validation: Validation): boolean {
  if (validation === Validation.None) return true;
  else if (validation === Validation.NonEmpty && value !== "") return true;
  else if (validation === Validation.Email && validator.isEmail(value))
    return true;
  else if (
    validation === Validation.Password &&
    validator.isStrongPassword(value)
  )
    return true;
  return false;
}

function getInvalidReason(validation: Validation): string {
  switch (validation) {
    case Validation.NonEmpty:
      return "This field cannot be empty.";
    case Validation.Email:
      return "This field must contain a valid email address.";
    case Validation.Password:
      return "This field must contain a password at least 8 characters long, with 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol.";
    case Validation.Role:
      return "Role must be selected.";
    default:
      return "This error is in error.";
  }
}

export function InputField({
  name,
  type,
  placeholder,
  value,
  setValue,
  valid,
  setValid,
  validation,
}: InputConfig) {
  const validity = checkValidity(value, validation);
  if (validity !== valid) setValid(validity);

  return (
    <>
      <label>{name}:</label>
      <input
        className={`rounded-xl border-2 focus:outline-none ${
          valid ? "border-black" : "border-red-600"
        } p-3`}
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

export function DropdownField(props: DropdownFieldProps) {
  return (
    <>
      <label htmlFor={props.name} className="mb-1 block">
        {props.name}:
      </label>
      <select
        name={props.name}
        id={props.name}
        value={props.value}
        onChange={(e) => props.setValue(e.target.value as UserRoles)} // Cast to UserRoles
        className={`rounded-xl border-2 border-black p-3 focus:outline-none`}
      >
        {props.values.map((optionValue) => (
          <option key={optionValue} value={optionValue}>
            {optionValue}
          </option>
        ))}
      </select>
    </>
  );
}
