import "@/styles/globals.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>RollTwo Staff</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon.png" type="image/png" sizes="64x64" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
