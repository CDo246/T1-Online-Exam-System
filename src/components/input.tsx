interface InputConfig {
    name: string
    type: string,
    placeholder: string,
}

export function InputField({name, type, placeholder}: InputConfig) {
    return(
        <input
          className="rounded-xl border-2 border-black p-3"
          name={name}
          type={type}
          placeholder={placeholder}
        />
    )
}
