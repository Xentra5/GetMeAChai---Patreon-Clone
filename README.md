# GetMeAChai ☕

A premium crowdfunding platform clone built with **Next.js 16** and styled with **Tailwind CSS v4**, designed for creators to receive support, connect with their audience, and get funded by their fans and followers.

---

## 🚀 Key Features & Layouts

### 1. Modern Layout & Global Navigation
* **Root Layout (`app/layout.js`):** Integrated Google Fonts (`Inter` for primary typography, `Instrument Serif` for stylized serif elements). Features a beautiful deep-space radial gradient background (`radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)`) that gives the app a premium, modern aesthetic.
* **Glassmorphic Navigation Bar (`Components/NavBar.js`):** Built a responsive sticky navbar with backdrop blur (`backdrop-blur-md`), clean navigation links (Home, About, Contact), and stateful buttons for user sessions (Signup, Login, Dashboard, Role Selection).
* **Styled Footer (`Components/Footer.js`):** Minimal, cohesive footer displaying copyright and branding info with gradient backgrounds.
* **Session Wrapper (`Components/SesssionWrapper.js`):** Encapsulates NextAuth's `SessionProvider` to enable application-wide session management.

### 2. High-Converting Landing Page with Live Statistics (`app/page.js`)
* **Hero Section:** Features smooth fade-in animations and text highlighting the platform's mission.
* **Interactive CTAs:** Includes an animated "Start Here" button with slide-in shimmer, scale transitions, and hover-triggered backdrop highlights.
* **Live Database Stats Dashboard (`app/api/landing-stats/route.js`):** Displays real-time platform impact statistics aggregated dynamically from the MongoDB database, including:
  * **Creators Empowered:** Total count of active registered creators on the platform.
  * **Chais Bought:** The count of total successful payments processed.
  * **Supporters Worldwide:** The count of unique project backers computed using distinct email/name lookups.
  * **Earnings Generated:** A sum of all successful payment donations, formatted in Indian Rupees (INR).

### 3. Secure Database & Authentication System
* **Database Connection (`db/connectDb.js`):** Implemented a global cached MongoDB connection using **Mongoose** to prevent socket connection exhaustion during Next.js hot-reloads in development.
* **User Schema (`models/user.js`):** Defines user credentials with clean schemas including email normalization (lowercase, trim), default goals, categories (`Design`, `Engineering`, `Writing`, `Video`), view counters, and timestamps.
* **Payment Schema (`models/Payment.js`):** Schema for user support payments, tracking supporting user name, email, target creator (`to_username`), amount, custom message, and status (`pending`, `success`, `failed`).
* **Withdrawal Schema (`models/Withdrawal.js`):** Schema tracking payout withdrawals for creators, detailing amount, withdrawal method (e.g., Stripe, PayPal), and transfer status.
* **Post Schema (`models/Post.js`):** Schema tracking update posts published by creators, storing title, content, creator slug, and the minimum cumulative donation required to unlock the post.
* **Credentials Registration API (`app/api/signup/route.js`):** Secure POST endpoint for registering new users. Includes input validation, email duplicate checks, and password hashing using `bcryptjs`.
* **NextAuth Config (`app/api/auth/[...nextauth]/route.js`):** Standardized NextAuth setup utilizing **JWT session strategy** with support for three auth providers:
  * **Google OAuth** for fast single-click social sign-on.
  * **GitHub OAuth** for developers and creators.
  * **Credentials Provider** integrated directly with the MongoDB backend to validate hashed passwords.

### 4. Dedicated Sign Up & Login Portals with Session Redirection
* **Active Session Guard:** Seamless user experience that automatically redirects authenticated users directly to `/dashboard` if they attempt to access the `/login` or `/signup` portals.
* **Interactive Sign Up Form (`app/signup/page.js`):** Fully styled username, email, password, and confirm password fields.
* **Auto-Login on Signup:** Automatically logs the user in immediately after registering a new account, removing unnecessary steps.
* **Live Password Strength Meter:** Evaluates password input in real-time (from "Very Weak" to "Very Strong") with an animated five-bar indicator showing progress and dynamic color states.
* **Password Visibility Toggle:** Integrated a stateful show/hide toggle for password entries.
* **Multi-provider Social Auth:** Custom buttons for single-click GitHub, Google, and Apple third-party sign-ins.

