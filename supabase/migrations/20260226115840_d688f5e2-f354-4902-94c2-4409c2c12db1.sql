
-- 1. App role enum
CREATE TYPE public.app_role AS ENUM ('student', 'vendor', 'rider', 'admin');

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- 3. User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1 $$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4. Auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student'));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Restaurants
CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cuisine TEXT NOT NULL DEFAULT 'Nigerian',
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  delivery_time TEXT NOT NULL DEFAULT '20-30 min',
  image TEXT NOT NULL DEFAULT '🍲',
  tag TEXT DEFAULT 'New',
  price_range TEXT DEFAULT '₦500–₦3,000',
  is_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view restaurants" ON public.restaurants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Vendors can insert restaurant" ON public.restaurants FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Vendors can update restaurant" ON public.restaurants FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Vendors can delete restaurant" ON public.restaurants FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- 6. Menu items
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  image TEXT NOT NULL DEFAULT '🍚',
  description TEXT DEFAULT '',
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view menu items" ON public.menu_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Vendors can insert menu items" ON public.menu_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants WHERE id = restaurant_id AND owner_id = auth.uid()));
CREATE POLICY "Vendors can update menu items" ON public.menu_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants WHERE id = restaurant_id AND owner_id = auth.uid()));
CREATE POLICY "Vendors can delete menu items" ON public.menu_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants WHERE id = restaurant_id AND owner_id = auth.uid()));

-- 7. Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL,
  student_id UUID NOT NULL REFERENCES auth.users(id),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  rider_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'Pending',
  total_amount INTEGER NOT NULL DEFAULT 0,
  delivery_fee INTEGER NOT NULL DEFAULT 150,
  delivery_address TEXT DEFAULT '',
  payment_method TEXT NOT NULL DEFAULT 'wallet',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Students create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Vendors view restaurant orders" ON public.orders FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants WHERE id = restaurant_id AND owner_id = auth.uid()));
CREATE POLICY "Vendors update restaurant orders" ON public.orders FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants WHERE id = restaurant_id AND owner_id = auth.uid()));
CREATE POLICY "Riders view assigned orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = rider_id);
CREATE POLICY "Riders update assigned orders" ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = rider_id);
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 8. Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id),
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (student_id = auth.uid() OR rider_id = auth.uid())));
CREATE POLICY "Users insert order items" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND student_id = auth.uid()));
CREATE POLICY "Vendors view order items" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o JOIN public.restaurants r ON r.id = o.restaurant_id WHERE o.id = order_id AND r.owner_id = auth.uid()));

-- 9. Wallets
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own wallet" ON public.wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own wallet" ON public.wallets FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance) VALUES (NEW.id, 0);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();

-- 10. Wallet transactions
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '💳',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own transactions" ON public.wallet_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own transactions" ON public.wallet_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 11. Dispatches
CREATE TABLE public.dispatches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_number TEXT NOT NULL,
  student_id UUID NOT NULL REFERENCES auth.users(id),
  rider_id UUID REFERENCES auth.users(id),
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  package_description TEXT DEFAULT '',
  fee INTEGER NOT NULL DEFAULT 250,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dispatches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own dispatches" ON public.dispatches FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Students create dispatches" ON public.dispatches FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Riders view assigned dispatches" ON public.dispatches FOR SELECT TO authenticated USING (auth.uid() = rider_id);
CREATE POLICY "Riders update assigned dispatches" ON public.dispatches FOR UPDATE TO authenticated USING (auth.uid() = rider_id);
CREATE POLICY "Admins view all dispatches" ON public.dispatches FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 12. Trip routes
CREATE TABLE public.trip_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  price INTEGER NOT NULL,
  seats_available INTEGER NOT NULL DEFAULT 14,
  next_departure TEXT DEFAULT '5 min',
  active BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.trip_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view routes" ON public.trip_routes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert routes" ON public.trip_routes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update routes" ON public.trip_routes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete routes" ON public.trip_routes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 13. Trip bookings
CREATE TABLE public.trip_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES public.trip_routes(id),
  student_id UUID NOT NULL REFERENCES auth.users(id),
  boarding_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trip_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own bookings" ON public.trip_bookings FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Students create bookings" ON public.trip_bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
