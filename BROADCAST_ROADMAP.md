# Broadcast Page Implementation Roadmap

## Status: UI Complete ✅
The broadcast page UI is complete with:
- 2 tabs: Announcements and Push Notifications
- 70/30 split layout on both tabs
- Create form on left, Posted/History on right
- Sidebar navigation integrated at `/system/broadcast`

---

## Remaining Tasks

### 1. Database Schema - Announcement Table
**Status:** Pending  
**Description:** Create the `Announcement` table structure in Supabase

**Required Fields (TBD based on design):**
- id (UUID, primary key)
- title (string, required)
- body (text, required)
- attachment_url (string, optional - PDF file URL from Supabase Storage)
- recipient_type (enum: PERSONAL, MULTI_SITE, SITE_WIDE, ALL_EMPLOYEE)
- recipient_data (JSON - store employee IDs or site IDs based on type)
- created_by (UUID - reference to user)
- created_at (timestamp)
- updated_at (timestamp)
- published_at (timestamp)

**Related:**
- Link to Push Notifications table (notifications)
- Consider RLS policies for access control

---

### 2. API Endpoints
**Status:** Not started  
**Routes needed:**

#### Announcements
- `POST /api/broadcast/announcements` - Create new announcement
- `GET /api/broadcast/announcements` - List all announcements
- `GET /api/broadcast/announcements/:id` - Get single announcement
- `PUT /api/broadcast/announcements/:id` - Update announcement
- `DELETE /api/broadcast/announcements/:id` - Delete announcement

#### Push Notifications
- `GET /api/broadcast/notifications` - Get notification history
- `POST /api/broadcast/notifications` - Send independent notification (admin only)

#### File Upload
- `POST /api/broadcast/upload-pdf` - Upload PDF to Supabase Storage (with signed URL generation)

---

### 3. Connect Real Data - Forms
**Status:** Not started  
**Tasks:**

#### Announcements Form
- [ ] Fetch employees list (for Personal/Multi-site dropdown)
- [ ] Fetch sites list (for Site-wide dropdown)
- [ ] Handle recipient selection based on type
- [ ] PDF upload to Supabase Storage (max 10MB)
- [ ] Form submission creates announcement + triggers notifications
- [ ] Show success/error messages

#### Push Notifications Form
- [ ] Similar recipient selection as announcements
- [ ] Send independent push notification
- [ ] Create notification record in DB

---

### 4. Automatic Push Notification Trigger
**Status:** Not started  
**Description:** When announcement is posted, automatically create push notifications

**Implementation:**
- **Option A (Selected):** Create separate notification row per recipient
  - Personal: 1 recipient = 1 row
  - Multi-site: 5 employees = 5 rows
  - Site-wide: 100 employees at site = 100 rows
  - All-employee: 500 employees = 500 rows

**Process:**
1. User submits announcement
2. System creates Announcement record
3. System determines recipient list based on type
4. System creates notification record FOR EACH recipient
5. Mobile app queries: `SELECT * FROM notifications WHERE userId = current_user`

---

### 5. Lists Component Enhancements
**Status:** Partially started  
**Tasks:**

#### AnnouncementsList
- [ ] Fetch from `/api/broadcast/announcements`
- [ ] Display with recipient count badge
- [ ] View button - show full content + recipient details
- [ ] Edit button - populate form with existing data
- [ ] Delete button - with confirmation dialog

#### NotificationHistory
- [ ] Fetch from `/api/broadcast/notifications`
- [ ] Deduplicate by announcement/notification batch (show 1 row per batch, not per recipient)
- [ ] Show recipient type and count
- [ ] View button - expand to show recipient list
- [ ] Sort by most recent

---

### 6. Form Validation & Error Handling
**Status:** Not started  
**Tasks:**
- [ ] Title validation (required, max length)
- [ ] Body validation (required, max length)
- [ ] Recipient validation (at least 1 selected)
- [ ] PDF file validation (only PDF, max 10MB)
- [ ] Show error messages to user
- [ ] Loading states during submission

---

### 7. Testing & Refinement
**Status:** Not started  
**Tasks:**
- [ ] Test create announcement flow
- [ ] Test recipient selection for each type
- [ ] Test PDF upload
- [ ] Test push notification triggering
- [ ] Verify notification history shows correctly
- [ ] Test edit/delete operations
- [ ] Test error handling

---

## Current Architecture

**File Structure:**
```
/app/system/broadcast/page.tsx                          # Main page
/components/broadcast/
  ├── create-announcement-form.tsx                      # Form for creating announcements
  ├── announcements-list.tsx                            # List of posted announcements
  ├── create-push-notification-form.tsx                 # Form for independent notifications
  ├── notification-history.tsx                          # History of all notifications
/app/system/layout.tsx                                  # System section layout with sidebar
/components/system/system-breadcrumb.tsx                # Breadcrumb navigation
```

**Database Tables (Planned):**
- `announcements` - Store announcement data
- `notifications` - Store notification records (one per recipient per notification)

**API Routes (To be created):**
- `/api/broadcast/announcements/*`
- `/api/broadcast/notifications`
- `/api/broadcast/upload-pdf`

---

## Dependencies

- Supabase for database and storage
- API Routes (Next.js)
- Form components already created (need data connection)
- Existing employee/site data from other tables

---

## Notes

- Access control: SUPER_ADMIN and HR_ADMIN only
- Mobile app handles displaying announcements (separate team)
- Notifications use Option A (separate row per recipient) for mobile app compatibility
- PDF files stored in Supabase Storage with signed URLs
