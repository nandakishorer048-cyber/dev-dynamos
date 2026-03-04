
-- Trigger to recalculate test_bookings amount and commission from catalog
CREATE OR REPLACE FUNCTION public.validate_test_booking_prices()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  catalog_price numeric;
  catalog_commission numeric;
BEGIN
  SELECT price, commission_percent INTO catalog_price, catalog_commission
  FROM public.test_catalog
  WHERE id = NEW.test_id AND is_available = true;

  IF catalog_price IS NULL THEN
    RAISE EXCEPTION 'Test not found or unavailable';
  END IF;

  -- Override client-supplied values with server-side calculation
  NEW.amount := catalog_price;
  NEW.commission_amount := (catalog_price * catalog_commission) / 100;

  -- Ensure non-negative
  IF NEW.amount < 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_test_booking_prices
BEFORE INSERT ON public.test_bookings
FOR EACH ROW
EXECUTE FUNCTION public.validate_test_booking_prices();

-- Trigger to recalculate medicine_orders totals from order items
-- First, validate individual order items
CREATE OR REPLACE FUNCTION public.validate_medicine_order_item_prices()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  catalog_price numeric;
BEGIN
  SELECT price INTO catalog_price
  FROM public.medicine_catalog
  WHERE id = NEW.medicine_id AND in_stock = true;

  IF catalog_price IS NULL THEN
    RAISE EXCEPTION 'Medicine not found or out of stock';
  END IF;

  -- Override client-supplied prices
  NEW.unit_price := catalog_price;
  NEW.total_price := catalog_price * NEW.quantity;

  IF NEW.quantity < 1 THEN
    RAISE EXCEPTION 'Quantity must be at least 1';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_medicine_order_item_prices
BEFORE INSERT ON public.medicine_order_items
FOR EACH ROW
EXECUTE FUNCTION public.validate_medicine_order_item_prices();

-- Trigger to validate medicine_orders amounts
CREATE OR REPLACE FUNCTION public.validate_medicine_order_prices()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Ensure non-negative values
  IF NEW.total_amount < 0 THEN
    NEW.total_amount := 0;
  END IF;
  IF NEW.commission_amount < 0 THEN
    NEW.commission_amount := 0;
  END IF;
  IF NEW.delivery_fee IS NOT NULL AND NEW.delivery_fee < 0 THEN
    NEW.delivery_fee := 0;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_medicine_order_prices
BEFORE INSERT ON public.medicine_orders
FOR EACH ROW
EXECUTE FUNCTION public.validate_medicine_order_prices();
