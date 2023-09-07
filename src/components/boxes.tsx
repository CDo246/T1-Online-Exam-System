interface BoxContent {
  children: React.ReactNode;
}

export function FormBox({ children }: BoxContent) {
  return (
    <div className="grid flex-col items-center gap-4 rounded-3xl border-gray-600 bg-white p-5 ">
      {children}
    </div>
  );
}

export function GrowFormBox({ children }: BoxContent) {
  return (
    <div className="grid flex-1 flex-col items-center gap-4 rounded-3xl bg-white p-5 ">
      {children}
    </div>
  );
}
