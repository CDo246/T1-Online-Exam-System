import Head from "next/head";

interface LayoutProps {
    children: React.ReactNode,
    title: String
}

export function Layout({children, title}: LayoutProps) {
    return(
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content="This is a website for inviligating exams." />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="flex min-h-screen flex-col items-center justify-center bg-black">
                <div className="grid items-center gap-8">
                    {children}
                </div>
            </main>
        </>
    )
}