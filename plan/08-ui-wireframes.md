# Component Specifications & UI Wireframes (Mobile-First)

**Design System:**
- Touch targets: Minimum 44x44px (iOS) / 48x48px (Android)
- Typography: Minimum 16px body text (prevents zoom on iOS input focus)
- Spacing: 16px base unit for comfortable thumb navigation
- Bottom navigation: 64px height, always visible
- Safe areas: Account for notch/home indicator (env(safe-area-inset-bottom))

---

## Auth Layout (Mobile-First)

**Mobile (320px - 428px):**
```
┌────────────────────────┐
│     (gradient bg)      │
│                        │
│   ┌────────────────┐   │
│   │  🏠 PropTech   │   │
│   │  Maintenance   │   │
│   └────────────────┘   │
│                        │
│   ┌────────────────┐   │
│   │ Email          │   │ ← 48px height
│   └────────────────┘   │
│                        │
│   ┌────────────────┐   │
│   │ Password    👁 │   │ ← Show/hide toggle
│   └────────────────┘   │
│                        │
│   ┌────────────────┐   │
│   │    LOGIN       │   │ ← 48px height, bold
│   └────────────────┘   │
│                        │
│   Don't have account?  │
│   Sign up (48px tap)   │ ← Underlined, 44px+ tap
│                        │
│   ▼ Show demo creds    │ ← Expandable
└────────────────────────┘
```

**Desktop (>768px): Centered card with max-width 400px**

---

## Dashboard Layout — Mobile (Primary Design)

**Mobile Bottom Navigation (Always Visible):**
```
┌─────────────────────────┐
│ Dashboard    🔔3  👤▾   │ ← Header 56px
├─────────────────────────┤
│ ← → ↓ Pull to refresh   │
│                         │
│ Stats Grid (2x2)        │
│ ┌─────────┬─────────┐   │
│ │   12    │    8    │   │ ← Each 100px min
│ │  Open   │ Assign  │   │
│ └─────────┴─────────┘   │
│ ┌─────────┬─────────┐   │
│ │   15    │    3    │   │
│ │ InProg  │ Urgent  │   │
│ └─────────┴─────────┘   │
│                         │
│ Recent Tickets          │
│ ┌───────────────────┐   │
│ │ Leaking faucet    │   │
│ │ 🔴 HIGH · OPEN    │   │ ← Full-width card
│ │ Apt 3B · 2h ago   │   │    72px min height
│ │ [Avatar] Ahmed    │   │    Swipeable right
│ └───────────────────┘   │
│ ┌───────────────────┐   │
│ │ Broken window     │   │
│ │ 🟡 MED · ASSIGNED │   │
│ │ Apt 5A · 1d ago   │   │
│ └───────────────────┘   │
│                         │
│        [scroll]         │
│                         │
├─────────────────────────┤
│ 🏠   🎫   ➕   🔔   👤  │ ← Bottom nav 64px
│Home Tickets New Notif Me│    Icon + label
└─────────────────────────┘
   ↑ Active (bold/colored)
```

**Tablet (768px): Same layout, 3-column stats grid**

---

## Ticket Card Component

```
Props:
  ticket: Ticket
  onClick: () => void

┌──────────────────────────────────────┐
│ Leaking faucet in kitchen            │
│                                      │
│ [OPEN]  [HIGH]         Apt 3B       │
│                                      │
│ 👤 Ahmed Tenant                      │
│ 🔧 Unassigned                        │
│ 💬 3 comments · 📷 2 images          │
│                                      │
│ Created 2 hours ago                  │
└──────────────────────────────────────┘
```

---

## Ticket Detail Page

