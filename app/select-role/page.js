"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SelectRolePage() {
  const [selectedRole, setSelectedRole] = useState("");
  const [statusMessage, setStatusMessage] = useState("Please select a role.");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const router = useRouter();

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    setStatusMessage(`Great! You're joining as a ${role}.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) return;

    setLoading(true);
    try {
      // Store in localStorage
      localStorage.setItem("userAccountType", selectedRole);

      // Call API endpoint to update database
      const response = await fetch("/api/user/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole.toLowerCase() }),
      });

      if (response.ok) {
        showToast(`Account type "${selectedRole}" saved successfully! Moving to next step...`, "success");
        setTimeout(() => {
          if (selectedRole === "Student") {
            router.push("/student/welcome");
          } else {
            router.push("/creator-onboarding");
          }
        }, 1200);
      } else {
        console.warn("API returned error or is not configured yet, saved to local storage.");
        showToast(`Saved ${selectedRole} account type! Redirecting...`, "success");
        setTimeout(() => {
          if (selectedRole === "Student") {
            router.push("/student/welcome");
          } else {
            router.push("/creator-onboarding");
          }
        }, 1200);
      }
    } catch (error) {
      console.error("Error saving role:", error);
      showToast(`Saved ${selectedRole} account type! Redirecting...`, "success");
      setTimeout(() => {
        if (selectedRole === "Student") {
          router.push("/student/welcome");
        } else {
          router.push("/creator-onboarding");
        }
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-white flex justify-center items-center p-8 relative overflow-hidden font-sans">
      <main className="w-full max-w-[650px] text-center z-10 anim-fade-up">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-white inline-block">
          Join the Community
        </h1>
        <p className="text-gray-400 text-lg mb-12">
          Select your primary role to get started.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Option 1: Student */}
            <label
              className={`block bg-[#121316] border-2 rounded-2xl p-10 cursor-pointer transition-all duration-300 relative overflow-hidden group hover:bg-[#1a1c23] hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/30 ${selectedRole === "Student"
                ? "border-[#d97706] bg-[#1a1310] shadow-[0_0_20px_rgba(217,119,6,0.15)]"
                : "border-slate-800"
                }`}
            >
              <input
                type="radio"
                name="userRole"
                value="Student"
                className="absolute opacity-0 w-0 h-0"
                checked={selectedRole === "Student"}
                onChange={() => handleRoleSelection("Student")}
              />
              <div className="flex flex-col items-center gap-4 relative z-10">
                <div
                  className={`w-[70px] h-[70px] rounded-full flex justify-center items-center text-4xl mb-2 border transition-all duration-300 ${selectedRole === "Student"
                    ? "bg-amber-600 border-transparent"
                    : "bg-white/5 border-slate-800"
                    }`}
                >
                  🎓
                </div>
                <h2 className="text-2xl font-bold tracking-wide">Student</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Learn from experts, consume exclusive content, and support your favorite creators.
                </p>
              </div>
            </label>

            {/* Option 2: Creator */}
            <label
              className={`block bg-[#121316] border-2 rounded-2xl p-10 cursor-pointer transition-all duration-300 relative overflow-hidden group hover:bg-[#1a1c23] hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/30 ${selectedRole === "Creator"
                ? "border-[#2563eb] bg-[#10131a] shadow-[0_0_20px_rgba(37,99,235,0.15)]"
                : "border-slate-800"
                }`}
            >
              <input
                type="radio"
                name="userRole"
                value="Creator"
                className="absolute opacity-0 w-0 h-0"
                checked={selectedRole === "Creator"}
                onChange={() => handleRoleSelection("Creator")}
              />
              <div className="flex flex-col items-center gap-4 relative z-10">
                <div
                  className={`w-[70px] h-[70px] rounded-full flex justify-center items-center text-4xl mb-2 border transition-all duration-300 ${selectedRole === "Creator"
                    ? "bg-blue-600 border-transparent"
                    : "bg-white/5 border-slate-800"
                    }`}
                >
                  🚀
                </div>
                <h2 className="text-2xl font-bold tracking-wide">Creator</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Share your creative work, build your fanbase, and receive funding directly.
                </p>
              </div>
            </label>
          </div>

          <div className="flex flex-col items-center gap-6 min-h-[100px]">
            <div
              className={`text-lg text-blue-400 font-medium transition-all duration-300 ${selectedRole ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2.5"
                }`}
            >
              {statusMessage}
            </div>
            <button
              type="submit"
              disabled={!selectedRole || loading}
              className="bg-blue-600 text-white px-10 py-3.5 text-lg font-bold rounded-full transition-all duration-300 enabled:hover:scale-105 enabled:hover:shadow-[0_6px_20px_rgba(37,99,235,0.3)] disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Continue"}
            </button>
          </div>
        </form>
      </main>

      {/* Floating Toast Notification Banner */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl border flex items-center gap-3 shadow-2xl backdrop-blur-md transition-all duration-300 animate-pulse ${
          toast.type === "error" 
            ? "bg-red-950/90 border-red-500/50 text-red-200" 
            : "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
        }`}>
          <span className="text-xl">{toast.type === "error" ? "⚠️" : "✓"}</span>
          <span className="font-semibold text-sm tracking-wide">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
