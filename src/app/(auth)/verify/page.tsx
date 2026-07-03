"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token]);

  const verifyToken = async (tokenStr: string) => {
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenStr })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStatus("success");
        setMessage("Your email has been verified! You can now sign in.");
      } else {
        setStatus("error");
        setMessage(data.error?.message || "Invalid or expired token.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("An unexpected error occurred.");
    }
  };

  return (
    <div className="glass-card p-10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-cyan-500 rounded-full blur-[2px]" />
      
      {(!token && email) && (
        <div className="py-6">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 rounded-full border-4 border-blue-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Check your email</h2>
          <p className="text-slate-300">
            We've sent a verification link to <span className="text-white font-medium">{email}</span>.
            Please click the link to activate your account.
          </p>
        </div>
      )}

      {status === "loading" && (
        <div className="py-6 flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-white font-medium">Verifying your token...</p>
        </div>
      )}

      {status === "success" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Verified!</h2>
          <p className="text-slate-300 mb-8">{message}</p>
          <Link 
            href="/login"
            className="w-full inline-block py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          >
            Go to Sign In
          </Link>
        </motion.div>
      )}

      {status === "error" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
          <p className="text-red-200 mb-8">{message}</p>
          <Link 
            href="/login"
            className="w-full inline-block py-3 glass hover:bg-white/10 text-white rounded-lg font-semibold transition-all"
          >
            Back to Sign In
          </Link>
        </motion.div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen auth-bg flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-[#0b1120]/40 z-0" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10 text-center"
      >
        <Suspense fallback={
          <div className="glass-card p-10 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        }>
          <VerifyContent />
        </Suspense>
      </motion.div>
    </div>
  );
}
