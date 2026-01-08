-- Ecclesia-Link Database Schema
-- University Youth Church Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Members table - Core member information
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    age INTEGER CHECK (age >= 16 AND age <= 35),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    course_of_study VARCHAR(255) NOT NULL,
    level VARCHAR(10) NOT NULL CHECK (level IN ('100', '200', '300', '400', 'Graduate')),
    hall_hostel VARCHAR(255) NOT NULL,
    visitor_status VARCHAR(20) NOT NULL CHECK (visitor_status IN ('First-Timer', 'Regular Member', 'Returning Guest')),
    data_consent BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_attendance_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table - Church events and services
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    description TEXT,
    qr_code_token VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    manual_headcount INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table - Links members to events
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    attendance_method VARCHAR(20) DEFAULT 'digital' CHECK (attendance_method IN ('digital', 'manual')),
    checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, event_id)
);

-- Admin users table (extends Supabase auth)
CREATE TABLE admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'stats_team', 'pastor')),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_members_phone ON members(phone_number);
CREATE INDEX idx_members_last_attendance ON members(last_attendance_date);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_qr_token ON events(qr_code_token);
CREATE INDEX idx_attendance_event ON attendance(event_id);
CREATE INDEX idx_attendance_member ON attendance(member_id);
CREATE INDEX idx_attendance_date ON attendance(checked_in_at);

-- Row Level Security (RLS) Policies
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policies for members table
CREATE POLICY "Public can insert members" ON members
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all members" ON members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

-- Policies for events table
CREATE POLICY "Public can view active events" ON events
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage events" ON events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.role IN ('admin', 'stats_team')
        )
    );

-- Policies for attendance table
CREATE POLICY "Public can insert attendance" ON attendance
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view attendance" ON attendance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

-- Functions and Triggers
CREATE OR REPLACE FUNCTION update_member_last_attendance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE members 
    SET last_attendance_date = NEW.checked_in_at,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.member_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_member_attendance
    AFTER INSERT ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION update_member_last_attendance();

-- Function to identify inactive members
CREATE OR REPLACE FUNCTION get_inactive_members(weeks_threshold INTEGER DEFAULT 3)
RETURNS TABLE (
    id UUID,
    full_name VARCHAR,
    phone_number VARCHAR,
    last_attendance_date TIMESTAMP,
    weeks_since_attendance INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.full_name,
        m.phone_number,
        m.last_attendance_date,
        EXTRACT(WEEK FROM CURRENT_DATE - m.last_attendance_date)::INTEGER as weeks_since_attendance
    FROM members m
    WHERE m.is_active = true
    AND (
        m.last_attendance_date IS NULL 
        OR m.last_attendance_date < CURRENT_DATE - INTERVAL '%s weeks', weeks_threshold
    )
    ORDER BY m.last_attendance_date ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql;