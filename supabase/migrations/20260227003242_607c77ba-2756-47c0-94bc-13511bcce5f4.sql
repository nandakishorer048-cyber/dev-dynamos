
-- Partner facilities (hospitals, labs, pharmacies)
CREATE TABLE public.partner_facilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  facility_type TEXT NOT NULL CHECK (facility_type IN ('hospital', 'lab', 'pharmacy', 'clinic')),
  address TEXT,
  city TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  phone TEXT,
  email TEXT,
  rating NUMERIC DEFAULT 4.0,
  total_reviews INTEGER DEFAULT 0,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  offers_home_collection BOOLEAN NOT NULL DEFAULT false,
  offers_home_delivery BOOLEAN NOT NULL DEFAULT false,
  operating_hours JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active facilities" ON public.partner_facilities FOR SELECT USING (is_active = true);

-- Test catalog
CREATE TABLE public.test_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID NOT NULL REFERENCES public.partner_facilities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price NUMERIC NOT NULL,
  commission_percent NUMERIC NOT NULL DEFAULT 10,
  turnaround_hours INTEGER DEFAULT 24,
  sample_type TEXT,
  preparation_instructions TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.test_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view available tests" ON public.test_catalog FOR SELECT USING (is_available = true);

-- Medicine catalog
CREATE TABLE public.medicine_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID NOT NULL REFERENCES public.partner_facilities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  generic_name TEXT,
  description TEXT,
  category TEXT,
  price NUMERIC NOT NULL,
  commission_percent NUMERIC NOT NULL DEFAULT 5,
  requires_prescription BOOLEAN NOT NULL DEFAULT false,
  dosage_form TEXT,
  strength TEXT,
  manufacturer TEXT,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.medicine_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view available medicines" ON public.medicine_catalog FOR SELECT USING (in_stock = true);

-- Test bookings
CREATE TABLE public.test_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  test_id UUID NOT NULL REFERENCES public.test_catalog(id),
  facility_id UUID NOT NULL REFERENCES public.partner_facilities(id),
  booking_date DATE NOT NULL,
  booking_time TIME,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'sample_collected', 'processing', 'completed', 'cancelled')),
  is_home_collection BOOLEAN NOT NULL DEFAULT false,
  collection_address TEXT,
  amount NUMERIC NOT NULL,
  commission_amount NUMERIC NOT NULL,
  stripe_payment_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  result_url TEXT,
  notes TEXT,
  symptoms_context TEXT,
  ai_recommendation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.test_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookings" ON public.test_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bookings" ON public.test_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON public.test_bookings FOR UPDATE USING (auth.uid() = user_id);

-- Medicine orders
CREATE TABLE public.medicine_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  facility_id UUID NOT NULL REFERENCES public.partner_facilities(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  delivery_type TEXT NOT NULL DEFAULT 'pickup' CHECK (delivery_type IN ('pickup', 'home_delivery')),
  delivery_address TEXT,
  total_amount NUMERIC NOT NULL,
  commission_amount NUMERIC NOT NULL,
  delivery_fee NUMERIC DEFAULT 0,
  stripe_payment_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  symptoms_context TEXT,
  ai_recommendation TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.medicine_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON public.medicine_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON public.medicine_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON public.medicine_orders FOR UPDATE USING (auth.uid() = user_id);

-- Medicine order items
CREATE TABLE public.medicine_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.medicine_orders(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES public.medicine_catalog(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL
);

ALTER TABLE public.medicine_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own order items" ON public.medicine_order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.medicine_orders WHERE id = order_id AND user_id = auth.uid()));
CREATE POLICY "Users can create own order items" ON public.medicine_order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.medicine_orders WHERE id = order_id AND user_id = auth.uid()));

-- AI symptom analyses log
CREATE TABLE public.symptom_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symptoms TEXT NOT NULL,
  ai_response JSONB NOT NULL,
  recommended_tests TEXT[],
  recommended_medicines TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.symptom_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own analyses" ON public.symptom_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own analyses" ON public.symptom_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_partner_facilities_updated_at BEFORE UPDATE ON public.partner_facilities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_test_bookings_updated_at BEFORE UPDATE ON public.test_bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_medicine_orders_updated_at BEFORE UPDATE ON public.medicine_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed partner facilities
