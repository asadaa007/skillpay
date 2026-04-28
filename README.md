# SkillPay — Freelance Marketplace Platform

> A full-featured freelance marketplace connecting clients with skilled professionals — built with React, Firebase, and Stripe.

---

## Overview

SkillPay is a production-grade single-page application that replicates the core workflow of platforms like Fiverr and Upwork. It supports two distinct user flows:

- **Clients** post jobs, review applications, hire freelancers, and manage orders through to delivery.
- **Freelancers** create service gigs, apply to jobs, deliver work, and receive payments.

The platform is fully serverless — all backend logic is handled through Firebase (Auth, Firestore, Storage) with Stripe powering the payments layer.

---

## Live Features

### Jobs & Applications

- Clients post jobs with budgets, deadlines, and required skills
- Freelancers submit structured applications with cover letters and proposals
- Daily rate-limiting on posts and applications to prevent spam
- Job status lifecycle: Open → In Progress → Completed

### Gigs & Orders

- Freelancers create service gigs with tiers, descriptions, and media uploads
- Buyers browse by category and place orders directly
- Full order lifecycle: Pending → Active → Delivered → Completed/Disputed
- Order cards with real-time status updates

### Payments (Stripe)

- Stripe Checkout integration for order payments
- Transaction history per user
- Payment capture tied to order delivery confirmation

### User Profiles & Portfolio

- Rich profile pages with avatar, bio, skills, and ratings
- Portfolio section with project showcases, analytics, templates, and public sharing
- Skill verification system with badges and assessment questions

### Messaging

- Real-time chat between buyers and sellers on active orders
- Chat notifications integrated into the global notification system

### Disputes

- Buyers and sellers can raise disputes on orders
- Evidence submission, escalation flow, and moderation interface
- Admin dispute resolution queue

### Notifications

- Real-time Firestore-backed notification feed
- Covers job applications, order updates, messages, and disputes

### Authentication

- Email/password and Google OAuth sign-in
- Password reset flow
- Persistent sessions via Firebase Auth

---

## Tech Stack


| Layer                  | Technology                                  |
| ---------------------- | ------------------------------------------- |
| Frontend Framework     | React 18 (functional components, hooks)     |
| Build Tool             | Vite 5                                      |
| Styling                | Tailwind CSS, Headless UI, Heroicons        |
| Routing                | React Router v6 (nested + protected routes) |
| Backend / Database     | Firebase — Auth, Firestore, Cloud Storage   |
| Payments               | Stripe (Checkout + React Elements)          |
| Real-time              | Firestore `onSnapshot` listeners            |
| State Management       | React Context + custom hooks                |
| Notifications / Toasts | React Hot Toast                             |
| Image Uploads          | Firebase Storage + ImgBB                    |
| Hosting                | Firebase Hosting / Netlify-ready            |


---

## Architecture Highlights

- **Serverless architecture** — zero backend servers; all logic runs client-side against Firebase SDKs, with security enforced through Firestore Security Rules.
- **Custom hook layer** — data fetching and business logic are cleanly separated into dedicated hooks (`useOrders`, `useGigs`, `useGigData`, `useProfile`, `useAuth`), keeping components focused on rendering.
- **Role-based access** — Firestore rules enforce per-document permissions based on `uid` and `role` fields; admin-only moderation routes and operations are separately gated.
- **Protected routing** — an `AuthContext` provider wraps the router; all authenticated routes redirect unauthenticated users to `/login`.
- **Real-time UX** — order status, messages, and notifications subscribe to Firestore snapshot listeners for instant updates without polling.
- **Modular component structure** — features are co-located under their own sub-directories (`components/jobs/`, `components/Portfolio/`, `components/Disputes/`, `components/Payment/`, etc.).

---

## Project Structure

```
src/
├── App.jsx                  # Root router, layout, and auth provider wiring
├── main.jsx                 # App entry point with BrowserRouter + error boundary
├── config/
│   └── firebase.jsx         # Firebase SDK initialisation
├── contexts/
│   └── AuthContext.jsx      # Global auth state, user profile merging
├── hooks/
│   ├── useAuth.jsx          # Auth actions (login, register, Google OAuth)
│   ├── useOrders.jsx        # Order CRUD + Stripe checkout trigger
│   ├── useGigs.jsx          # Gig listing and filtering
│   ├── useGigData.jsx       # Single-gig data with reviews and seller info
│   └── useProfile.jsx       # Profile read/write
├── pages/                   # Route-level screen components
│   ├── Home.jsx
│   ├── Dashboard.jsx
│   ├── Jobs.jsx / JobDetails.jsx
│   ├── Profile.jsx
│   ├── Orders.jsx / OrderDetails.jsx
│   ├── Messages.jsx
│   ├── Disputes.jsx
│   └── admin/               # Moderation dashboards
├── components/              # Feature-grouped UI components
│   ├── jobs/
│   ├── Portfolio/
│   ├── Profile/
│   ├── Disputes/
│   ├── Payment/
│   ├── Chat/
│   └── Skills/
├── data/
│   └── skillQuestions.js    # Skill assessment question bank
└── utils/                   # Shared helpers and Firebase utilities
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- A Firebase project (Firestore, Auth, Storage enabled)
- A Stripe account (for payment features)

### Installation

```bash
git clone https://github.com/yourusername/skillpay.git
cd skillpay
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_STRIPE_PUBLIC_KEY=
VITE_IMGBB_API_KEY=
```

### Firebase Setup

Deploy Firestore rules and indexes:

```bash
firebase deploy --only firestore
```

### Run Locally

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

---

## Firestore Security Model

Security is enforced entirely at the database layer — no API server required. Key rules:

- Users can only read/write their own profile documents
- Orders are readable only by the buyer and seller involved
- Gigs are publicly readable but only writable by their owner
- Disputes are restricted to the parties on the linked order
- Admin-only collections (`moderation`, `disputes escalation`) require `role == 'admin'`

---

## Roadmap / Planned Improvements

- Server-side Stripe webhook handler for reliable payment confirmation (currently orders are created as `paymentStatus: 'unpaid'` and marked complete by the PaymentForm)
- Add end-to-end tests (Cypress or Playwright)
- Email notification delivery via SendGrid or Firebase Extensions
- PWA support for mobile offline access
- Freelancer availability calendar and booking slots

---

## License

MIT — see [LICENSE](LICENSE) for details.