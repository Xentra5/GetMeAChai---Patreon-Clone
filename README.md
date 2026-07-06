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
* **Auto-Login on Signup:** Automatically logs the user in immediately after registering a new account, removing unnecessary steps.
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
* **Role Database Persistence:** Integrates with the `/api/user/role` backend endpoint to persist the user's selected role directly to their MongoDB user document.
* **Stateful Flow:** Features client-side persistence (`localStorage`) alongside the database update to manage user redirection flows.
* **Modern UI & UX:** Displays contextual success/error status messages with transition states and smooth navigation redirects.

### 7. Student Welcome Transition & Layout (`app/student/...`)
* **Dedicated Sub-Layout (`app/student/layout.js`):** A custom layout that overrides the global navbar and footer, offering a clean, full-screen interactive space.
* **Premium Welcome Overlay (`app/student/welcome/page.js`):** Displays a personalized greeting for the logged-in student user, which automatically slides up after a few seconds using custom CSS animations.
* **Staggered Dashboard Animation (`app/student/welcome/WelcomeTransition.css`):** Features beautifully timed, staggered entrance animations for the dashboard header, summary text, and the primary "Get Started" call-to-action button.

### 8. Multi-Step Creator Onboarding Flow (`app/creator-onboarding/...`)
* **Shared Context State Onboarding Layout (`app/creator-onboarding/layout.js`):** Implements a customized onboarding layout utilizing React Context (`OnboardingContext`) to manage unified form state dynamically across all steps.
* **Dynamic Step & Progress Indicators:** Automatically tracks pathnames (`/step2`, `/step3`, `/step4`) to calculate progress percentage, rendering stateful step indicators and transitionary header details.
* **Step 1 - Identity Details (`app/creator-onboarding/step1/page.js`):** Collects Legal Full Name, Date of Birth, and features a stateful Phone Verification field with a dummy OTP trigger.
* **Step 2 - Social Proof & ID Verification (`app/creator-onboarding/step2/page.js`):** Enables single-click toggles to mock connecting Twitter/X and GitHub accounts, alongside a drag-and-drop file upload area to upload Passport or Driver's License credentials.
* **Step 3 - Payout Selection & Terms (`app/creator-onboarding/step3/page.js`):** Configures options for Payout Methods (Stripe, PayPal, USDC Crypto Wallet), stores account details, and handles compliance checks and terms agreements.
* **Step 4 - Onboarding Success & Compliance Review (`app/creator-onboarding/step4/page.js`):** Serves as the completion confirmation page, letting creators know their application is encrypted and currently undergoing compliance review.

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
