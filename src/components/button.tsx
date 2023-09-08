interface ButtonText {
    text: string,
}

export function BlackButton({text}: ButtonText) {
    return(
        <button className="w-full rounded-xl border-2 border-black text-white bg-black text-xl p-2">
            {text}
        </button>
    )
}

export function WhiteButton({text}: ButtonText) {
    return(
        <button className="w-full rounded-xl border-2 border-black text-xl p-2">
            {text}
        </button>
    )
}

export function BlackBackButton() {
    return( 
        <button className="rounded-xl border-2 border-black bg-black text-white p-3">←</button>
    )
}