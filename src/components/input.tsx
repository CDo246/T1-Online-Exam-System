import { ChangeEventHandler, SetStateAction } from "react"

interface InputConfig {
    name: string
    type: string,
    placeholder: string,
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>> //TODO: Try fixing
}

export function InputField({name, type, placeholder, value, setValue}: InputConfig) {
    return(
        <input
          className="rounded-xl border-2 border-black p-3"
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => setValue(e.target.value)}
        />
    )
}
