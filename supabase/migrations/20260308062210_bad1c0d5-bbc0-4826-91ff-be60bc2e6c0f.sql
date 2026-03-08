
-- Function to recalculate medicine order totals from actual order items
CREATE OR REPLACE FUNCTION public.recalculate_medicine_order_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  items_total numeric;
  items_commission numeric;
  current_delivery_fee numeric;
BEGIN
  -- Sum actual item totals (which are already validated by validate_medicine_order_item_prices trigger)
  SELECT COALESCE(SUM(moi.total_price), 0)
  INTO items_total
  FROM public.medicine_order_items moi
  WHERE moi.order_id = NEW.order_id;

  -- Calculate commission from catalog data
  SELECT COALESCE(SUM(moi.total_price * mc.commission_percent / 100), 0)
  INTO items_commission
  FROM public.medicine_order_items moi
  JOIN public.medicine_catalog mc ON mc.id = moi.medicine_id
  WHERE moi.order_id = NEW.order_id;

  -- Get current delivery fee from order
  SELECT COALESCE(delivery_fee, 0) INTO current_delivery_fee
  FROM public.medicine_orders WHERE id = NEW.order_id;

  -- Update the order with server-calculated totals
  UPDATE public.medicine_orders
  SET total_amount = items_total + current_delivery_fee,
      commission_amount = items_commission,
      updated_at = now()
  WHERE id = NEW.order_id;

  RETURN NEW;
END;
$$;

-- Trigger fires after each item insert to recalculate order totals
CREATE TRIGGER trg_recalculate_order_totals
  AFTER INSERT ON public.medicine_order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_medicine_order_totals();
