import { PriceHistoryChart } from "@/components/particle-line-chart"
import {TypewriterEffect} from "@/components/typewriter-effect"
import { Background } from "@/components/tsparticle-component"

export function TypewriterEffectSmooth() {
  const words = [
    {
      text: "Hi,",
    },
    {
      text: "I'm",
    },
    {
      text: "Yashi",
    },
    {
      text: "A",
    },
    {
      text: "Data",
      className: "text-blue-500 dark:text-blue-500"
    },
    {
      text: "Engineer",
      className: "text-blue-500 dark:text-blue-500"
    },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-[40rem]  ">
      <TypewriterEffect words={words} />
    </div>
  );
}

export default function Page() {
  return (
    <div>
      <Background />
      <TypewriterEffectSmooth />
      <PriceHistoryChart />
    </div>
  )
}