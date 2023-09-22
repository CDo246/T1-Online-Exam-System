interface ButtonText {
  text: string;
  disabled?: boolean;
}

export function BlackButton({ text, disabled }: ButtonText) {
  const className = disabled ? 
    "w-full rounded-xl border-2 border-gray-500 bg-gray-500 p-2 text-xl text-white" 
    : 
    "w-full rounded-xl border-2 border-black bg-black p-2 text-xl text-white"

  return (
    <button className={className}>
      {text}
    </button>
  );
}

export function WhiteButton({ text, disabled }: ButtonText) {
  const className = disabled?
    "w-full rounded-xl border-2 border-gray-500 p-2 text-xl"
    :
    "w-full rounded-xl border-2 border-black p-2 text-xl"

  return (
    <button className={className}>
      {text}
    </button>
  );
}

export function BlackBackButton() {
  return (
    <button className="rounded-xl border-2 border-black bg-black p-3 text-white">
      ←
    </button>
  );
}