### 5. Interactive Role Selection Portal (`app/select-role/page.js`)
* **Dynamic Role Chooser:** Allows users to select their profile type as either a **Student** (to learn and support) or a **Creator** (to share work and get funded) using beautifully styled, interactive cards with micro-animations.
* **Role Database Persistence:** Integrates with the `/api/user/role` backend endpoint to persist the user's selected role directly to their MongoDB user document.
* **Stateful Flow:** Features client-side persistence (`localStorage`) alongside the database update to manage user redirection flows.

### 6. Student Welcome Transition & Layout (`app/student/...`)
* **Dedicated Sub-Layout (`app/student/layout.js`):** A custom layout that overrides the global navbar and footer, offering a clean, full-screen interactive space.
* **Premium Welcome Overlay (`app/student/welcome/page.js`):** Displays a personalized greeting for the logged-in student user, which automatically slides up after a few seconds using custom CSS animations.
* **Staggered Dashboard Animation (`app/student/welcome/WelcomeTransition.css`):** Features beautifully timed, staggered entrance animations for the dashboard header, summary text, and the primary "Get Started" call-to-action button.

### 7. Multi-Step Creator Onboarding Flow (`app/creator-onboarding/...`)
* **Shared Context State Onboarding Layout (`app/creator-onboarding/layout.js`):** Implements a customized onboarding layout utilizing React Context (`OnboardingContext`) to manage unified form state dynamically across all steps.
* **Dynamic Step & Progress Indicators:** Automatically tracks pathnames (`/step1`, `/step2`, `/step3`, `/step4`) to calculate progress percentage, rendering stateful step indicators and transitionary header details.
* **Step 1 - Identity Details (`app/creator-onboarding/step1/page.js`):** Collects Legal Full Name, Date of Birth, and features a stateful Phone Verification field with a dummy OTP trigger.
* **Step 2 - Social Proof & ID Verification (`app/creator-onboarding/step2/page.js`):** Enables single-click toggles to mock connecting Twitter/X and GitHub accounts, alongside a drag-and-drop file upload area to upload Passport or Driver's License credentials.
* **Step 3 - Payout Selection & Terms (`app/creator-onboarding/step3/page.js`):** Configures options for Payout Methods (Stripe, PayPal, USDC Crypto Wallet), stores account details, and handles compliance checks and terms agreements.
* **Step 4 - Onboarding Success & Compliance Review (`app/creator-onboarding/step4/page.js`):** Serves as the completion confirmation page, letting creators know their application is encrypted and currently undergoing compliance review.

### 8. Unified Creator Dashboard System (`app/dashboard/...`)
* **Core Dashboard Page (`app/dashboard/page.js`):**
  * Displays metrics cards for **Monthly Revenue**, **Goal Progress**, and **Profile Views** with real-time numeric counting animation (`animateValue`).
  * Features an interactive **Chart.js** line chart displaying actual weekly revenue side-by-side with target revenue and projected future earnings.
  * Includes a **Settings Modal** to update the user's monthly funding goal, triggering instant server-side recalculation of goals.
* **Audience Insights Dashboard (`app/dashboard/audience-insights/page.js`):**
  * Provides granular support analytics: total supporters count, support value distribution brackets, and conversion rates.
  * Features a **Top Supporters Leaderboard** showing active backers.
  * Integrates with the backend stats API to dynamically fetch audience metadata.
* **Payouts Dashboard (`app/dashboard/payouts/page.js`):**
  * Displays financial indicators: **Available Balance**, **Pending Clearance**, and **Total Withdrawn**.
  * Contains a **Withdrawal Request Modal** allowing creators to instantly request payouts to their configured methods (Stripe, PayPal, Crypto).
  * Includes transaction logs with search, time frame, and status-based filtering options.
