"use client";

import { useEffect } from "react";
import "./WelcomeTransition.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";


export default function WelcomeTransition() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If the session is still loading, do not run the timers yet
    if (status === "loading") return;

    const welcomeOverlay = document.getElementById("welcome-overlay");
    const heroTitle = document.getElementById("hero-title");
    const heroText = document.getElementById("hero-text");
    const heroBtn = document.getElementById("hero-btn");

    const timer1 = setTimeout(() => {
      if (welcomeOverlay) welcomeOverlay.classList.add("slide-up");
      document.body.style.overflow = "auto";
    }, 2200);

    const timer2 = setTimeout(() => {
      if (heroTitle) heroTitle.classList.add("animate-in");
    }, 2400);

    const timer3 = setTimeout(() => {
      if (heroText) heroText.classList.add("animate-in");
    }, 2600);

    const timer4 = setTimeout(() => {
      if (heroBtn) heroBtn.classList.add("animate-in");
    }, 2800);

    const timer5 = setTimeout(() => {
      if (welcomeOverlay) welcomeOverlay.style.display = "none";
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [status]);

  // Wait until NextAuth finishes loading the session to render the UI
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0b0410] text-white flex justify-center items-center font-sans">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const userName = session?.user?.name || "Student";

  return (
    <>
      {/* Welcome Overlay */}
      <div id="welcome-overlay" className="welcome-overlay">
        <div className="welcome-content">
          <div className="greeting-text">Welcome </div>
          <h1 id="display-name" className="user-name">
            {userName}
          </h1>
        </div>
      </div>

      {/* Homepage */}
      <main className="homepage flex items-center justify-center min-h-screen">
        <section className="hero">
          <h1 id="hero-title">Your Dashboard awaits.</h1>

          <p id="hero-text">
            We've set up everything based on your preferences. Dive in to start
            exploring tools designed specifically for you.
          </p>

          <button
            onClick={() => router.push("/")}
            id="hero-btn"
            className="btn cursor-pointer border-none outline-none"
          >
            Get Started
          </button>
        </section>
      </main>
    </>
  );
}