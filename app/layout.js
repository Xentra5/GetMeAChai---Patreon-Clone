import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import Navbar from "../Components/NavBar";
import Footer from "../Components/Footer";
import SessionWrapper from "../Components/SesssionWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata = {
  title: "patrion",
  description: "A platform for creators to connect with their fans and monetize their content.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col relative">
        <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 pointer-events-none [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>

        <SessionWrapper>
          <div className="z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </SessionWrapper>
      </body>
    </html>
  );
}