* **Add Payout Method Portal (`app/dashboard/payouts/add/page.js` & [PayoutMethod.js](file:///d:/PracticeReact/getchai/models/PayoutMethod.js)):**
  * **Region-Based Localization:** Offers a region-selector to choose between United States (USD) and India (INR) localizations.
  * **Segmented Options:** Separates layout into **National / Domestic** and **International** tabs.
  * **Multiple Payout Channels:**
    * *National/Domestic:* Direct Bank Transfer (with Account Holder Name, Bank Name, Account Number, and IFSC validation) and UPI ID.
    * *International:* PayPal, Stripe (Connected Accounts), Wise, Payoneer, International Wire Transfer (SWIFT/IBAN), and Pink/USDC Crypto Wallets (Polygon chain).
  * **Dynamic Validation & Mongoose Persistence:** Validates credentials on submission and posts directly to `/api/dashboard/payouts/methods` to persist in MongoDB.
* **Virtual Wallet & Deposits System (`app/dashboard/wallet/page.js` & [WalletTransaction.js](file:///d:/PracticeReact/getchai/models/WalletTransaction.js)):**
  * **Mock Deposit Manager:** Provides interface to load mock currency (INR) using preset buttons (e.g., ₹500, ₹2,000) or custom input values.
  * **Ledger Accounting:** Persists deposit, payment, and withdrawal transactions on a secure schema, rendering a queryable transaction list with filter states.
  * **Unified Balance Display:** Renders the creator's live wallet balance in metrics dashboards and navigation panels.
 
### 9. Unified Platform Hub & Gated Content (`app/dashboard/platform/page.js`)
* **Advanced Search Creators (`Components/Platform/SearchCreators.js`):**
  * Live category filtering ribbon (`All`, `Design`, `Engineering`, `Writing`, `Video`).
  * Advanced sorting drop-down: Sort by Popularity (Views), Name (A-Z), or Funding Goal.
  * Dynamically queries the `/api/creators` endpoint with parameters (`q`, `category`, `sortBy`).
* **Public Profile Page (`Components/Platform/PublicProfile.js`):**
  * Public-facing page rendering creator bio, metrics, social links, support message board, and support/chai payment section.
* **Gated Creator Posts System (`app/api/posts/route.js`):**
  * Allows creators to write and publish updates locked behind a specific cumulative donation amount (minimum threshold).
  * Evaluates logged-in supporter's cumulative successful support to the creator dynamically.
  * Shows full post content if unlocked, or displays a lock overlay requesting additional support if cumulative donations are insufficient.
* **Supporter Message Feed Protection (`app/api/support/route.js`):**
  * Protects the creator's support message feed.
  * Full message details are visible to the creator themselves or any supporter who has contributed a lifetime total of at least ₹100.
  * Other users see obfuscated messages marked with a lock badge (`🔒 Locked. Support this creator to unlock the message feed!`).
 
### 10. Direct Messaging System (`Components/Platform/DirectMessagesView.js` & [Message.js](file:///d:/PracticeReact/getchai/models/Message.js))
* **In-App Supporter-Creator Chat:** Fully styled direct messaging system that lets creators and their supporters interact directly.
* **Conversation Aggregation:** Automatically groups message history under thread tabs, compiling a active list of unique interlocutors in a responsive sidebar.
* **Secure API Delivery:** Direct messages post and fetch from `/api/messages` and `/api/messages/conversations` dynamically, persisting in a secure MongoDB collection.
 
### 11. Payout Configuration & Threshold Safeguards
* **Payout Schedule Frequency:** Creators can customize their automatic deposit payouts (e.g. Every Friday, Monthly, or Manual) in their settings.
* **Minimum Withdrawal Enforcement:** Restricts creator balance withdrawals below a configurable threshold (e.g., minimum ₹1,000 withdrawal) to safeguard billing transfers.

---

## 🛠️ Technology Stack

* **Framework:** Next.js 16 (App Router)
* **Library:** React 19
* **Styling:** Tailwind CSS v4 (using `@tailwindcss/postcss`)
* **Database:** MongoDB & Mongoose
* **Authentication:** NextAuth.js & bcryptjs
* **Analytics/Charts:** Chart.js
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
