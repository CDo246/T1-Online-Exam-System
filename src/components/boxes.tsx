interface BoxContent {
  children?: React.ReactNode;
}

<<<<<<< HEAD
export function FormBox({ children }: BoxContent) {
  return (
    <div className="grid flex-col items-center gap-4 rounded-3xl border-gray-600 bg-white p-5 ">
      {children}
    </div>
  );
=======
export function FormBox({children}: BoxContent) {
    return(
        <div className="grid gap-4 flex-col items-center border-gray-600 bg-white p-5 rounded-3xl ">
            {children}
        </div> 
    )
>>>>>>> 4b728de044fc40a718209dbc39175544421ad692
}

export function GrowFormBox({ children }: BoxContent) {
  return (
    <div className="grid flex-1 flex-col items-center gap-4 rounded-3xl bg-white p-5 ">
      {children}
    </div>
  );
}
