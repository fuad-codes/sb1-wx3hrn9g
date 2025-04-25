import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M50 0L93.3013 25V75L50 100L6.69873 75V25L50 0Z" fill="black"/>
        <path d="M50 25L93.3013 50V75L50 100L6.69873 75V50L50 25Z" fill="#FF0000"/>
      </svg>
      <span className="font-bold text-xl">SAQR</span>
    </div>
  )
}