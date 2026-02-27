-- Add CHECK constraints for server-side input validation

-- Orders: total_amount and delivery_fee must be positive and bounded
DO $$ BEGIN
  ALTER TABLE public.orders ADD CONSTRAINT orders_total_amount_check CHECK (total_amount >= 0 AND total_amount < 10000000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.orders ADD CONSTRAINT orders_delivery_fee_check CHECK (delivery_fee >= 0 AND delivery_fee < 100000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Dispatches: fee must be positive and bounded
DO $$ BEGIN
  ALTER TABLE public.dispatches ADD CONSTRAINT dispatches_fee_check CHECK (fee > 0 AND fee < 1000000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Wallets: balance cannot go negative
DO $$ BEGIN
  ALTER TABLE public.wallets ADD CONSTRAINT wallets_balance_non_negative CHECK (balance >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Wallet transactions: amount must be bounded
DO $$ BEGIN
  ALTER TABLE public.wallet_transactions ADD CONSTRAINT wallet_tx_amount_check CHECK (amount > -10000000 AND amount < 10000000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Menu items: price must be positive
DO $$ BEGIN
  ALTER TABLE public.menu_items ADD CONSTRAINT menu_items_price_check CHECK (price > 0 AND price < 10000000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Text length constraints via validation trigger
CREATE OR REPLACE FUNCTION public.validate_order_inputs()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF length(NEW.order_number) > 50 THEN
    RAISE EXCEPTION 'Order number too long';
  END IF;
  IF NEW.delivery_address IS NOT NULL AND length(NEW.delivery_address) > 500 THEN
    RAISE EXCEPTION 'Delivery address too long';
  END IF;
  IF NEW.cancellation_reason IS NOT NULL AND length(NEW.cancellation_reason) > 500 THEN
    RAISE EXCEPTION 'Cancellation reason too long';
  END IF;
  IF NEW.dispute_reason IS NOT NULL AND length(NEW.dispute_reason) > 500 THEN
    RAISE EXCEPTION 'Dispute reason too long';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_order_inputs_trigger ON public.orders;
CREATE TRIGGER validate_order_inputs_trigger
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.validate_order_inputs();

-- Dispatch text validation
CREATE OR REPLACE FUNCTION public.validate_dispatch_inputs()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF length(NEW.pickup_location) > 500 THEN
    RAISE EXCEPTION 'Pickup location too long';
  END IF;
  IF length(NEW.dropoff_location) > 500 THEN
    RAISE EXCEPTION 'Dropoff location too long';
  END IF;
  IF NEW.package_description IS NOT NULL AND length(NEW.package_description) > 500 THEN
    RAISE EXCEPTION 'Package description too long';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_dispatch_inputs_trigger ON public.dispatches;
CREATE TRIGGER validate_dispatch_inputs_trigger
  BEFORE INSERT OR UPDATE ON public.dispatches
  FOR EACH ROW EXECUTE FUNCTION public.validate_dispatch_inputs();

-- Update topup_wallet to use a unique label with reference to prevent race conditions
CREATE OR REPLACE FUNCTION public.topup_wallet(_user_id uuid, _amount integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _wallet RECORD;
BEGIN
  IF _amount <= 0 OR _amount > 10000000 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid amount');
  END IF;

  SELECT id, balance INTO _wallet FROM wallets WHERE user_id = _user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Wallet not found');
  END IF;

  UPDATE wallets SET balance = balance + _amount, updated_at = now() WHERE id = _wallet.id;
  INSERT INTO wallet_transactions (wallet_id, user_id, amount, label, icon)
  VALUES (_wallet.id, _user_id, _amount, 'Wallet Top-up', '💳');

  RETURN jsonb_build_object('success', true, 'new_balance', _wallet.balance + _amount);
END;
$$;