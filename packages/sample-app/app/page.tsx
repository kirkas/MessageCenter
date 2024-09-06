import Image from "next/image";
import logo from "@/app/assets/logo.svg";
import Button from "@/app/components/Button";
// import SubscribeForm from "@/app/views/SubscribeForm";

import dynamic from "next/dynamic";

const SubscribeFormHeader = dynamic(() => import("@/app/views/SubscribeForm"), {
  loading: () => <p>Loading...</p>,
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <header className="flex flex-col gap-4 text-center justify-center items-center">
        <Image src={logo} alt="Meme Chain Chronicle" />
        <h1 className="text-3xl font-bold">Meme Chain Chronicle</h1>
        <p className="text-xl">
          Where Dank Meets DeFi: Your 24/7 Meme Coin Newsfeed on the Blockchain
        </p>
        <SubscribeFormHeader />
      </header>
    </main>
  );
}
