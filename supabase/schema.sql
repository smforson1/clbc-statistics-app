-- Branches
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  role VARCHAR(50) DEFAULT 'admin', -- 'super_admin', 'admin', 'viewer'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Forms
CREATE TABLE IF NOT EXISTS public.forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(100),
  event_date DATE,
  event_time TIME,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'closed', 'scheduled'
  form_schema JSONB NOT NULL, -- Stores form fields structure
  qr_code_url VARCHAR(500),
  short_url VARCHAR(100) UNIQUE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  allow_multiple_submissions BOOLEAN DEFAULT TRUE,
  branch_id UUID NOT NULL REFERENCES public.branches(id)
);

ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

-- Form Responses
CREATE TABLE IF NOT EXISTS public.form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE,
  response_data JSONB NOT NULL, -- Stores all field responses
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitter_ip VARCHAR(45),
  submitter_user_agent TEXT,
  branch_id UUID NOT NULL REFERENCES public.branches(id)
);

ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;

-- Members
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  date_of_birth DATE,
  gender VARCHAR(20),
  address TEXT,
  membership_status VARCHAR(50) DEFAULT 'active',
  join_date DATE,
  photo_url VARCHAR(500),
  notes TEXT,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Member Ministries (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.member_ministries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  ministry_name VARCHAR(100) NOT NULL,
  joined_date DATE,
  active BOOLEAN DEFAULT TRUE
);

ALTER TABLE public.member_ministries ENABLE ROW LEVEL SECURITY;

-- Events
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name VARCHAR(255) NOT NULL,
  event_type VARCHAR(100),
  event_date DATE NOT NULL,
  event_time TIME,
  location VARCHAR(255),
  description TEXT,
  expected_attendance INTEGER,
  budget DECIMAL(10, 2),
  created_by UUID REFERENCES public.profiles(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Event Resources
CREATE TABLE IF NOT EXISTS public.event_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  resource_name VARCHAR(255),
  quantity INTEGER,
  assigned_to VARCHAR(255),
  notes TEXT
);

ALTER TABLE public.event_resources ENABLE ROW LEVEL SECURITY;

