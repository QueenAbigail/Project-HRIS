const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupNotifications() {
  try {
    console.log('Setting up notifications table...');

    // Create the notifications table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'SYSTEM',
        is_read BOOLEAN DEFAULT false,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log('✓ Notifications table created');

    // Create indexes
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);`
    );
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON public.notifications(is_read);`
    );
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS notifications_user_id_is_read_idx ON public.notifications(user_id, is_read);`
    );
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at);`
    );
    console.log('✓ Indexes created');

    // Enable RLS
    await prisma.$executeRawUnsafe(
      `ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;`
    );
    console.log('✓ Row Level Security enabled');

    // Drop existing policies
    await prisma.$executeRawUnsafe(
      `DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;`
    );
    await prisma.$executeRawUnsafe(
      `DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;`
    );
    await prisma.$executeRawUnsafe(
      `DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;`
    );

    // Create RLS policies
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Users can view their own notifications"
      ON public.notifications FOR SELECT
      USING (auth.uid()::text = user_id);
    `);
    console.log('✓ SELECT policy created');

    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Users can update their own notifications"
      ON public.notifications FOR UPDATE
      USING (auth.uid()::text = user_id);
    `);
    console.log('✓ UPDATE policy created');

    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Users can insert their own notifications"
      ON public.notifications FOR INSERT
      WITH CHECK (auth.uid()::text = user_id);
    `);
    console.log('✓ INSERT policy created');

    // Grant permissions
    await prisma.$executeRawUnsafe(
      `GRANT SELECT, UPDATE ON public.notifications TO authenticated;`
    );
    await prisma.$executeRawUnsafe(
      `GRANT INSERT ON public.notifications TO authenticated;`
    );
    console.log('✓ Permissions granted to authenticated users');

    // Enable Realtime
    try {
      await prisma.$executeRawUnsafe(
        `ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;`
      );
      console.log('✓ Realtime enabled for notifications table');
    } catch (err) {
      // Table might already be in publication
      console.log('ℹ Realtime note:', err.message);
    }

    console.log('\n✅ Notifications table setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up notifications:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupNotifications();
