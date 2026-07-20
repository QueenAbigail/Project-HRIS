# Notifications Table Setup

## Overview
The `notifications` table has been successfully created in your Supabase database with full Row Level Security (RLS) and Realtime support enabled.

## Table Structure

### Columns
| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | UUID | gen_random_uuid() | Primary key |
| `user_id` | TEXT | - | References auth.users(id), CASCADE on delete |
| `title` | TEXT | - | Notification title, required |
| `body` | TEXT | - | Notification message, required |
| `type` | TEXT | SYSTEM | Enum: SYSTEM, APPROVAL, ANNOUNCEMENT |
| `is_read` | BOOLEAN | false | Read status flag |
| `metadata` | JSONB | null | Optional JSON for extra data (request_id, entity_type, etc) |
| `created_at` | TIMESTAMPTZ | now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | now() | Update timestamp |

## Database Features

### Indexes
- `notifications_user_id_idx` - Fast user lookups
- `notifications_is_read_idx` - Fast filtering by read status
- `notifications_user_id_is_read_idx` - Combined index for user + read status queries
- `notifications_created_at_idx` - Fast sorting/filtering by date
- `notifications_pkey` - Primary key index on id

### Row Level Security (RLS)
RLS is **enabled** on the table. Three policies are in place:

1. **SELECT Policy**: Users can only view their own notifications
   - Condition: `auth.uid()::text = user_id`
   
2. **UPDATE Policy**: Users can only update their own notifications
   - Condition: `auth.uid()::text = user_id`
   - Use case: Mark notification as read
   
3. **INSERT Policy**: Users can only insert notifications for themselves
   - Condition: `auth.uid()::text = user_id`

### Realtime Support
The table has been added to the `supabase_realtime` publication, enabling:
- Real-time subscriptions with Supabase Realtime
- Instant notifications when records are created/updated/deleted
- WebSocket support for live updates

## Usage Examples

### Prisma ORM
The `Notification` model is available in your Prisma schema:

```typescript
import { Notification, NotificationType } from '@prisma/client';

// Create a notification
const notification = await prisma.notification.create({
  data: {
    userId: 'user-uuid',
    title: 'Leave Request Approved',
    body: 'Your leave request for July 20-25 has been approved.',
    type: 'APPROVAL',
    metadata: {
      request_id: 'leave-123',
      entity_type: 'leave_request',
      link_id: '/dashboard/leave/123'
    }
  }
});

// Get unread notifications for a user
const unread = await prisma.notification.findMany({
  where: {
    userId: 'user-uuid',
    isRead: false
  },
  orderBy: { createdAt: 'desc' }
});

// Mark as read
await prisma.notification.update({
  where: { id: 'notification-id' },
  data: { isRead: true }
});
```

### Supabase Realtime (Client-side)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(supabaseUrl, supabaseKey);

// Subscribe to new notifications
supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('New notification:', payload.new);
    }
  )
  .subscribe();
```

## Notification Types Enum
```typescript
enum NotificationType {
  SYSTEM        // System notifications
  APPROVAL      // Approval-related (leave, shift swap, etc.)
  ANNOUNCEMENT  // General announcements
}
```

## Best Practices

1. **Use metadata field for context**: Store IDs and links in the metadata JSONB field
2. **Always include timestamp**: The `created_at` field is set automatically
3. **Mark as read on client**: Update `is_read: true` when user views notification
4. **Bulk queries**: Use the combined index for efficient queries on specific users
5. **Archive old notifications**: Consider implementing a cleanup job for very old notifications

## Security Notes

- ✅ RLS ensures users can only access their own notifications
- ✅ Foreign key constraint on user_id with CASCADE delete ensures data integrity
- ✅ Only authenticated users can access notifications (based on auth.uid())
- ✅ Realtime subscriptions are automatically filtered by RLS policies

## Migration Status

The table was created using:
- **Prisma Schema**: Added `Notification` model and `NotificationType` enum
- **Setup Script**: `scripts/setup-notifications.js` applied SQL directly to database
- **Prisma Client**: Generated and ready to use

To regenerate Prisma client in future:
```bash
pnpm prisma generate
```
