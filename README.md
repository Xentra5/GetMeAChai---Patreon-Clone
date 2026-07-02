# GetMeAChai ☕

A premium crowdfunding platform clone built with **Next.js 16** and styled with **Tailwind CSS v4**, designed for creators to receive support, connect with their audience, and get funded by their fans and followers.

---

## 🚀 Key Features & Layouts

### 1. Modern Layout & Global Navigation
* **Root Layout (`app/layout.js`):** Integrated Google Fonts (`Inter` for primary typography, `Instrument Serif` for stylized serif elements). Features a beautiful deep-space radial gradient background (`radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)`) that gives the app a premium, modern aesthetic.
* **Glassmorphic Navigation Bar (`Components/NavBar.js`):** Built a responsive sticky navbar with backdrop blur (`backdrop-blur-md`), clean navigation links (Home, About, Contact), and call-to-action buttons for signing up and logging in.
* **Styled Footer (`Components/Footer.js`):** Added a minimal, cohesive footer displaying copyright and branding info with gradient backgrounds.

### 2. High-Converting Landing Page (`app/page.js`)
* **Hero Section:** Features smooth fade-in animations and text highlighting the platform's mission.
* **Interactive CTAs:** Includes a stunning, animated "Start Here" button with slide-in shimmer, scale transitions, and hover-triggered backdrop highlights.
* **Key Stats Dashboard:** Displays platform impact stats (25K+ Creators Empowered, 1.8M+ Chais Bought, 500K+ Supporters Worldwide, and ₹12Cr+ Earnings Generated) in neatly designed cards with custom emoji badges.

### 3. Secure Database & Authentication System
* **Database Connection (`db/connectDb.js`):** Implemented a global cached MongoDB connection using **Mongoose** to prevent socket connection exhaustion during Next.js hot-reloads in development.
* **User Schema (`models/user.js`):** Defines user credentials with clean schemas including email normalization (lowercase, trim) and timestamps.
* **Credentials Registration API (`app/api/signup/route.js`):** Offers a secure POST endpoint for registering new users. Includes input validation, email duplicate checks, and password hashing using `bcryptjs`.
* **NextAuth Config (`app/api/auth/[...nextauth]/route.js`):** Standardized NextAuth setup utilizing **JWT session strategy** with support for three auth providers:
  * **Google OAuth** for fast single-click social sign-on.
  * **GitHub OAuth** for developers and creators.
  * **Credentials Provider** integrated directly with the MongoDB backend to validate hashed passwords.

### 4. Dedicated Sign Up Portal (`app/signup/page.js`)
* **Interactive Sign Up Form:** Fully styled username, email, password, and confirm password fields.
* **Live Password Strength Meter:** Evaluates password input in real-time (from "Very Weak" to "Very Strong") with an animated five-bar indicator showing progress and dynamic color states.
* **Password Visibility Toggle:** Integrated a stateful show/hide toggle for password entries.
* **Multi-provider Social Auth:** Custom buttons for single-click Github, Google, and Apple third-party sign-ins.

### 5. Dedicated Login Portal (`app/login/page.js`)
* **Login Form:** Designed an elegant card-based authentication page centered on a black backdrop and subtle neon purple glows.
* **Password Visibility Toggle:** Integrated a stateful show/hide toggle for password entries.
* **Multi-provider Social Auth:** Included styled buttons ready for GitHub, Google, and Apple third-party sign-ins.
* **Minimalist Sub-layout (`app/login/layout.js`):** Keeps authentication pages clean by bypassing redundant font imports and layout overrides.

### 6. Interactive Role Selection Portal (`app/select-role/page.js`)
* **Dynamic Role Chooser:** Allows users to select their profile type as either a **Student** (to learn and support) or a **Creator** (to share work and get funded) using beautifully styled, interactive cards with micro-animations.
* **Stateful Flow:** Features client-side persistence (`localStorage`) and integration with a backend API route (`/api/user/role`) to update the user's role.
* **Modern UI & UX:** Displays contextual success/error status messages with transition states and smooth navigation redirects.

---

## 🛠️ Technology Stack

* **Framework:** Next.js 16 (App Router)
* **Library:** React 19
* **Styling:** Tailwind CSS v4 (using `@tailwindcss/postcss`)
* **Database:** MongoDB & Mongoose
* **Authentication:** NextAuth.js & bcryptjs
* **Icons:** Lucide React
* **Fonts:** Google Fonts (Inter, Instrument Serif)

---

## 🏁 Getting Started

### 1. Configure Environment Variables

Create a `.env.local` file in the root of the project and populate it with the following keys:

```env
# MongoDB Connection URI
MONGODB_URI=your_mongodb_connection_string

# NextAuth Settings
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# GitHub OAuth credentials
GITHUB_ID=your_github_client_id_here
GITHUB_SECRET=your_github_client_secret_here

# Google OAuth credentials
GOOGLE_ID=your_google_client_id_here
GOOGLE_SECRET=your_google_client_secret_here
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the live application.
