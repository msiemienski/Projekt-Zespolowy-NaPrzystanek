import Main from "@/components/Main";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex h-screen w-screen overflow-auto bg-[var(--background)] dark:bg-black">
      <div className="w-full md:w-1/3 h-full p-6 flex flex-col justify-center">
        <Main />
      </div>
    </div>
  );
}
