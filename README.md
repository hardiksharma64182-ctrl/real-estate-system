# LuxeEstate — Real Estate Management System

A modern, professional, and fully responsive **Real Estate Management System** built with React.js, Tailwind CSS, Lucide Icons, and Supabase.

---

## 🌟 Live Demo & Quick Start

The dev server is currently running locally at:
👉 **http://localhost:5173/**

### To Start the Project Manually:
```bash
cd "C:\Users\Keshav Bhardwaj\.gemini\antigravity\scratch\real-estate-system"
npm run dev
```

---

## 🔑 Demo One-Click Accounts & Roles

You can switch roles instantly using the top navigation bar or the Auth modal:

| Role | Name | Email | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | Eleanor Vance | `admin@luxeestate.com` | Full CRUD across all properties, owners, agents, customers, bookings, and dashboard analytics |
| **Agent** | Sophia Lorenza | `sophia.lorenza@luxeestate.com` | Manage assigned listings, view client bookings, update visit notes |
| **Customer** | Jonathan Reed | `j.reed@techcapital.io` | Search & filter listings, schedule private tours, view "My Bookings" |

---

## 🏛️ Project Architecture & Key Features

### 1. Home Landing Page
- **Navigation Bar**: Logo, responsive mobile drawer, quick links, "Bookings" status shortcut, demo role switcher, and database status indicator.
- **Hero Section**: Headline *"Find Your Perfect Property, Your Future Starts Here."* with an interactive search bar (Location, Property Type, Budget filters) and KPI counters.
- **Featured Properties**: Interactive filter tabs (All, Villa, Apartment, House, Commercial) displaying price, specs, location, and quick actions.
- **Popular Locations**: Miami Beach, Manhattan, Beverly Hills, Austin, Chicago, and Scottsdale with dynamic filtering on click.
- **About Us & Pillars**: 15+ years experience distinction, verified ownership standards, and elite broker network.
- **Our Services**: Sales, Acquisitions, Owner Asset Management, Private Tour Scheduling, Valuation & Commercial Hubs.
- **Customer Testimonials**: Verified client reviews with ratings and portfolio acquisitions.
- **Contact Us & Newsletter**: Validated inquiry form, global headquarters details, phone, email, and concierge hours.

### 2. Properties Management
- **Full Catalog**: View all properties in **Grid View** or **Table/List View**.
- **Search & Filters**: Real-time search by title, address, or keyword; filters for City/Region, Property Type, Availability (Available, Under Offer, Sold, Rented), Budget range, and Min Bedrooms.
- **Add / Edit / Delete Property**: Full modal with image upload (Supabase Storage + Base64 fallback + luxury photo presets), title, price, bedrooms, bathrooms, area (sq. ft.), owner selector, agent selector, and amenities.
- **Property Details Modal**: High-res hero imagery, complete specifications grid, owner info box, assigned agent contact, and direct "Schedule Private Tour" trigger.

### 3. Owners Management
- **Owner Directory**: Owner name, contact phone (clickable `tel:`), email (clickable `mailto:`), physical address, and notes.
- **Owned Assets**: Dynamically calculated list of properties owned with total portfolio value.
- **CRUD Operations**: Add new owners, edit details, and remove owners with confirmation dialogs.

### 4. Agents Management
- **Broker Directory**: Agent profile photo, legal name, specialty, years of experience, rating (e.g. 4.9 ★), and total closed deals.
- **Assigned Listings**: Interactive cards of listings assigned to each broker.
- **CRUD Operations**: Add licensed brokers, edit credentials, and delete agent records.

### 5. Customers Management
- **Client CRM**: Name, email, phone number, address, interested property target, and registration date.
- **Enquiry & Tour History**: Full chronological history of tour bookings submitted by each client.
- **CRUD Operations**: Add client records, update requirements, and remove customer profiles.

### 6. Booking Management
- **Customer Tour Booking Flow**: Select preferred visit date, time slot (Morning, Afternoon, Sunset Hour), contact info, and special visit notes.
- **Admin Tour Management**:
  - Filter bookings by tabs: **All**, **Pending**, **Approved**, **Completed**, **Rejected**.
  - One-click **Approve** or **Reject** actions.
  - **Assign Broker**: Dropdown to assign any licensed agent to conduct the tour.
  - Status updates and booking cancellation.
- **Customer "My Bookings" Modal**: Self-service modal for tracking tour confirmations and broker contact details.

### 7. Admin Dashboard
- **Key Metrics (KPIs)**: Total Properties, Available Properties, Total Owners, Total Agents, Total Customers, Total Bookings, and Combined Portfolio Value.
- **Interactive SVG Charts**:
  - Monthly Tour Bookings Trend chart comparing scheduled tours vs targets.
  - Property Category composition donut/progress bars (Villa, Apartment, House, Commercial).
  - Booking Queue status counters (Pending, Approved, Completed, Rejected).
- **Recent Booking Requests Table**: Instant approve/reject action buttons.
- **Recent Property Listings Grid**: Quick inspection cards.
- **Clean Sidebar**: Seamlessly switch between Overview, Properties, Owners, Agents, Customers, Bookings, and Database Settings.

---

## 🗄️ Supabase Cloud & Local-First Hybrid Setup

This system includes a **hybrid data layer** (`dataService.js`):
1. **Out-of-the-Box Local Persistence**: Pre-populated with realistic sample data stored in `localStorage`. All CRUD operations, image uploads, bookings, and auth states persist across page reloads without requiring any setup!
2. **Supabase Live Cloud Integration**:
   - Ready-to-run SQL schema: `supabase-schema.sql` (creates `properties`, `owners`, `agents`, `customers`, `bookings`, `storage.buckets`, and RLS policies).
   - Enter your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`, or configure them directly inside the app by clicking the **"Database"** pill in the top navbar.
   - The app will automatically connect and sync with your live Supabase cloud database!
