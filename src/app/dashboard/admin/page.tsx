"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Briefcase, Network, UserCog, Ban, CheckCircle } from "lucide-react";
import { useSession } from "next-auth/react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then(res => res.json()),
      fetch("/api/admin/users").then(res => res.json())
    ]).then(([statsData, usersData]) => {
      if (statsData.success) {
        setStats(statsData.data);
      }
      if (usersData.success) {
        setUsers(usersData.data);
      }
      setLoading(false);
    }).catch(err => {
      console.error("Failed to fetch admin data", err);
      setLoading(false);
    });
  }, []);

  const handleToggleBan = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, isBanned: !currentStatus } : u));
      } else {
        alert(data.error?.message || "Failed to update user status");
      }
    } catch (err) {
      alert("An error occurred while updating user status.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] p-6 lg:p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] -translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl lg:text-4xl font-bold text-white mb-2"
          >
            Administrator Console
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400"
          >
            Monitor platform metrics and manage user access.
          </motion.p>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Students", value: stats?.students, icon: Users, color: "text-blue-400" },
            { label: "Total Alumni", value: stats?.alumni, icon: UserCog, color: "text-purple-400" },
            { label: "Opportunities", value: stats?.opportunities, icon: Briefcase, color: "text-emerald-400" },
            { label: "Referrals", value: stats?.referrals, icon: Network, color: "text-cyan-400" }
          ].map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-6 border-l-4"
              style={{ borderLeftColor: idx === 0 ? '#3b82f6' : idx === 1 ? '#a855f7' : idx === 2 ? '#34d399' : '#22d3ee' }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">{stat.label}</p>
                  {loading ? (
                    <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
                  ) : (
                    <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                  )}
                </div>
                <div className={`p-3 rounded-xl bg-white/[0.03] ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* User Management */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card overflow-hidden"
        >
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">User Management</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs text-slate-400 uppercase bg-white/[0.02] border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Loading users...
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-slate-500 text-xs">{user.collegeEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'ADMIN' ? 'bg-red-500/20 text-red-300' : 
                          user.role === 'ALUMNI' ? 'bg-purple-500/20 text-purple-300' : 
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {user.isBanned ? (
                          <span className="flex items-center gap-1.5 text-red-400 text-xs font-medium">
                            <Ban className="w-3.5 h-3.5" /> Banned
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
                            <CheckCircle className="w-3.5 h-3.5" /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleToggleBan(user.id, user.isBanned)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            user.isBanned 
                            ? 'bg-white/10 hover:bg-white/20 text-white' 
                            : 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                          }`}
                        >
                          {user.isBanned ? 'Unban' : 'Ban User'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
