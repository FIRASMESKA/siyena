
-- Create profiles table for technicians
CREATE TABLE public.techniciens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nom TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.techniciens ENABLE ROW LEVEL SECURITY;

-- Technicians can view their own profile
CREATE POLICY "Technicians can view own profile"
ON public.techniciens FOR SELECT
USING (auth.uid() = user_id);

-- Technicians can update their own profile
CREATE POLICY "Technicians can update own profile"
ON public.techniciens FOR UPDATE
USING (auth.uid() = user_id);

-- Auto-create technician profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_technician()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.techniciens (user_id, nom, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nom', 'Technicien'), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_technician
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_technician();

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  technicien_id UUID REFERENCES public.techniciens(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Technicians can view their own notifications
CREATE POLICY "Technicians can view own notifications"
ON public.notifications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.techniciens
    WHERE techniciens.id = notifications.technicien_id
    AND techniciens.user_id = auth.uid()
  )
);

-- Technicians can mark their notifications as read
CREATE POLICY "Technicians can update own notifications"
ON public.notifications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.techniciens
    WHERE techniciens.id = notifications.technicien_id
    AND techniciens.user_id = auth.uid()
  )
);

-- Anyone authenticated can create notifications (maintenance agents)
CREATE POLICY "Authenticated users can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
