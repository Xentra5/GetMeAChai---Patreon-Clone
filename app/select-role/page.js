"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SelectRolePage() {
  const [selectedRole, setSelectedRole] = useState("");
  const [statusMessage, setStatusMessage] = useState("Please select a role.");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    setStatusMessage(`Great! You're joining as a ${role}.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) return;

    setLoading(true);
    try {
      // Store in localStorage as requested in original HTML
      localStorage.setItem("userAccountType", selectedRole);

      // Call API endpoint to update database (standard route we will create if needed)
      const response = await fetch("/api/user/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole.toLowerCase() }),
      });

      if (response.ok) {
        alert(`Account type "${selectedRole}" saved successfully! Moving to the next step...`);
        router.push("/"); // Redirect user to home/dashboard
      } else {
        // Fallback if API doesn't exist yet or fails
        console.warn("API returned error or is not configured yet, saved to local storage.");
        alert(`Saved ${selectedRole} to local storage. Moving to the next step...`);
        router.push("/");
      }
    } catch (error) {
      console.error("Error saving role:", error);
      // Fallback
      alert(`Saved ${selectedRole} to local storage. Moving to the next step...`);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0410] text-white flex justify-center items-center p-8 relative overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_60%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-[radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.15),transparent_60%)] pointer-events-none" />

      <main className="w-full max-w-[650px] text-center z-10 anim-fade-up">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-[#a855f7] to-[#ec4899] bg-clip-text text-transparent inline-block">
          Join the Community
        </h1>
        <p className="text-[#b8a5d6] text-lg mb-12">
          Select your primary role to get started.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Option 1: Student */}
            <label
              className={`block bg-[#1a0b2e] border-2 rounded-2xl p-10 cursor-pointer transition-all duration-300 relative overflow-hidden group hover:bg-[#23103d] hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-950/30 ${selectedRole === "Student"
                  ? "border-[#a855f7] bg-[rgba(168,85,247,0.1)] shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                  : "border-[#331a5c]"
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
                      ? "bg-gradient-to-br from-[#a855f7] to-[#ec4899] border-transparent"
                      : "bg-white/5 border-[#331a5c]"
                    }`}
                >
                  🎓
                </div>
                <h2 className="text-2xl font-bold tracking-wide">Student</h2>
                <p className="text-[#b8a5d6] text-sm leading-relaxed">
                  Learn from experts, consume exclusive content, and support your favorite creators.
                </p>
              </div>
            </label>

            {/* Option 2: Creator */}
            <label
              className={`block bg-[#1a0b2e] border-2 rounded-2xl p-10 cursor-pointer transition-all duration-300 relative overflow-hidden group hover:bg-[#23103d] hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-950/30 ${selectedRole === "Creator"
                  ? "border-[#a855f7] bg-[rgba(168,85,247,0.1)] shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                  : "border-[#331a5c]"
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
                      ? "bg-gradient-to-br from-[#a855f7] to-[#ec4899] border-transparent"
                      : "bg-white/5 border-[#331a5c]"
                    }`}
                >
                  🚀
                </div>
                <h2 className="text-2xl font-bold tracking-wide">Creator</h2>
                <p className="text-[#b8a5d6] text-sm leading-relaxed">
                  Share your creative work, build your fanbase, and receive funding directly.
                </p>
              </div>
            </label>
          </div>

          <div className="flex flex-col items-center gap-6 min-h-[100px]">
            <div
              className={`text-lg text-[#a855f7] font-medium transition-all duration-300 ${selectedRole ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2.5"
                }`}
            >
              {statusMessage}
            </div>
            <button
              type="submit"
              disabled={!selectedRole || loading}
              className="bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white px-10 py-3.5 text-lg font-bold rounded-full transition-all duration-300 enabled:hover:scale-105 enabled:hover:shadow-[0_6px_20px_rgba(236,72,153,0.4)] disabled:bg-[#2a1b3d] disabled:text-[#5d467a] disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Continue"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
