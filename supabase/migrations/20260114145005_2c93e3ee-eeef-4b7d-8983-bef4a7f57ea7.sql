-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Create trigger function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create salas table
CREATE TABLE public.salas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  capacidade INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on salas
ALTER TABLE public.salas ENABLE ROW LEVEL SECURITY;

-- Salas RLS policies
CREATE POLICY "Users can view their own rooms"
ON public.salas FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rooms"
ON public.salas FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rooms"
ON public.salas FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rooms"
ON public.salas FOR DELETE
USING (auth.uid() = user_id);

-- Create reservas table
CREATE TABLE public.reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sala_id UUID REFERENCES public.salas(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on reservas
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- Reservas RLS policies
CREATE POLICY "Users can view their own reservations"
ON public.reservas FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reservations"
ON public.reservas FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reservations"
ON public.reservas FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reservations"
ON public.reservas FOR DELETE
USING (auth.uid() = user_id);