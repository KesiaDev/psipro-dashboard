
-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  cpf TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'new')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own patients" ON public.patients FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own patients" ON public.patients FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own patients" ON public.patients FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own patients" ON public.patients FOR DELETE USING (user_id = auth.uid());

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create financial_records table
CREATE TABLE public.financial_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'income' CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL DEFAULT 'session',
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'pix', 'credit_card', 'debit_card', 'bank_transfer', 'other')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue', 'cancelled')),
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own financial records" ON public.financial_records FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own financial records" ON public.financial_records FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own financial records" ON public.financial_records FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own financial records" ON public.financial_records FOR DELETE USING (user_id = auth.uid());

CREATE TRIGGER update_financial_records_updated_at BEFORE UPDATE ON public.financial_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