INSERT INTO public.partner_facilities (name, facility_type, address, city, rating, total_reviews, offers_home_collection, offers_home_delivery, phone) VALUES
('Apollo Diagnostics', 'lab', '123 Healthcare Ave', 'Mumbai', 4.5, 1250, true, false, '+91-9876543210'),
('Fortis Hospital', 'hospital', '456 Medical Blvd', 'Mumbai', 4.7, 3200, true, true, '+91-9876543211'),
('MedPlus Pharmacy', 'pharmacy', '789 Wellness St', 'Mumbai', 4.2, 890, false, true, '+91-9876543212'),
('Dr. Lal PathLabs', 'lab', '321 Diagnostic Rd', 'Delhi', 4.6, 2100, true, false, '+91-9876543213'),
('Max Healthcare', 'hospital', '654 Health Park', 'Delhi', 4.8, 4500, true, true, '+91-9876543214'),
('Netmeds Pharmacy', 'pharmacy', '987 Pharma Lane', 'Bangalore', 4.1, 670, false, true, '+91-9876543215');

-- Seed test catalog
INSERT INTO public.test_catalog (facility_id, name, description, category, price, commission_percent, turnaround_hours, sample_type, preparation_instructions)
SELECT f.id, t.name, t.description, t.category, t.price, t.commission, t.hours, t.sample, t.prep
FROM public.partner_facilities f
CROSS JOIN (VALUES
  ('Complete Blood Count (CBC)', 'Comprehensive blood analysis including RBC, WBC, platelets', 'Blood Test', 450, 10, 6, 'Blood', 'No fasting required'),
  ('Lipid Profile', 'Cholesterol and triglycerides analysis', 'Blood Test', 800, 12, 12, 'Blood', 'Fasting for 12 hours required'),
  ('Thyroid Profile (T3, T4, TSH)', 'Complete thyroid function test', 'Hormone Test', 1200, 10, 24, 'Blood', 'No special preparation'),
  ('HbA1c', 'Glycated hemoglobin for diabetes monitoring', 'Diabetes', 600, 8, 8, 'Blood', 'No fasting required'),
  ('Liver Function Test', 'Complete liver panel including ALT, AST, bilirubin', 'Organ Function', 900, 10, 12, 'Blood', 'Fasting for 8 hours recommended'),
  ('Vitamin D Test', '25-Hydroxy Vitamin D level', 'Vitamin Test', 1100, 15, 24, 'Blood', 'No special preparation')
) AS t(name, description, category, price, commission, hours, sample, prep)
WHERE f.facility_type IN ('lab', 'hospital');

-- Seed medicine catalog
INSERT INTO public.medicine_catalog (facility_id, name, generic_name, description, category, price, commission_percent, requires_prescription, dosage_form, strength, manufacturer)
SELECT f.id, m.name, m.generic, m.description, m.category, m.price, m.commission, m.rx, m.form, m.strength, m.manufacturer
FROM public.partner_facilities f
CROSS JOIN (VALUES
  ('Dolo 650', 'Paracetamol', 'Pain and fever relief', 'Pain Relief', 35, 5, false, 'Tablet', '650mg', 'Micro Labs'),
  ('Crocin Advance', 'Paracetamol', 'Fast-acting pain reliever', 'Pain Relief', 45, 5, false, 'Tablet', '500mg', 'GSK'),
  ('Cetirizine', 'Cetirizine HCl', 'Antihistamine for allergies', 'Allergy', 30, 5, false, 'Tablet', '10mg', 'Cipla'),
  ('ORS Sachets', 'Oral Rehydration Salts', 'Electrolyte replacement', 'General', 25, 3, false, 'Powder', 'Standard', 'WHO Formula'),
  ('Azithromycin 500', 'Azithromycin', 'Antibiotic for bacterial infections', 'Antibiotic', 120, 8, true, 'Tablet', '500mg', 'Alkem'),
  ('Pantoprazole', 'Pantoprazole', 'Acid reflux and gastric relief', 'Gastric', 85, 5, false, 'Tablet', '40mg', 'Sun Pharma')
) AS m(name, generic, description, category, price, commission, rx, form, strength, manufacturer)
WHERE f.facility_type IN ('pharmacy', 'hospital');
