import SessionWrapper from "@/Components/SesssionWrapper";

// This layout overrides the global layout for the /student route.
// It intentionally does NOT include the Navbar or Footer so the
// welcome page can be a clean, full-screen experience.
export default function StudentLayout({ children }) {
  return (
    <SessionWrapper>
      <div className="min-h-screen">
        {children}
      </div>
    </SessionWrapper>
  );
}
