interface BoxContent {
  children?: React.ReactNode;
}

export function FormBox({ children }: BoxContent) {
  return (
    <div className="grid min-w-[75vw] flex-col items-center gap-4 rounded-3xl border-gray-600 bg-white p-5">
      {children}
    </div>
  );
}

export function GrowFormBox({ children }: BoxContent) {
  return (
    <div className="grid max-h-[100vh] min-w-[75vw] flex-1 flex-col items-center gap-4 overflow-y-auto rounded-3xl border-gray-600 bg-white p-5">
      {children}
    </div>
  );
}

export function GrowFormBoxFullHeight({ children }: BoxContent) {
  return (
    <div className="grid max-h-[100vh] min-h-full min-w-[75vw] flex-1 flex-col items-center gap-4 overflow-y-auto rounded-3xl border-gray-600 bg-white p-5">
      {children}
    </div>
  );
}
