-- Fix search_path on validation trigger functions
CREATE OR REPLACE FUNCTION public.validate_order_inputs()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF length(NEW.order_number) > 50 THEN RAISE EXCEPTION 'Order number too long'; END IF;
  IF NEW.delivery_address IS NOT NULL AND length(NEW.delivery_address) > 500 THEN RAISE EXCEPTION 'Delivery address too long'; END IF;
  IF NEW.cancellation_reason IS NOT NULL AND length(NEW.cancellation_reason) > 500 THEN RAISE EXCEPTION 'Cancellation reason too long'; END IF;
  IF NEW.dispute_reason IS NOT NULL AND length(NEW.dispute_reason) > 500 THEN RAISE EXCEPTION 'Dispute reason too long'; END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_dispatch_inputs()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF length(NEW.pickup_location) > 500 THEN RAISE EXCEPTION 'Pickup location too long'; END IF;
  IF length(NEW.dropoff_location) > 500 THEN RAISE EXCEPTION 'Dropoff location too long'; END IF;
  IF NEW.package_description IS NOT NULL AND length(NEW.package_description) > 500 THEN RAISE EXCEPTION 'Package description too long'; END IF;
  RETURN NEW;
END;
$$;