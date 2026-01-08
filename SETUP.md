# Ecclesia-Link Setup Guide

## Quick Setup Steps

### 1. Environment Setup
Copy the environment template:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup
1. Create a new Supabase project at https://supabase.com
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the entire contents of `database-schema.sql`
4. Run the SQL to create all tables, policies, and functions

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Application Structure

### Public Routes
- `/` - Landing page
- `/attend` - Public attendance form (QR code destination)
- `/attend/success` - Thank you page after check-in

### Admin Routes
- `/admin/login` - Admin authentication
- `/admin` - Dashboard with stats and analytics
- `/admin/events` - Event management and QR code generation
- `/admin/members` - Member directory and management

## Key Features Working

✅ **Public Attendance Form**
- Mobile-responsive design
- Form validation
- GDPR-compliant consent
- Automatic member creation/update
- Event-based attendance tracking

✅ **Admin Dashboard**
- Real-time statistics
- 7-day attendance chart
- Recent activity feed
- Inactive member alerts

✅ **Event Management**
- Create events with QR codes
- Generate printable QR codes
- Toggle event active/inactive status
- View attendance per event

✅ **Member Management**
- Searchable member directory
- Filter by status (active/inactive/first-timer)
- Contact integration (phone/WhatsApp)
- Attendance history tracking

## Database Features

✅ **Security**
- Row-level security policies
- Role-based access control
- Data encryption at rest

✅ **Automation**
- Auto-update member last attendance
- Inactive member detection function
- Attendance tracking triggers

## Next Steps

1. **Set up Supabase Authentication**
   - Configure email/password auth
   - Add admin users to `admin_users` table

2. **Customize for Your Church**
   - Update church name and branding
   - Modify course/hall options
   - Add your social media links

3. **Deploy to Production**
   - Deploy to Vercel/Netlify
   - Configure production environment variables
   - Set up custom domain

## Troubleshooting

**Common Issues:**
- Make sure Supabase URL and keys are correct
- Verify database schema is properly installed
- Check that admin users are added to `admin_users` table
- Ensure RLS policies are enabled

**Development Server Issues:**
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

The application is now ready for development and testing!