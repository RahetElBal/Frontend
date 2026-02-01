# BeautiQ - Salon Management System
## Functionality Documentation

---

## Table of Contents

1. [Overview](#overview)
2. [User Roles](#user-roles)
3. [Admin Functionalities](#admin-functionalities)
4. [User (Salon Staff) Functionalities](#user-salon-staff-functionalities)
5. [Appointment Lifecycle](#appointment-lifecycle)
6. [Payment Flow](#payment-flow)
7. [Notifications System](#notifications-system)

---

## Overview

BeautiQ is a comprehensive salon management system that enables salon owners and staff to manage appointments, clients, services, and payments. The system supports multiple languages (English, French, Spanish, Arabic) and provides role-based access control.

---

## User Roles

### Superadmin
- Full access to all system features
- Can manage salons, users, services, products, and promotions
- Access to analytics and reporting
- Can create and modify default services

### Admin (Salon Owner)
- Manages their own salon
- Access to dashboard, agenda, clients, sales, and settings
- Cannot access: Services management, Products, Promotions, Staff management

### User (Salon Staff)
- Access to operational features for their assigned salon
- Can manage appointments, clients, and process payments

---

## Admin Functionalities

### 1. Dashboard
**Location:** `/admin/dashboard`

- **Overview Statistics:** View total salons, active users, revenue metrics
- **Recent Activity:** See latest salon registrations and user sign-ups
- **Quick Actions:** Access frequently used features

### 2. Salons Management
**Location:** `/admin/salon`

- **View Salons:** List all registered salons with their status
- **Create Salon:** Add new salons with name, address, contact information
- **Edit Salon:** Update salon details and settings
- **Salon Statistics:** View individual salon performance metrics

### 3. Users Management
**Location:** `/admin/users`

- **User List:** View all registered users across salons
- **Create User:** Add new users with role assignment
- **Edit User:** Update user information and permissions
- **User Statistics:** Track user activity and engagement

### 4. Analytics
**Location:** `/admin/analytics`

- **Revenue Overview:** View total revenue with period comparison
- **Appointment Metrics:** Track appointment counts and completion rates
- **Average Ticket:** Monitor average transaction value
- **Period Selection:** Filter by daily, weekly, monthly, yearly
- **Top Services:** View most booked services

### 5. Settings (Salon-specific)
**Location:** `/admin/salon-settings`

- **General Settings:** Business name, contact, operating hours
- **Booking Settings:** Appointment duration defaults, buffer times
- **Notification Settings:** Email and SMS preferences
- **Tax Settings:** Configure tax rates for services

---

## User (Salon Staff) Functionalities

### 1. Dashboard
**Location:** `/user/dashboard`

- **Today's Overview:** Appointments scheduled for today
- **Revenue Stats:** Daily/weekly/monthly revenue tracking
- **New Clients:** Track new client registrations
- **Top Services:** Most popular services

### 2. Agenda (Appointment Calendar)
**Location:** `/user/agenda`

- **Calendar Views:** Month, Week, Day, and Agenda views
- **Create Appointment:** 
  - Select client from list
  - Choose service
  - Pick date and time
  - Add optional notes
- **View Appointment:** Click to see full details
- **Edit Appointment:** Modify existing appointments
- **Cancel Appointment:** Cancel unpaid appointments only
- **Complete Appointment:** Mark service as delivered
- **Record Payment:** Process payment for completed appointments

**Status Indicators:**
- Confirmed (green)
- Pending (yellow)
- In Progress (blue)
- Completed (green checkmark)
- Cancelled (red)
- No Show (gray)

### 3. Clients Management
**Location:** `/user/clients`

- **Client List:** View all salon clients
- **Add Client:** Register new clients with contact info
- **Edit Client:** Update client information
- **Client History:** View past appointments and purchases
- **Search & Filter:** Find clients by name, email, or phone

### 4. Sales / Payments
**Location:** `/user/sales`

- **Sales List:** View all completed transactions
- **Sale Details:** 
  - Client information
  - Services/products purchased
  - Total amount
  - Payment status
- **Linked Appointments:** Sales are automatically linked to appointments

### 5. Services (View Only for Regular Staff)
**Location:** `/user/services`

- **Service Catalog:** Browse available services by category
- **Service Details:** View pricing, duration, description
- **Categories:** Nails, Makeup, Hair, Skincare (default)

---

## Appointment Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPOINTMENT LIFECYCLE                        │
└─────────────────────────────────────────────────────────────────┘

1. CREATION
   └─► Admin/User creates appointment
       ├─ Selects client
       ├─ Chooses service
       ├─ Sets date/time
       └─ Status: PENDING or CONFIRMED

2. CONFIRMATION (Optional)
   └─► Admin confirms appointment
       └─ Status: CONFIRMED

3. SERVICE DELIVERY
   └─► When appointment time arrives
       ├─ Client arrives → Status: IN_PROGRESS
       └─ Client doesn't show → Status: NO_SHOW

4. COMPLETION
   └─► Service is completed
       └─ Status: COMPLETED
           ├─ Payment Required
           └─ Payment Status: UNPAID

5. PAYMENT
   └─► Admin records payment
       ├─ Sale is created automatically
       ├─ Sale links to appointment
       ├─ Appointment marked as PAID
       └─ Status remains: COMPLETED

6. CANCELLATION (Alternative Path)
   └─► Before payment only
       ├─ Paid appointments cannot be cancelled
       └─ Status: CANCELLED

```

### Key Rules:
- **Cancellation is blocked for paid appointments** - Once payment is recorded, the appointment cannot be cancelled
- **Auto-completion on payment** - Recording payment automatically marks the appointment as completed
- **Sale-Appointment linking** - Each sale is linked to its source appointment for traceability

---

## Payment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                       PAYMENT FLOW                              │
└─────────────────────────────────────────────────────────────────┘

OPTION 1: Payment via Appointment Modal
────────────────────────────────────────
1. Open completed appointment in Agenda
2. Click "Record Payment" button
3. System automatically:
   ├─ Creates sale with appointment service
   ├─ Sets sale as COMPLETED
   ├─ Links sale to appointment
   ├─ Marks appointment as PAID
   └─ Updates appointment status to COMPLETED

OPTION 2: Direct Sale Entry
───────────────────────────
1. Navigate to Sales page
2. Create new sale
3. Select client and items
4. Complete transaction
   └─ Note: Can optionally link to existing appointment

```

### Sale Generation from Appointment:
When recording payment from an appointment:
- **Sale Items:** Auto-generated from appointment service
- **Price:** Uses canonical service price from database
- **Client:** Copied from appointment
- **Status:** Set to COMPLETED
- **Payment Status:** Set to PAID

---

## Notifications System

### 1. Upcoming Appointment Reminders
**Trigger:** 15 minutes before appointment start time

- Browser notification with client name and service
- Toast notification in the app
- Only for today's appointments that aren't cancelled/completed

### 2. Overdue Unpaid Notifications
**Trigger:** When viewing agenda with past unpaid appointments

- Checks for appointments where:
  - Date is before today, OR
  - Date is today AND end time has passed
  - AND appointment is not paid
  - AND appointment is not cancelled

- Shows warning toast with:
  - Client name
  - Service name
  - Appointment date and time

- Browser notification if permissions granted
- One notification per appointment per session (prevents spam)

### 3. Operation Confirmations
**Events that trigger notifications:**
- Appointment created/updated/deleted
- Appointment cancelled
- Payment recorded
- Client added/updated

---

## Feature Access Matrix

| Feature | Superadmin | Admin | User |
|---------|------------|-------|------|
| Dashboard | ✓ | ✓ | ✓ |
| Agenda | ✓ | ✓ | ✓ |
| Clients | ✓ | ✓ | ✓ |
| Services | ✓ (Full) | View Only | View Only |
| Products | ✓ | ✗ | ✗ |
| Promotions | ✓ | ✗ | ✗ |
| Staff | ✓ | ✗ | ✗ |
| Sales | ✓ | ✓ | ✓ |
| Analytics | ✓ | ✓ | ✓ |
| Settings | ✓ | ✓ | Limited |
| Salon Management | ✓ | ✗ | ✗ |
| User Management | ✓ | ✗ | ✗ |

---

## Multi-Language Support

The application supports 4 languages:
- **English (en)** - Default
- **French (fr)**
- **Spanish (es)**
- **Arabic (ar)** - RTL layout support

All UI elements, form labels, validation messages, and notifications are translated.

### Changing Language:
1. Click on the language selector in the header
2. Select desired language
3. Application reloads with new language

---

## Currency Formatting

- Amounts are formatted according to locale
- Supports multiple currencies (configurable per salon)
- Handles edge cases (null, undefined, NaN) gracefully
- Displays "0.00" for invalid values instead of "NaN"

---

## Error Handling

- **Form Validation:** Real-time validation with translated error messages
- **API Errors:** User-friendly error toasts
- **Error Boundary:** Graceful error recovery for component failures
- **Network Errors:** Retry mechanisms with user feedback

---

## Technical Notes

### Backend Endpoint Changes
- Appointments have `paid: boolean` field
- Sales have `appointmentId` field for linking
- Cancel endpoint rejects paid appointments

### Frontend State Management
- Optimistic updates for immediate UI feedback
- Query invalidation for data consistency
- Session storage for notification deduplication

---

*Document generated: February 2026*
*Version: 1.0*
