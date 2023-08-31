interface BoxContent {
    children: React.ReactNode
}

export function FormBox({children}: BoxContent) {
    return(
        <div className="grid gap-4 flex-col items-center bg-white p-5 rounded-3xl ">
            {children}
        </div> 
    )
}

export function GrowFormBox({children}: BoxContent) {
    return(
        <div className="grid gap-4 flex-col flex-1 items-center bg-white p-5 rounded-3xl ">
            {children}
        </div> 
    )
}