```
┌──────────────────────────────────────┐
│ ← Back                              │
│                                      │
│ Leaking faucet in kitchen            │
│ [OPEN]  [HIGH]                       │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Created by: Ahmed Tenant         │ │
│ │ Assigned to: —                   │ │
│ │ Unit: Apt 3B                     │ │
│ │ Building: Sunrise Towers         │ │
│ │ Created: Feb 16, 2026            │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ── Manager Actions ──────────────── │
│ [ Assign Technician ▾ ]             │
│ [ Change Priority ▾ ]               │
│ [ Change Status ▾ ]                 │
│                                      │
│ ── Images ───────────────────────── │
│ ┌────┐ ┌────┐                       │
│ │ 📷 │ │ 📷 │                       │
│ └────┘ └────┘                       │
│                                      │
│ ── Activity Log ─────────────────── │
│ ● Created by Ahmed Tenant           │
│   Feb 16, 10:00 AM                  │
│ │                                    │
│ ● Assigned to Ali Technician         │
│   by Sara Manager                   │
│   Feb 16, 10:30 AM                  │
│ │                                    │
│ ● Status: Open → Assigned            │
│   Feb 16, 10:30 AM                  │
│                                      │
│ ── Comments ─────────────────────── │
│ ┌──────────────────────────────────┐ │
│ │ 👤 Ali Technician                │ │
│ │ I'll check it tomorrow at 10am   │ │
│ │ 1h ago                           │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Type a comment...            [→] │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

---

## Create Ticket Form (Mobile-First)

**Mobile Full-Screen:**
```
┌─────────────────────────┐
│ ←  Report Issue    [×]  │ ← Header 56px
├─────────────────────────┤
│                         │
│ Title *                 │
│ ┌─────────────────────┐ │
│ │ Leaking faucet...   │ │ ← 48px height
│ └─────────────────────┘ │
│                         │
│ Description *           │
│ ┌─────────────────────┐ │
│ │                     │ │
│ │ Describe issue...   │ │ ← Auto-grow
│ │                     │ │    Min 120px
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ Priority *              │
│ ┌────┐ ┌────┐ ┌────┐   │
│ │Low │ │ Med│ │High│   │ ← Radio cards
│ └────┘ └────┘ └────┘   │    80px height
│        [✓]              │    Icons
│                         │
│ Location                │
│ ┌─────────────────────┐ │
│ │ Unit (e.g. Apt 3B)  │ │ ← 48px height
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Building (optional) │ │
│ └─────────────────────┘ │
│                         │
│ Photos                  │
│ ┌─────────────────────┐ │
│ │     📷 📱 🖼️       │ │ ← 120px height
│ │ Tap to capture      │ │    Opens native
│ │   or upload         │ │    camera/gallery
│ └─────────────────────┘ │
│                         │
│ [Thumbnail] [Thumb] [×] │ ← Preview grid
│                         │
├─────────────────────────┤
│ ┌─────────────────────┐ │ ← Sticky bottom
│ │   SUBMIT TICKET     │ │    64px height
│ └─────────────────────┘ │    Always visible
└─────────────────────────┘
```

**Desktop (>768px): Modal dialog, 600px width**
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐ │
│   📷 Drag & drop or click to upload │
│   Max 5 images, 5MB each            │
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘ │
│                                      │
│ ┌────┐ ┌────┐ ┌────┐               │
│ │ 📷 │ │ 📷 │ │ ✕  │  (previews)  │
│ └────┘ └────┘ └────┘               │
│                                      │
│ [     Submit Report     ]            │
│                                      │
└──────────────────────────────────────┘
```

---

## Notification Bell Dropdown

```
┌──────────────────────┐
│ 🔔 Notifications (3) │
│ [Mark all as read]   │
├──────────────────────┤
│ ● New task assigned  │  (unread = bold)
│   Leaking faucet...  │
│   2h ago             │
├──────────────────────┤
│ ● Status updated     │
│   Broken window →    │
│   In Progress        │
│   5h ago             │
├──────────────────────┤
│ ○ Comment added      │  (read = dimmed)
│   Ali: I'll check... │
│   1d ago             │
├──────────────────────┤
│ View all →           │
└──────────────────────┘
```

---

## Assign Technician Dialog

```
┌──────────────────────────────────┐
│ Assign Technician         ✕     │
├──────────────────────────────────┤
│                                  │
│ Select a technician:             │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ 🔍 Search technicians...    │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ ○ Ali Technician             │ │
│ │   4 active tasks             │ │
│ ├──────────────────────────────┤ │
│ │ ● Omar Technician            │ │
│ │   2 active tasks             │ │
│ └──────────────────────────────┘ │
│                                  │
│           [ Assign ]             │
└──────────────────────────────────┘
```
