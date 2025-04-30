import {clsx} from "clsx";
import TitleGrid from "@/icon/tilted-grid.svg";
import Hexagon from "@/icon/hexagon.svg";

export function TiltedGridBackground({ className }) {
    return (
      <div
        className={clsx([
          'absolute overflow-hidden [mask-image:linear-gradient(white,transparent)]',
          className,
        ])}
      >
        <TitleGrid
          className={clsx([
            'h-[160%] w-full',
            'absolute inset-x-0 inset-y-[-30%] skew-y-[-18deg]',
            'dark:fill-white/[.01] dark:stroke-white/[.025]',
            'fill-black/[0.02] stroke-black/5',
          ])}
        />
        {/* <Hexagon
          className={clsx([
            'h-[160%] w-full',
            'absolute inset-x-0 inset-y-0',
            'dark:fill-white/[.001] dark:stroke-white/[.0025]',
            'fill-black/[0.02] stroke-black/5',
          ])}
        /> */}
      </div>
    )
  }