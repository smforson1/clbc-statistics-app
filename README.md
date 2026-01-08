# Ecclesia-Link - University Youth Church Management System

A modern, mobile-first web application designed for university-based youth churches to bridge the gap between anonymous event attendance and long-term membership tracking.

## Features

### 🎯 Core Modules

#### 1. Public Connect (No-Login Attendance)
- **QR Code Check-in**: Quick attendance via mobile-responsive forms
- **Anonymous Access**: No account creation required
- **Data Collection**: Name, age, phone, course, level, accommodation, visitor status
- **GDPR Compliant**: Clear data consent with privacy protection

#### 2. Admin & Statistics Dashboard
- **Event Management**: Create events with unique QR codes
- **Manual Headcount**: Simple counter for non-digital attendees
- **Real-time Analytics**: Live attendance tracking and demographic breakdowns
- **Member CRM**: Searchable database with inactive member alerts
- **Growth Trends**: Weekly/monthly attendance comparisons

### 🛠 Technical Stack

- **Frontend**: Next.js 15+ with React 19
- **Styling**: Tailwind CSS with dark/light mode
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with RBAC
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **QR Codes**: QRCode.js for generation

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecclesia-link
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema from `database-schema.sql`
   - Copy your project URL and anon key

4. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Database Setup

The application uses PostgreSQL via Supabase. Run the provided SQL schema to set up:

- **Members table**: Student information and attendance history
- **Events table**: Church events with QR code tokens
- **Attendance table**: Links members to events
- **Admin users table**: Role-based access control
- **RLS policies**: Row-level security for data protection
- **Functions**: Automated triggers and inactive member detection

## Usage

### For Students (Public)
1. Scan QR code at church entrance
2. Fill out mobile-friendly form
3. Receive confirmation with social media links

### For Admin Team
1. Access `/admin` with proper credentials
2. Create events and generate QR codes
3. Monitor real-time attendance
4. Track member engagement
5. Export reports for pastoral team

## Security Features

- **Data Privacy**: GDPR-compliant with explicit consent
- **Role-Based Access**: Admin, Stats Team, and Pastor roles
- **Encryption**: SSL/TLS for data in transit
- **Row-Level Security**: Database-level access control
- **Sensitive Data Protection**: Religious affiliation handling

## Key User Stories

### Student Experience
> "I want to scan a QR code and quickly enter my details so I can enter the service without standing in a long line."

### Stats Team
> "I want to see how many people from 'Engineering' or 'Hall A' attended today so we can plan targeted outreach."

### Pastor
> "I want a weekly PDF report sent to my email showing the number of first-timers vs. regular members."

## Project Structure

```
ecclesia-link/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard
│   ├── attend/            # Public attendance forms
│   └── globals.css        # Global styles
├── lib/                   # Utilities and configurations
│   ├── supabase.ts        # Supabase client
│   └── database.types.ts  # TypeScript types
├── database-schema.sql    # Database setup
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

Built with ❤️ for university youth ministry in 2026.