-- Messages/Communications
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_type VARCHAR(50), -- 'sms', 'email', 'whatsapp'
  subject VARCHAR(255),
  body TEXT NOT NULL,
  recipients JSONB, -- Array of recipient IDs or phone numbers
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'scheduled', 'sent', 'failed'
  created_by UUID REFERENCES public.profiles(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Activity Log
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  branch_id UUID REFERENCES public.branches(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their branch activity logs"
  ON public.activity_log FOR SELECT
  USING (branch_id = public.get_user_branch_id());

-- RLS Policies

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Branches
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Branches are viewable by authenticated users." ON public.branches
  FOR SELECT TO authenticated USING (true);

-- Member Ministries
CREATE POLICY "Admins can manage their branch member ministries"
  ON public.member_ministries FOR ALL
  TO authenticated
  USING (member_id IN (SELECT id FROM public.members));

-- Event Resources
CREATE POLICY "Admins can manage their branch event resources"
  ON public.event_resources FOR ALL
  TO authenticated
  USING (event_id IN (SELECT id FROM public.events));

-- Functions to get current user's branch
CREATE OR REPLACE FUNCTION public.get_user_branch_id()
RETURNS UUID AS $$
  SELECT branch_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Forms
CREATE POLICY "Anyone can view active forms"
  ON public.forms FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage their branch forms"
  ON public.forms FOR ALL
  TO authenticated
  USING (branch_id = public.get_user_branch_id());

-- Form Responses
CREATE POLICY "Anyone can insert form responses." ON public.form_responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Responses are viewable by authenticated users of the branch." ON public.form_responses
  FOR SELECT USING (branch_id = public.get_user_branch_id());

-- Members
CREATE POLICY "Members are viewable by authenticated users of the branch." ON public.members
  FOR SELECT USING (branch_id = public.get_user_branch_id());

CREATE POLICY "Authenticated users can manage branch members." ON public.members
  FOR ALL USING (branch_id = public.get_user_branch_id());

-- PRAYER REQUESTS TABLE
CREATE TABLE prayer_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  requester_name TEXT NOT NULL,
  requester_email TEXT,
  request_content TEXT NOT NULL,
  category TEXT DEFAULT 'General', -- Options: Healing, Financial, Deliverance, Family, etc.
  status TEXT DEFAULT 'pending', -- Options: pending, praying, answered, closed
  is_anonymous BOOLEAN DEFAULT false,
  is_urgent BOOLEAN DEFAULT false,
  admin_notes TEXT,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- RLS for PRAYER REQUESTS
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage their branch prayer requests"
  ON prayer_requests FOR ALL
  TO authenticated
  USING (branch_id = public.get_user_branch_id());

CREATE POLICY "Anyone can submit a prayer request"
  ON prayer_requests FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Admins can manage their branch messages"
  ON public.messages FOR ALL
  TO authenticated
  USING (branch_id = public.get_user_branch_id());

-- DATA MIGRATION & INITIALIZATION
-- This part should be run once. In a real migration, you'd use a more robust script.
DO $$
DECLARE
  default_branch_id UUID;
BEGIN
  -- 1. Create default branch if none exists
  IF NOT EXISTS (SELECT 1 FROM public.branches LIMIT 1) THEN
    INSERT INTO public.branches (name, location)
    VALUES ('CLBC Kumasi Network', 'Kumasi KNUST Campus')
    RETURNING id INTO default_branch_id;
  ELSE
    SELECT id INTO default_branch_id FROM public.branches ORDER BY created_at LIMIT 1;
    -- Optionally rename it if it was still the default name
    UPDATE public.branches SET name = 'CLBC Kumasi Network' WHERE id = default_branch_id AND name = 'CLBC Main';
  END IF;

  -- 2. Assign existing data to default branch
  UPDATE public.profiles SET branch_id = default_branch_id WHERE branch_id IS NULL;
  UPDATE public.forms SET branch_id = default_branch_id WHERE branch_id IS NULL;
  UPDATE public.form_responses SET branch_id = default_branch_id WHERE branch_id IS NULL;
  UPDATE public.members SET branch_id = default_branch_id WHERE branch_id IS NULL;
  UPDATE public.events SET branch_id = default_branch_id WHERE branch_id IS NULL;
  UPDATE public.messages SET branch_id = default_branch_id WHERE branch_id IS NULL;
  UPDATE public.prayer_requests SET branch_id = default_branch_id WHERE branch_id IS NULL;
END $$;

-- AUTO BRANCH_ID ASSIGNMENT TRIGGER
CREATE OR REPLACE FUNCTION public.set_branch_id()
RETURNS trigger AS $$
BEGIN
  IF NEW.branch_id IS NULL THEN
    NEW.branch_id := public.get_user_branch_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to all filtered tables
CREATE TRIGGER tr_forms_set_branch BEFORE INSERT ON public.forms FOR EACH ROW EXECUTE FUNCTION public.set_branch_id();
CREATE TRIGGER tr_members_set_branch BEFORE INSERT ON public.members FOR EACH ROW EXECUTE FUNCTION public.set_branch_id();
CREATE TRIGGER tr_events_set_branch BEFORE INSERT ON public.events FOR EACH ROW EXECUTE FUNCTION public.set_branch_id();
CREATE TRIGGER tr_messages_set_branch BEFORE INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.set_branch_id();
CREATE TRIGGER tr_prayer_requests_set_branch BEFORE INSERT ON public.prayer_requests FOR EACH ROW EXECUTE FUNCTION public.set_branch_id();
CREATE TRIGGER tr_activity_log_set_branch BEFORE INSERT ON public.activity_log FOR EACH ROW EXECUTE FUNCTION public.set_branch_id();

-- SPECIAL TRIGGER FOR FORM RESPONSES (Anonymous Submissions)
CREATE OR REPLACE FUNCTION public.set_form_response_branch_id()
RETURNS trigger AS $$
BEGIN
  IF NEW.branch_id IS NULL THEN
    -- Inherit branch_id from the parent form
    SELECT branch_id INTO NEW.branch_id FROM public.forms WHERE id = NEW.form_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_form_responses_set_branch BEFORE INSERT ON public.form_responses FOR EACH ROW EXECUTE FUNCTION public.set_form_response_branch_id();

-- TRIGGER FOR AUTOMATIC PROFILE CREATION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  target_branch_id UUID;
BEGIN
  -- Extract branch_id from user metadata if provided
  target_branch_id := (new.raw_user_meta_data->>'branch_id')::UUID;

  -- Default to the first branch if none provided
  IF target_branch_id IS NULL THEN
    SELECT id INTO target_branch_id FROM public.branches ORDER BY created_at LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, branch_id, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    target_branch_id,
    COALESCE(new.raw_user_meta_data->>'role', 'admin')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
