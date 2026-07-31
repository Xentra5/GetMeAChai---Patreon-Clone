# GetMeAChai ☕

A Patreon-clone crowdfunding platform built for creators to receive support, connect with their audience, and receive funding from their fans. I built this project to learn modern Next.js 16 development, implement a robust security architecture (including database transactions), and build a complete dashboard experience for content creators.

**[Live Demo Link (e.g. Vercel)]** | [How to Run Locally](#-getting-started)

---

## 🛠️ Technology Stack

* **Framework:** Next.js 16 (App Router) & React 19
* **Styling:** Tailwind CSS v4 (PostCSS integration)
* **Database:** MongoDB & Mongoose
* **Authentication:** NextAuth.js (Google, GitHub, and Credentials provider)
* **API Validation:** Zod
* **Analytics/Charts:** Chart.js
* **Mailing Service:** Brevo API

---

## 🚀 Key Features

* **User Authentication & Profiles:** Polished auth UX (password strength meter, show/hide toggle, session guards, and email OTP verification for secure signup).
* **Creator Onboarding:** A structured 4-step creator onboarding flow with identity verification, social proof connection, payout setup, and compliance review.
* **Creator Dashboard & Analytics:** Real-time metrics tracking (Monthly Revenue, Goal Progress, Profile Views) with interactive Chart.js line charts.
* **Localization-Aware Payout Settings:** Dynamic payout configuration filtering available payout methods (Domestic Bank, UPI, Stripe, PayPal, Crypto) based on selected region (India vs. US).
* **Virtual Wallet & Deposits:** Integrated ledger accounting allowing supporters to load mock currency via preset thresholds or custom inputs to support creators.
* **Gated Content & Protected Feeds:** Creator-facing updates locked behind specific cumulative donation amounts and obfuscated message feeds visible only to verified supporters.
* **Direct Messaging:** Direct creator-supporter chat system with conversation aggregation and responsive sidebars.

---

## 🛡️ Security Features & Best Practices

* **Atomic Wallet Transactions:** Financial operations run via MongoDB/Mongoose session transactions (`withTransaction()`) to guarantee consistency and prevent double-spending.
* **Password Complexity:** Hardened credentials using regex-based verification requiring upper/lowercase letters, numbers, and special characters.
* **Strict Schema Validation:** Sanitization of payment payloads and configuration updates using Zod.
* **Secure HTTP Headers:** Mitigation of typical web vulnerabilities (Clickjacking, XSS, MIME-sniffing) via security headers in `next.config.mjs`.
* **Two-Factor Authentication (2FA):** Opt-in email-based 2FA code generation and verification integrated within settings.
* **Active Session Guards:** Immediate client/server session checking to prevent authenticated users from accessing login or registration pages.

---

## 🧠 Key Learnings & Challenges

* **Handling Race Conditions in Financial States:** Implementing MongoDB transactions was a key learning curve. I designed a multi-step checkout workflow utilizing Mongoose's transaction API to ensure that wallet deductions, creator payouts, and ledger entries either all succeed or fail together.
* **Stateless Email Verification:** To avoid database pollution from fake signups, I structured a two-step stateless OTP verification system using signed JWT tokens to hold registration data until email verification is completed.
* **Dynamic Component Architectures:** Creating context-driven multi-step forms (like the onboarding flow) taught me how to manage global state without redundant prop-drilling or database writes before final form submission.

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

# Brevo Email Configuration
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_sender_email
BREVO_SENDER_NAME=GetMeAChai
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

---

## 🐳 Docker Deployment

You can build and run the application in a Docker container using the provided `Dockerfile` and `docker-compose.yml` config.

### 1. Build and Run with Docker Compose

To spin up both the Next.js application and a MongoDB database container simultaneously:

```bash
docker compose up --build
```

### 2. Standalone Docker Build

To build only the Next.js container (e.g., for production deployment clouds):

```bash
docker build -t getchai-app .
docker run -p 3000:3000 --env-file .env.local getchai-app
```
