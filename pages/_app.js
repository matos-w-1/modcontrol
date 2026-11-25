import "@/styles/globals.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>RollTwo Staff</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.webp" type="image/webp" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
