import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Pill, MapPin, Star, Truck, Store, Plus, Minus, Loader2, CreditCard, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface MedicineOrderProps {
  recommendedMedicines: { name: string; type: string; purpose: string; note: string }[];
  symptoms: string;
  aiRecommendation: string;
  onComplete: () => void;
  onBack: () => void;
}

type Medicine = { id: string; name: string; generic_name: string; description: string; category: string; price: number; requires_prescription: boolean; dosage_form: string; strength: string; manufacturer: string; facility_id: string; commission_percent: number };
type CartItem = { medicine: Medicine; quantity: number };

export function MedicineOrder({ recommendedMedicines, symptoms, aiRecommendation, onComplete, onBack }: MedicineOrderProps) {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'home_delivery'>('home_delivery');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [medRes, pharmRes] = await Promise.all([
      supabase.from('medicine_catalog').select('*').eq('in_stock', true),
      supabase.from('partner_facilities').select('*').eq('is_active', true).in('facility_type', ['pharmacy', 'hospital']),
    ]);
    if (medRes.data) setMedicines(medRes.data as any);
    if (pharmRes.data) setPharmacies(pharmRes.data as any);
    setLoading(false);
  };

  const otcMeds = medicines.filter(m => !m.requires_prescription);
  const rxMeds = medicines.filter(m => m.requires_prescription);

  const addToCart = (med: Medicine) => {
    if (med.requires_prescription) { toast.error('This medicine requires a prescription. Consult a doctor first.'); return; }
    setCart(prev => {
      const existing = prev.find(c => c.medicine.id === med.id);
      if (existing) return prev.map(c => c.medicine.id === med.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { medicine: med, quantity: 1 }];
    });
  };

  const updateQty = (medId: string, delta: number) => {
    setCart(prev => prev.map(c => c.medicine.id === medId ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c).filter(c => c.quantity > 0));
  };

  const subtotal = cart.reduce((sum, c) => sum + c.medicine.price * c.quantity, 0);
  const deliveryFee = deliveryType === 'home_delivery' ? 49 : 0;
  const total = subtotal + deliveryFee;

  const handleOrder = async () => {
    if (cart.length === 0 || !user) return;
    if (deliveryType === 'home_delivery' && !address.trim()) { toast.error('Enter delivery address'); return; }
    setOrdering(true);
    try {
      const facilityId = selectedPharmacy?.id || pharmacies[0]?.id;
      if (!facilityId) throw new Error('No pharmacy available');

      const commissionAmount = cart.reduce((sum, c) => sum + (c.medicine.price * c.quantity * c.medicine.commission_percent / 100), 0);

      const { data: order, error } = await supabase.from('medicine_orders').insert({
        user_id: user.id,
        facility_id: facilityId,
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'home_delivery' ? address : null,
        total_amount: total,
        commission_amount: commissionAmount,
        delivery_fee: deliveryFee,
        symptoms_context: symptoms,
        ai_recommendation: aiRecommendation,
        payment_status: 'pending',
      }).select().single();
      if (error) throw error;

      const items = cart.map(c => ({
        order_id: order.id,
        medicine_id: c.medicine.id,
        quantity: c.quantity,
        unit_price: c.medicine.price,
        total_price: c.medicine.price * c.quantity,
      }));
      const { error: itemsError } = await supabase.from('medicine_order_items').insert(items);
      if (itemsError) throw itemsError;

      toast.success('Order placed successfully!');
      onComplete();
    } catch (e: any) {
      toast.error(e.message || 'Order failed');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to Results</Button>

      {/* Pharmacy Selection */}
      <Card className="premium-card">
        <CardHeader><CardTitle className="text-lg">Select Pharmacy</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {pharmacies.map(p => (
            <button key={p.id} onClick={() => setSelectedPharmacy(p)}
              className={cn("w-full text-left p-4 rounded-xl border transition-all",
                selectedPharmacy?.id === p.id ? "border-primary bg-primary/5 shadow-warm" : "border-border hover:border-primary/30")}>
              <p className="font-semibold text-sm">{p.name}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{p.city}</span>
                <span className="flex items-center gap-1"><Star className="h-3 w-3 text-warning fill-warning" />{p.rating}</span>
                {p.offers_home_delivery && <Badge variant="outline" className="text-xs gap-1"><Truck className="h-3 w-3" />Delivery</Badge>}
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* OTC Medicines */}
      <Card className="premium-card">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Pill className="h-5 w-5 text-success" /> Over-the-Counter Medicines</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {otcMeds.length === 0 ? <p className="text-sm text-muted-foreground">No OTC medicines available</p> : otcMeds.map(med => {
            const inCart = cart.find(c => c.medicine.id === med.id);
            return (
              <div key={med.id} className="flex items-center justify-between p-3 rounded-xl border border-border">
                <div>
                  <p className="font-semibold text-sm">{med.name} <span className="text-xs text-muted-foreground font-normal">{med.strength}</span></p>
                  <p className="text-xs text-muted-foreground">{med.generic_name} · {med.dosage_form} · {med.manufacturer}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-primary text-sm">₹{med.price}</span>
                  {inCart ? (
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(med.id, -1)}><Minus className="h-3 w-3" /></Button>
                      <span className="text-sm font-bold w-4 text-center">{inCart.quantity}</span>
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(med.id, 1)}><Plus className="h-3 w-3" /></Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => addToCart(med)} className="gap-1"><Plus className="h-3 w-3" />Add</Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Prescription warning */}
      {rxMeds.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl bg-warning/10 border border-warning/20 p-4">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-warning-foreground">Prescription Medicines Available</p>
            <p className="text-xs text-muted-foreground mt-0.5">{rxMeds.map(m => m.name).join(', ')} require a valid prescription. Please consult a doctor before ordering.</p>
          </div>
        </div>
      )}

      {/* Cart & Checkout */}
      {cart.length > 0 && (
        <Card className="premium-card border-primary/20 animate-slide-up">
          <CardHeader><CardTitle className="text-lg">Order Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Delivery options */}
            <div className="flex gap-3">
              <button onClick={() => setDeliveryType('home_delivery')}
                className={cn("flex-1 flex items-center gap-2 p-3 rounded-xl border transition-all text-sm",
                  deliveryType === 'home_delivery' ? "border-primary bg-primary/5" : "border-border")}>
                <Truck className="h-4 w-4" /> Home Delivery
              </button>
              <button onClick={() => setDeliveryType('pickup')}
                className={cn("flex-1 flex items-center gap-2 p-3 rounded-xl border transition-all text-sm",
                  deliveryType === 'pickup' ? "border-primary bg-primary/5" : "border-border")}>
                <Store className="h-4 w-4" /> Store Pickup
              </button>
            </div>

            {deliveryType === 'home_delivery' && <Input placeholder="Enter delivery address" value={address} onChange={e => setAddress(e.target.value)} />}

            <div className="rounded-xl bg-secondary/30 p-4 space-y-2">
              {cart.map(c => (
                <div key={c.medicine.id} className="flex justify-between text-sm">
                  <span>{c.medicine.name} × {c.quantity}</span>
                  <span className="font-medium">₹{c.medicine.price * c.quantity}</span>
                </div>
              ))}
              {deliveryFee > 0 && <div className="flex justify-between text-sm text-muted-foreground"><span>Delivery fee</span><span>₹{deliveryFee}</span></div>}
              <div className="border-t border-border pt-2 flex justify-between text-base"><span className="font-semibold">Total</span><span className="font-bold text-primary">₹{total}</span></div>
            </div>

            <Button onClick={handleOrder} disabled={ordering} className="w-full gradient-warm text-primary-foreground" size="lg">
              {ordering ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing Order...</> : <><CreditCard className="mr-2 h-4 w-4" /> Place Order</>}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
