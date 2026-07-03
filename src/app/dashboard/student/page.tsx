"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Briefcase, Bot, UserPlus, FileText, CheckCircle, Loader2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { UploadButton } from "@/lib/uploadthing";
import { jsPDF } from "jspdf";

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Profile state
  const [profile, setProfile] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    department: "",
    skills: "",
    projects: "",
    resumeUrl: ""
  });

  // UI States
  const [showAiModal, setShowAiModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  
  // AI Modal States
  const [aiMode, setAiMode] = useState<"SELECT" | "SCORE" | "ROADMAP">("SELECT");
  const [resumeUrl, setResumeUrl] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [scoreSource, setScoreSource] = useState<"PDF" | "PROFILE" | null>(null);
  const [uploadedPdfBase64, setUploadedPdfBase64] = useState<string | null>(null);
  const [uploadedPdfName, setUploadedPdfName] = useState<string | null>(null);

  // Search Modal States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    fetch("/api/opportunities")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOpportunities(data.data);
        }
        setLoading(false);
      });

    fetch("/api/profile")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setProfile(data.data);
          setProfileForm({
            department: data.data.department || "",
            skills: data.data.skills?.join(", ") || "",
            projects: typeof data.data.projects === 'string' ? data.data.projects : JSON.stringify(data.data.projects || ""),
            resumeUrl: data.data.resumeUrl || ""
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
          department: profileForm.department,
          skills: profileForm.skills.split(",").map(s => s.trim()).filter(Boolean),
          projects: profileForm.projects,
          resumeUrl: profileForm.resumeUrl
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(data.data);
        setIsEditingProfile(false);
      } else alert(data.error?.message || "Failed to update profile");
    } catch (err) { alert("An error occurred"); }
    finally { setSavingProfile(false); }
  };

  const generateResumeText = () => {
    if (!profile) return "";
    return `Name: ${session?.user?.name || "Student"}
Email: ${session?.user?.email || ""}
Department: ${profile.department || ""}
Skills: ${(profile.skills || []).join(", ")}

Recent Projects & Experience:
${profile.projects || "None specified."}
`;
  };

  const handleBuildAndScoreResume = async () => {
    const text = generateResumeText();
    if (!text || !profile) return alert("Please complete your profile first.");
    if (!targetRole) return alert("Please enter target role.");
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/resume-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text, targetRole })
      });
      const data = await res.json();
      if (data.success) {
        setAiResult(data.data);
        setScoreSource("PROFILE");
      }
      else alert(data.error?.message || "Failed to score resume");
    } catch (err) { alert("Error occurred."); }
    finally { setAiLoading(false); }
  };

  const handleDownloadResumePdf = () => {
    const text = generateResumeText();
    if (!text) return alert("Please complete your profile first.");
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(text, 180);
    doc.text(lines, 15, 15);
    doc.save(`${session?.user?.name || "resume"}.pdf`);
  };

  const handleScoreUploadedPdf = async () => {
    if (!uploadedPdfBase64) return alert("Please select a PDF resume first.");
    if (!targetRole) return alert("Please enter target role.");
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/resume-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: uploadedPdfBase64, targetRole })
      });
      const data = await res.json();
      if (data.success) {
        setAiResult(data.data);
        setScoreSource("PDF");
      }
      else alert(data.error?.message || "Failed to score resume");
    } catch (err) { alert("Error occurred."); }
    finally { setAiLoading(false); }
  };
  const handleGenerateRoadmap = async () => {
    if (!targetRole) return alert("Please enter a target role.");
    const skills = profile?.skills || [];
    if (skills.length === 0) return alert("Please add your skills in your profile first so the AI can analyze your skill gap.");
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/career-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerGoal: targetRole,
          currentSkills: skills
        })
      });
      const data = await res.json();
      if (data.success) setAiResult(data.data);
      else alert(data.error?.message || "Failed to generate roadmap");
    } catch (err) { alert("Error occurred."); }
    finally { setAiLoading(false); }
  };

  const handleSearchAlumni = async () => {
    if (!searchQuery) return;
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/alumni/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) setSearchResults(data.data);
    } catch (err) { alert("Failed to search"); }
    finally { setSearchLoading(false); }
  };

  const handleRequestReferral = async (opportunityId: string) => {
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId, note: "I am interested in this role." })
      });
      const data = await res.json();
      if (data.success) {
        alert("Referral requested successfully!");
      } else {
        alert(data.error?.message || "Failed to request referral");
      }
    } catch (err) {
      alert("Error requesting referral.");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image & Blur */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2000&auto=format&fit=crop")' }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#0b1120]/90 via-[#312e81]/80 to-[#0b1120]/90 backdrop-blur-md" />
      
      {/* Animated Orbs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto relative z-10 p-6 lg:p-12">
        <header className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl lg:text-4xl font-bold text-white mb-2"
          >
            Welcome back, {session?.user?.name || "Student"}
          </motion.h1>
          <motion.p className="text-slate-400">Here's what's happening in your network today.</motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* PROFILE SECTION */}
            <section className="glass-card p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Your Profile
                </h2>
                {!isEditingProfile && (
                  <button onClick={() => setIsEditingProfile(true)} className="text-sm bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors">
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Department</label>
                    <input type="text" className="w-full px-4 py-2 rounded-lg glass-input text-white" value={profileForm.department} onChange={e => setProfileForm({...profileForm, department: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Skills (comma separated)</label>
                    <input type="text" className="w-full px-4 py-2 rounded-lg glass-input text-white" value={profileForm.skills} onChange={e => setProfileForm({...profileForm, skills: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Recent Projects / Experience</label>
                    <textarea 
                      className="w-full px-4 py-2 rounded-lg glass-input text-white h-24 resize-none" 
                      placeholder="Describe your recent projects and experiences to include in your generated resume..."
                      value={profileForm.projects} 
                      onChange={e => setProfileForm({...profileForm, projects: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Resume (PDF)</label>
                    {profileForm.resumeUrl ? (
                      <div className="flex items-center justify-between px-4 py-2 rounded-lg glass-input text-white">
                        <span className="truncate max-w-[200px]">{profileForm.resumeUrl}</span>
                        <button type="button" onClick={() => setProfileForm({...profileForm, resumeUrl: ""})} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                      </div>
                    ) : (
                      <div className="glass p-4 rounded-lg">
                        <UploadButton
                          endpoint="resumeUploader"
                          onClientUploadComplete={(res) => setProfileForm({...profileForm, resumeUrl: res[0].ufsUrl})}
                          onUploadError={(error: Error) => alert(`ERROR! ${error.message}`)}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => setIsEditingProfile(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors">Cancel</button>
                    <button type="submit" disabled={savingProfile} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                      Save Profile
                    </button>
                  </div>
                </form>
              ) : profile ? (
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Department</p>
                    <p className="text-white font-medium">{profile.department || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills?.length > 0 ? profile.skills.map((s: string) => (
                        <span key={s} className="px-2 py-1 bg-blue-500/10 text-blue-300 text-xs rounded-md border border-blue-500/20">{s}</span>
                      )) : <span className="text-slate-400">None</span>}
                    </div>
                  </div>
                  {profile.projects && (
                    <div className="col-span-2">
                      <p className="text-sm text-slate-500 mb-1">Recent Projects / Experience</p>
                      <p className="text-white text-sm whitespace-pre-wrap">{profile.projects}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-400 mb-4">You haven't set up your profile yet.</p>
                  <button onClick={() => setIsEditingProfile(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg transition-colors font-medium">Create Profile</button>
                </div>
              )}
            </section>

            {/* OPPORTUNITIES */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-400" />
                  Latest Opportunities
                </h2>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <div className="h-32 glass-card animate-pulse" />
                ) : opportunities.length === 0 ? (
                  <div className="p-8 glass-card text-center text-slate-400">No opportunities posted yet.</div>
                ) : (
                  opportunities.map((job) => (
                    <motion.div key={job.id} className="glass-card p-6 hover:bg-white/[0.05] transition-colors group">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{job.role}</h3>
                          <p className="text-sm text-slate-400">{job.company}</p>
                        </div>
                        <button 
                          onClick={() => handleRequestReferral(job.id)}
                          className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-sm font-semibold rounded-lg border border-blue-500/20 transition-colors"
                        >
                          Request Referral
                        </button>
                      </div>
                      <p className="text-sm text-slate-300 mb-2 line-clamp-2"><span className="font-semibold text-slate-400">Eligibility:</span> {job.eligibility}</p>
                      <div className="flex gap-2 mb-4 flex-wrap">
                        {job.requiredSkills?.map((s: string) => (
                          <span key={s} className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 text-xs rounded border border-cyan-500/20">{s}</span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                        {job.applicationLink && <a href={job.applicationLink} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Apply Here</a>}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <motion.div className="glass-card p-6 bg-gradient-to-br from-blue-900/40 to-[#0b1120]">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 border border-blue-500/30">
                <Bot className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Career Assistant</h3>
              <p className="text-sm text-slate-400 mb-6">Get your resume reviewed or generate a personalized roadmap using Gemini 2.5 Flash.</p>
              <button onClick={() => { setShowAiModal(true); setAiMode("SELECT"); setAiResult(null); }} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors text-sm shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                Launch Assistant
              </button>
            </motion.div>

            <motion.div className="glass-card p-6">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4 border border-cyan-500/30">
                <UserPlus className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Alumni Network</h3>
              <p className="text-sm text-slate-400 mb-6">Search the network and connect with seniors.</p>
              <button onClick={() => setShowSearchModal(true)} className="w-full py-2.5 glass hover:bg-white/10 text-white rounded-lg font-medium transition-colors text-sm">
                Search Alumni
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* AI ASSISTANT MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto relative">
            <button onClick={() => setShowAiModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
            
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Bot className="w-6 h-6 text-blue-400" /> AI Career Assistant</h2>

            {aiMode === "SELECT" && (
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setAiMode("SCORE")} className="p-6 glass hover:bg-white/5 border border-white/10 rounded-xl text-left transition-colors">
                  <h3 className="text-lg font-bold text-white mb-2">Resume Scorer</h3>
                  <p className="text-sm text-slate-400">Upload your PDF resume and get ATS optimization feedback.</p>
                </button>
                <button onClick={() => setAiMode("ROADMAP")} className="p-6 glass hover:bg-white/5 border border-white/10 rounded-xl text-left transition-colors">
                  <h3 className="text-lg font-bold text-white mb-2">Career Roadmap</h3>
                  <p className="text-sm text-slate-400">Generate a step-by-step learning path for your target role.</p>
                </button>
              </div>
            )}

            {aiMode === "SCORE" && !aiResult && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Target Role</label>
                  <input type="text" className="w-full px-4 py-2 rounded-lg glass-input text-white" placeholder="e.g. Frontend Developer" value={targetRole} onChange={e => setTargetRole(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Resume Options</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex flex-col justify-between">
                      <div>
                        <h4 className="text-white font-bold mb-1">Score Custom Resume</h4>
                        <p className="text-slate-400 text-xs mb-3">Upload any PDF to score it.</p>
                        {uploadedPdfName ? (
                          <p className="text-green-400 text-xs truncate" title={uploadedPdfName}>{uploadedPdfName}</p>
                        ) : (
                          <p className="text-yellow-400 text-xs">No file selected.</p>
                        )}
                      </div>
                      <div className="mt-4 flex flex-col gap-2">
                        <input 
                          type="file" 
                          accept="application/pdf" 
                          className="hidden" 
                          id="resume-pdf-upload" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadedPdfName(file.name);
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                const base64 = (ev.target?.result as string).split(',')[1];
                                setUploadedPdfBase64(base64);
                              };
                              reader.readAsDataURL(file);
                            }
                          }} 
                        />
                        <label htmlFor="resume-pdf-upload" className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer text-center">
                          Choose File
                        </label>
                        <button onClick={handleScoreUploadedPdf} disabled={aiLoading || !uploadedPdfBase64 || !targetRole} className="w-full py-2 bg-blue-600/50 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                          Score PDF
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex flex-col justify-between">
                      <div>
                        <h4 className="text-white font-bold mb-1">Build from Profile</h4>
                        <p className="text-slate-400 text-xs">Uses your Skills & Projects</p>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button onClick={handleBuildAndScoreResume} disabled={aiLoading || !targetRole} className="flex-1 py-2 bg-purple-600/50 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                          Generate Score & Review
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {aiMode === "ROADMAP" && !aiResult && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Target Role</label>
                  <input type="text" className="w-full px-4 py-2 rounded-lg glass-input text-white" placeholder="e.g. Data Scientist" value={targetRole} onChange={e => setTargetRole(e.target.value)} />
                </div>
                <button onClick={handleGenerateRoadmap} disabled={aiLoading || !targetRole} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {aiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate Roadmap"}
                </button>
              </div>
            )}

            {aiResult && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">Analysis Complete</h3>
                  <button onClick={() => { setAiResult(null); setAiMode("SELECT"); setScoreSource(null); }} className="text-sm text-blue-400 hover:underline">Start Over</button>
                </div>
                
                {aiMode === "SCORE" && scoreSource === "PROFILE" && (
                  <div className="flex justify-end mb-4">
                     <button onClick={handleDownloadResumePdf} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Download Generated Resume as PDF
                     </button>
                  </div>
                )}
                
                <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl space-y-6">
                  {/* ATS Score */}
                  {aiResult.score !== undefined && (
                    <div className="mb-4 text-center">
                      <div className="text-5xl font-black text-blue-400 mb-2">{aiResult.score}/100</div>
                      <p className="text-slate-400">ATS Match Score</p>
                    </div>
                  )}

                  {/* Missing Keywords (Resume Score) */}
                  {aiResult.missingKeywords && aiResult.missingKeywords.length > 0 && (
                    <div>
                      <h4 className="font-bold text-white mb-2">Missing Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiResult.missingKeywords.map((kw: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-300 rounded-full text-xs">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions (Resume Score) */}
                  {aiResult.suggestions && aiResult.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-bold text-white mb-2">Suggestions</h4>
                      <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm">
                        {aiResult.suggestions.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Missing Skills (Career Roadmap) */}
                  {aiResult.missingSkills && aiResult.missingSkills.length > 0 && (
                    <div>
                      <h4 className="font-bold text-white mb-2">Skills You Need to Learn</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiResult.missingSkills.map((skill: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-full text-xs">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Roadmap Steps (Career Roadmap) */}
                  {aiResult.roadmapSteps && aiResult.roadmapSteps.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-white mb-2">Your Learning Roadmap</h4>
                      {aiResult.roadmapSteps.map((step: any, i: number) => (
                        <div key={i} className="border-l-2 border-blue-500 pl-4 py-2">
                          <h4 className="font-bold text-white text-sm">Step {step.step}: {step.title}</h4>
                          <p className="text-slate-400 text-xs mt-1">{step.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* SEARCH MODAL */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 w-full max-w-3xl max-h-[85vh] flex flex-col relative">
            <button onClick={() => setShowSearchModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
            <h2 className="text-2xl font-bold text-white mb-6">Alumni Directory</h2>
            
            <div className="flex gap-4 mb-6">
              <input 
                type="text" 
                placeholder="Search by name, company, or skills..." 
                className="flex-1 px-4 py-3 rounded-lg glass-input text-white"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearchAlumni()}
              />
              <button onClick={handleSearchAlumni} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2">
                {searchLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                Search
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {searchResults.length === 0 && !searchLoading && searchQuery && (
                <p className="text-center text-slate-400 py-8">No alumni found matching your query.</p>
              )}
              {searchResults.map((alumni) => (
                <div key={alumni.id} className="p-4 bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-lg">{alumni.user?.name || "Unknown User"}</h3>
                    <p className="text-sm text-slate-400">{alumni.jobRole} at {alumni.company}</p>
                    <div className="flex gap-2 mt-2">
                      {alumni.skills?.slice(0, 3).map((s: string) => (
                        <span key={s} className="px-2 py-0.5 bg-purple-500/10 text-purple-300 text-xs rounded border border-purple-500/20">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-green-400 font-semibold mb-2">Score: {Math.round(alumni.matchScore || 0)}% Match</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
