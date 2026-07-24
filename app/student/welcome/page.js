"use client";

import { useEffect, useState } from "react";
import "./WelcomeTransition.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function WelcomeTransition() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // React states to handle animations and visibility
  const [slideUp, setSlideUp] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [animateTitle, setAnimateTitle] = useState(false);
  const [animateText, setAnimateText] = useState(false);
  const [animateBtn, setAnimateBtn] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    // Prevent body scrolling during the initial transition
    document.body.style.overflow = "hidden";

    // 1. Slide up the welcome overlay
    const timer1 = setTimeout(() => {
      setSlideUp(true);
      document.body.style.overflow = "auto";
    }, 2200);

    // 2. Animate Hero Title
    const timer2 = setTimeout(() => {
      setAnimateTitle(true);
    }, 2400);

    // 3. Animate Hero Text
    const timer3 = setTimeout(() => {
      setAnimateText(true);
    }, 2600);

    // 4. Animate Hero Button
    const timer4 = setTimeout(() => {
      setAnimateBtn(true);
    }, 2800);

    // 5. Unmount overlay completely from DOM
    const timer5 = setTimeout(() => {
      setOverlayVisible(false);
    }, 3000);

    // Cleanup function to reset body styles and clear timers on unmount
    return () => {
      document.body.style.overflow = "auto";
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
      <div className="min-h-screen bg-[#090a0f] text-white flex justify-center items-center font-sans">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const userName = session?.user?.name || "Student";

  return (
    <>
      {/* Welcome Overlay */}
      {overlayVisible && (
        <div id="welcome-overlay" className={`welcome-overlay ${slideUp ? "slide-up" : ""}`}>
          <div className="welcome-content">
            <div className="greeting-text">Welcome </div>
            <h1 id="display-name" className="user-name">
              {userName}
            </h1>
          </div>
        </div>
      )}

      {/* Homepage */}
      <main className="homepage flex items-center justify-center min-h-screen">
        <section className="hero">
          <h1 id="hero-title" className={animateTitle ? "animate-in" : ""}>
            Your Dashboard awaits.
          </h1>

          <p id="hero-text" className={animateText ? "animate-in" : ""}>
            We've set up everything based on your preferences. Dive in to start
            exploring tools designed specifically for you.
          </p>

          <button
            onClick={() => router.push("/dashboard/wallet")}
            id="hero-btn"
            className={`btn cursor-pointer border-none outline-none ${animateBtn ? "animate-in" : ""}`}
          >
            Get Started
          </button>
        </section>
      </main>
    </>
  );
}