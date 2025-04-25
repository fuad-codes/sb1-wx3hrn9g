"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"
import { 
  Users,
  Truck,
  MapPin,
  BarChart3,
  Settings,
  Menu,
  X,
  UserSquare2,
  FileText,
  Wrench,
  DollarSign,
  Boxes,
  Store,
  Globe,
  AlertTriangle,
  Container
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const routes = [
  {
    label: 'Dashboard',
    icon: BarChart3,
    href: '/',
  },
  {
    label: 'Employees',
    icon: Users,
    href: '/employees',
  },
  {
    label: 'Clients',
    icon: UserSquare2,
    href: '/clients',
  },
  {
    label: 'Suppliers',
    icon: Store,
    href: '/suppliers',
  },
  {
    label: 'Trucks',
    icon: Truck,
    href: '/trucks',
  },
  {
    label: 'Trailers',
    icon: Container,
    href: '/trailers',
  },
  {
    label: 'Maintenance',
    icon: Wrench,
    href: '/maintenance',
  },
  {
    label: 'Trips',
    icon: MapPin,
    href: '/trips',
  },
  {
    label: 'Fines',
    icon: AlertTriangle,
    href: '/fines',
  },
  {
    label: 'Outside',
    icon: Globe,
    href: '/outside',
  },
  {
    label: 'Accounts',
    icon: DollarSign,
    href: '/accounts',
  },
  {
    label: 'Inventory',
    icon: Boxes,
    href: '/inventory',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => setIsOpen(!isOpen)

  return (
    <>
      <Button
        variant="ghost"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={toggleSidebar}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>
      <div className={cn(
        "md:w-64 md:static fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-in-out",
        "bg-black text-white",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
              <Logo />
            </Link>
            <ThemeToggle />
          </div>
          <ScrollArea className="h-[calc(100vh-5rem)]">
            <div className="space-y-1">
              {routes.map((route) => (
                <Button
                  key={route.href}
                  asChild
                  variant={pathname === route.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    pathname === route.href ? "bg-red-900/50" : "hover:bg-red-900/30"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Link href={route.href}>
                    <route.icon className="mr-2 h-4 w-4" />
                    {route.label}
                  </Link>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}