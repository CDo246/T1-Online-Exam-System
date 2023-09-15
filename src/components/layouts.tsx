import Head from "next/head";

interface LayoutProps {
<<<<<<< HEAD
  children: React.ReactNode;
  title: string;
=======
    children: React.ReactNode,
    title: string,
>>>>>>> 4b728de044fc40a718209dbc39175544421ad692
}

export function CentredLayout({ children, title }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content="This is a website for inviligating exams."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-black">
        <div className="grid items-center gap-8">{children}</div>
      </main>
    </>
  );
}

export function SidebarLayout({ children, title }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content="This is a website for inviligating exams."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="grid min-h-screen grid-cols-[auto_1fr] bg-black">
        {children}
      </main>
    </>
  );
}
