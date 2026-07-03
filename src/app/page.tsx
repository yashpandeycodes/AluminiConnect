"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, GraduationCap, Users, Briefcase } from "lucide-react";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen auth-bg overflow-x-hidden pt-20">
      <div className="absolute inset-0 bg-[#0b1120]/80 z-0" />
      
      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 lg:pt-48 lg:pb-32 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm text-blue-200 font-medium">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Empowering the next generation of alumni
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
            Bridge the Gap Between <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Campus and Career</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            AlumniConnect is an exclusive, verified network where students discover powerful referrals, and alumni give back to their alma mater.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register" 
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="#how-it-works" 
              className="px-8 py-4 glass text-white hover:bg-white/10 rounded-full font-semibold transition-all w-full sm:w-auto justify-center flex"
            >
              Learn More
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* About Section */}
      <section className="relative z-10 py-24 bg-[#0b1120]/50 border-y border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Why AlumniConnect?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Built strictly on verified `.ac.in` domains, we guarantee a high-trust environment focused entirely on career growth.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: GraduationCap, title: "For Students", desc: "Access a private network of seniors. Get your resume reviewed by AI, and easily request referrals for top tech companies." },
              { icon: Users, title: "For Alumni", desc: "Give back seamlessly. Post internal opportunities, review student requests, and earn contribution points on the leaderboard." },
              { icon: Briefcase, title: "AI-Powered", desc: "Leverage Gemini 2.5 Flash to automatically draft personalized referral request messages and score your resume." }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="glass-card p-8 hover:bg-white/[0.08] transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 lg:p-20 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 relative z-10">Ready to accelerate your career?</h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto relative z-10">
              Join thousands of students and alumni already collaborating on the most trusted institutional network.
            </p>
            <Link 
              href="/register" 
              className="inline-flex px-10 py-5 bg-white text-[#0b1120] rounded-full font-bold text-lg hover:scale-105 transition-transform relative z-10"
            >
              Create an Account
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#0b1120] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="text-white font-semibold">AlumniConnect</span>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} AlumniConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
