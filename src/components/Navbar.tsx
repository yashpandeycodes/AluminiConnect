"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { LogOut, LayoutDashboard, UserCircle } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold">A</span>
          </div>
          AlumniConnect
        </Link>
        
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link href={`/dashboard/${session.user.role.toLowerCase()}`} className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <div className="h-4 w-px bg-white/20 mx-2" />
              <button 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full transition-all hover:shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
