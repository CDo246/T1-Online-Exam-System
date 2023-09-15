interface ButtonText {
  text: string;
}

export function BlackButton({ text }: ButtonText) {
  return (
    <button className="w-full rounded-xl border-2 border-black bg-black p-2 text-xl text-white">
      {text}
    </button>
  );
}

export function WhiteButton({ text }: ButtonText) {
  return (
    <button className="w-full rounded-xl border-2 border-black p-2 text-xl">
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
