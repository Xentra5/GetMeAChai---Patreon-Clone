# GetMEChai ☕

A premium crowdfunding platform clone built with Next.js and styled with Tailwind CSS, designed for creators to receive support, connect with their audience, and get funded by their fans and followers.

## 🚀 Recent Changes & Features Implemented

The following features and updates have been successfully added to the project:

### 1. Modern Layout & Global Navigation
* **Root Layout (`app/layout.js`):** Integrated Google Fonts (`Inter` for primary typography, `Instrument Serif` for stylized serif elements). Added a beautiful deep-space radial gradient background (`radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)`) that gives the app a premium, modern aesthetic.
* **Glassmorphic Navigation Bar (`Components/NavBar.js`):** Built a responsive sticky navbar with backdrop blur (`backdrop-blur-md`), clean navigation links (Home, About, Contact), and call-to-action buttons for signing up and logging in.
* **Styled Footer (`Components/Footer.js`):** Added a minimal, cohesive footer displaying copyright and branding info with gradient backgrounds.

### 2. High-converting Landing Page (`app/page.js`)
* **Hero Section:** Features smooth fade-in animations and text highlighting the platform's mission.
* **Interactive CTAs:** Added a stunning, animated "Start Here" button with slide-in shimmer, scale transitions, and hover-triggered backdrop highlights.
* **Key Stats Dashboard:** Displays platform impact stats (25K+ Creators Empowered, 1.8M+ Chais Bought, 500K+ Supporters Worldwide, and ₹12Cr+ Earnings Generated) in neatly designed cards with custom emoji badges.

### 3. Dedicated Login Portal (`app/login`)
* **Login Form (`app/login/page.js`):** Designed an elegant card-based authentication page centered on a black backdrop and subtle neon purple glows.
* **Password Visibility Toggle:** Integrated a stateful show/hide toggle for password entries.
* **Multi-provider Social Auth:** Included styled buttons ready for GitHub, Google, and Apple third-party sign-ins.
* **Minimalist Sub-layout (`app/login/layout.js`):** Keeps authentication pages clean by bypassing redundant font imports and layout overrides.

---

## 🛠️ Technology Stack

* **Framework:** Next.js (App Router)
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **Fonts:** Google Fonts (Inter, Instrument Serif)

---

## 🏁 Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the live application.
