"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  LogOut,
  ChevronDown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { signOut } from "firebase/auth"
import { getFirebaseAuth } from "@/firebase"

interface SidebarItem {
  label: string
  href: string
  icon: React.ReactNode
}

const asmItems: SidebarItem[] = [
  { label: "ASM Survey", href: "/asm-survey", icon: <LayoutDashboard size={18} /> },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut(getFirebaseAuth());
      router.push('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-white border-r">

      {/* Logo */}
      <div className="h-20 flex items-center justify-center border-b px-2">
        <Image
          src="/images/nakoda-20logo-20hindi-20and-20english.svg"
          alt="Nakoda TMT Logo"
          width={215}
          height={60}
          priority
        />
      </div>

      <ScrollArea className="mt-4 h-[calc(100vh-160px)] px-3">

        {/* ASM Menu */}
        <div className="space-y-2">
          {asmItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                pathname.startsWith(item.href)
                  ? "bg-orange-50 text-[#F87B1B]"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

          <Button
            variant="ghost"
            onClick={handleLogout}
            className="gap-2 flex justify-start w-full text-[#F87B1B] hover:bg-orange-50"
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </ScrollArea>
    </aside>
  )
}
