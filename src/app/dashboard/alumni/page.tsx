"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Award, ListChecks, CheckCircle, FileText, Loader2, X, MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";

export default function AlumniDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ score: 0, pendingRequests: 0, activeOpportunities: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // Profile state
  const [profile, setProfile] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    company: "",
    jobRole: "",
    department: "",
    industry: "",
    experienceYrs: "",
    skills: ""
  });

  // Incoming Referrals
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loadingReferrals, setLoadingReferrals] = useState(true);

  // Post Opportunity Modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [postForm, setPostForm] = useState({ company: "", role: "", eligibility: "", requiredSkills: "", deadline: "", applicationLink: "" });
  const [postingJob, setPostingJob] = useState(false);

  // Review Referral Modal
  const [reviewingReferral, setReviewingReferral] = useState<any>(null);
  const [updatingReferral, setUpdatingReferral] = useState(false);
  
  // AI Drafting
  const [aiDraft, setAiDraft] = useState("");
  const [draftingMsg, setDraftingMsg] = useState(false);

  const fetchReferrals = async () => {
    try {
      const res = await fetch("/api/referrals");
      const data = await res.json();
      if (data.success) {
        setReferrals(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch referrals", error);
    } finally {
      setLoadingReferrals(false);
    }
  };

  useEffect(() => {
    fetchReferrals();

    // Fetch stats
    fetch("/api/contributions/me")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(s => ({ ...s, score: data.data.score }));
        }
        setLoadingStats(false);
      }).catch(() => setLoadingStats(false));

    // Fetch profile
    fetch("/api/profile")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setProfile(data.data);
          setProfileForm({
            company: data.data.company || "",
            jobRole: data.data.jobRole || "",
            department: data.data.department || "",
            industry: data.data.industry || "",
            experienceYrs: data.data.experienceYrs?.toString() || "",
            skills: data.data.skills?.join(", ") || "",
          });
        }
      });
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: profileForm.company,
          jobRole: profileForm.jobRole,
          department: profileForm.department,
          industry: profileForm.industry,
          experienceYrs: parseInt(profileForm.experienceYrs) || 0,
          skills: profileForm.skills.split(",").map(s => s.trim()).filter(Boolean)
        })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(data.data);
        setIsEditingProfile(false);
      } else {
        alert(data.error?.message || "Failed to update profile");
      }
    } catch (err) {
      alert("An error occurred");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePostOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostingJob(true);
    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...postForm,
          requiredSkills: postForm.requiredSkills.split(",").map(s => s.trim()).filter(Boolean)
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowPostModal(false);
        alert("Opportunity posted successfully! You earned contribution points.");
      } else {
        alert(data.error?.message || "Failed to post opportunity");
      }
    } catch (err) {
      alert("Error posting opportunity.");
    } finally {
      setPostingJob(false);
    }
  };

  const handleUpdateReferral = async (status: string) => {
    if (!reviewingReferral) return;
    setUpdatingReferral(true);
    try {
      const res = await fetch(`/api/referrals/${reviewingReferral.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Referral marked as ${status}`);
        setReviewingReferral(null);
        fetchReferrals();
      } else {
        alert(data.error?.message || "Failed to update status");
      }
    } catch (err) {
      alert("Error updating referral.");
    } finally {
      setUpdatingReferral(false);
    }
  };

  const handleDraftMessage = async () => {
    setDraftingMsg(true);
    try {
      const requester = reviewingReferral?.requester;
      const opp = reviewingReferral?.opportunity;
      
      // Build a rich studentInfo string that passes .min(10) validation
      const studentParts = [
        requester?.name || "Student",
        requester?.collegeEmail ? `(${requester.collegeEmail})` : "",
        requester?.studentProfile?.department ? `Department: ${requester.studentProfile.department}` : "",
        requester?.studentProfile?.skills?.length > 0 ? `Skills: ${requester.studentProfile.skills.join(", ")}` : ""
      ].filter(Boolean).join(", ");
      
      const opportunityParts = opp 
        ? `${opp.role} at ${opp.company}${opp.eligibility ? ` — Eligibility: ${opp.eligibility}` : ""}`
        : "Target Role at Target Company";

      const res = await fetch("/api/ai/referral-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentInfo: studentParts,
          opportunityInfo: opportunityParts
        })
      });
      const data = await res.json();
      if (data.success) {
        setAiDraft(data.data.message);
      } else {
        alert(data.error?.message || "Failed to draft message");
      }
    } catch (error) {
      alert("Error generating message");
    } finally {
      setDraftingMsg(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] p-6 lg:p-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] translate-y-1/2 translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl lg:text-4xl font-bold text-white mb-2"
            >
              Welcome back, {session?.user?.name || "Alumni"}
            </motion.h1>
            <motion.p className="text-slate-400">Thanks for giving back to the community.</motion.p>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card px-6 py-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-500/30">
              <Award className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Contribution Score</p>
              <div className="flex items-baseline gap-1">
                {loadingStats ? <div className="h-8 w-16 bg-white/10 animate-pulse rounded" /> : (
                  <>
                    <span className="text-3xl font-black text-white">{stats.score}</span>
                    <span className="text-yellow-500 font-bold">pts</span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* PROFILE SECTION */}
            <section className="glass-card p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Your Professional Profile
                </h2>
                {!isEditingProfile && (
                  <button onClick={() => setIsEditingProfile(true)} className="text-sm bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors">
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Company</label>
                      <input type="text" className="w-full px-4 py-2 rounded-lg glass-input text-white" value={profileForm.company} onChange={e => setProfileForm({...profileForm, company: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Job Role</label>
                      <input type="text" className="w-full px-4 py-2 rounded-lg glass-input text-white" value={profileForm.jobRole} onChange={e => setProfileForm({...profileForm, jobRole: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Department</label>
                      <input type="text" className="w-full px-4 py-2 rounded-lg glass-input text-white" value={profileForm.department} onChange={e => setProfileForm({...profileForm, department: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Industry</label>
                      <input type="text" className="w-full px-4 py-2 rounded-lg glass-input text-white" value={profileForm.industry} onChange={e => setProfileForm({...profileForm, industry: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Experience (Years)</label>
                      <input type="number" className="w-full px-4 py-2 rounded-lg glass-input text-white" value={profileForm.experienceYrs} onChange={e => setProfileForm({...profileForm, experienceYrs: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Skills (comma separated)</label>
                      <input type="text" className="w-full px-4 py-2 rounded-lg glass-input text-white" value={profileForm.skills} onChange={e => setProfileForm({...profileForm, skills: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => setIsEditingProfile(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors">Cancel</button>
                    <button type="submit" disabled={savingProfile} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                      Save Profile
                    </button>
                  </div>
                </form>
              ) : profile ? (
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Current Role</p>
                    <p className="text-white font-medium">{profile.jobRole} at {profile.company}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Industry</p>
                    <p className="text-white font-medium">{profile.industry || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Experience</p>
                    <p className="text-white font-medium">{profile.experienceYrs} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Department</p>
                    <p className="text-white font-medium">{profile.department || "Not specified"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-slate-500 mb-1">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills?.length > 0 ? profile.skills.map((s: string) => (
                        <span key={s} className="px-2 py-1 bg-purple-500/10 text-purple-300 text-xs rounded-md border border-purple-500/20">{s}</span>
                      )) : <span className="text-slate-400">None</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-400 mb-4">You haven't set up your professional profile yet.</p>
                  <button onClick={() => setIsEditingProfile(true)} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg transition-colors font-medium">Create Profile</button>
                </div>
              )}
            </section>

            {/* INCOMING REQUESTS */}
            <section className="glass-card p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-blue-400" />
                  Incoming Referral Requests
                </h2>
              </div>
              
              <div className="space-y-4">
                {loadingReferrals ? (
                  <div className="text-slate-400">Loading...</div>
                ) : referrals.length === 0 ? (
                  <div className="text-slate-400 text-center py-4">No pending requests right now.</div>
                ) : (
                  referrals.map((req) => (
                    <div key={req.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-white">Referral Request</h3>
                        <p className="text-sm text-slate-400">Status: {req.status}</p>
                        <p className="text-xs text-slate-500">Requested on {new Date(req.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => setReviewingReferral(req)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors">
                        Review
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <motion.div className="glass-card p-6 bg-gradient-to-br from-purple-900/40 to-[#0b1120]">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 border border-purple-500/30">
                <PlusCircle className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Post an Opportunity</h3>
              <p className="text-sm text-slate-400 mb-6">Know about a job opening? Post it here and help a student get referred.</p>
              <button onClick={() => setShowPostModal(true)} className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors text-sm shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                Create New Posting
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* POST OPPORTUNITY MODAL */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 w-full max-w-lg relative">
            <button onClick={() => setShowPostModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
            <h2 className="text-2xl font-bold text-white mb-6">Post an Opportunity</h2>
            <form onSubmit={handlePostOpportunity} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Company</label>
                  <input required type="text" className="w-full px-4 py-2 rounded-lg glass-input text-white" value={postForm.company} onChange={e => setPostForm({...postForm, company: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Role (e.g. SDE)</label>
                  <input required type="text" className="w-full px-4 py-2 rounded-lg glass-input text-white" value={postForm.role} onChange={e => setPostForm({...postForm, role: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Eligibility</label>
                <input required type="text" className="w-full px-4 py-2 rounded-lg glass-input text-white" value={postForm.eligibility} onChange={e => setPostForm({...postForm, eligibility: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Required Skills (comma separated)</label>
                <input required type="text" className="w-full px-4 py-2 rounded-lg glass-input text-white" value={postForm.requiredSkills} onChange={e => setPostForm({...postForm, requiredSkills: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Deadline (YYYY-MM-DD)</label>
                  <input required type="date" className="w-full px-4 py-2 rounded-lg glass-input text-white" value={postForm.deadline} onChange={e => setPostForm({...postForm, deadline: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Application Link</label>
                  <input required type="url" className="w-full px-4 py-2 rounded-lg glass-input text-white" value={postForm.applicationLink} onChange={e => setPostForm({...postForm, applicationLink: e.target.value})} />
                </div>
              </div>
              <button type="submit" disabled={postingJob} className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 mt-4">
                {postingJob ? "Posting..." : "Post Opportunity"}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* REVIEW REFERRAL MODAL */}
      {reviewingReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 w-full max-w-md relative">
            <button onClick={() => {setReviewingReferral(null); setAiDraft("");}} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
            <h2 className="text-2xl font-bold text-white mb-2">Review Request</h2>
            <p className="text-sm text-slate-400 mb-6">Status: {reviewingReferral.status}</p>
            
            <div className="space-y-4">
              <button onClick={() => handleUpdateReferral("ACCEPTED")} disabled={updatingReferral} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                Accept & Proceed
              </button>
              <button onClick={() => handleUpdateReferral("REJECTED")} disabled={updatingReferral} className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                Reject Request
              </button>
              <button onClick={() => handleUpdateReferral("COMPLETED")} disabled={updatingReferral} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                Mark as Completed (Earn Points)
              </button>
              
              <div className="pt-4 border-t border-white/10">
                <button onClick={handleDraftMessage} disabled={draftingMsg} className="w-full py-3 glass hover:bg-white/10 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {draftingMsg ? "Drafting..." : "Draft AI LinkedIn Message"}
                </button>
              </div>

              {aiDraft && (
                <div className="mt-4 p-4 bg-white/[0.05] border border-white/10 rounded-lg">
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{aiDraft}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
