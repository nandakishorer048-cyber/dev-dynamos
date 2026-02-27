import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlaskConical, Pill, CheckCircle2, Clock, Truck, Package, Loader2, Plus, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface OrderTrackingProps {
  onNewAssessment: () => void;
}

const testStatusSteps = ['pending', 'confirmed', 'sample_collected', 'processing', 'completed'];
const orderStatusSteps = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

const statusLabels: Record<string, string> = {
  pending: 'Pending', confirmed: 'Confirmed', sample_collected: 'Sample Collected',
  processing: 'Processing', completed: 'Completed', cancelled: 'Cancelled',
  preparing: 'Preparing', out_for_delivery: 'Out for Delivery', delivered: 'Delivered',
};

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning', confirmed: 'bg-primary/10 text-primary',
  sample_collected: 'bg-health-blue/10 text-health-blue', processing: 'bg-health-purple/10 text-health-purple',
  completed: 'bg-success/10 text-success', cancelled: 'bg-destructive/10 text-destructive',
  preparing: 'bg-primary/10 text-primary', out_for_delivery: 'bg-health-blue/10 text-health-blue',
  delivered: 'bg-success/10 text-success',
};

export function OrderTracking({ onNewAssessment }: OrderTrackingProps) {
  const { user } = useAuth();
  const [testBookings, setTestBookings] = useState<any[]>([]);
  const [medicineOrders, setMedicineOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [tb, mo] = await Promise.all([
        supabase.from('test_bookings').select('*, test_catalog(*), partner_facilities(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('medicine_orders').select('*, partner_facilities(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      ]);
      if (tb.data) setTestBookings(tb.data);
      if (mo.data) setMedicineOrders(mo.data);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold">Your Orders</h2>
        <Button onClick={onNewAssessment} className="gradient-warm text-primary-foreground gap-2"><Plus className="h-4 w-4" /> New Assessment</Button>
      </div>

      <Tabs defaultValue="tests">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tests" className="gap-2"><FlaskConical className="h-4 w-4" /> Test Bookings ({testBookings.length})</TabsTrigger>
          <TabsTrigger value="medicines" className="gap-2"><Pill className="h-4 w-4" /> Medicine Orders ({medicineOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="mt-4 space-y-4">
          {testBookings.length === 0 ? (
            <Card className="premium-card"><CardContent className="py-12 text-center"><FlaskConical className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">No test bookings yet</p></CardContent></Card>
          ) : testBookings.map(b => (
            <Card key={b.id} className="premium-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{b.test_catalog?.name || 'Test'}</p>
                    <p className="text-xs text-muted-foreground">{b.partner_facilities?.name}</p>
                  </div>
                  <Badge className={cn("text-xs", statusColors[b.status])}>{statusLabels[b.status]}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(b.booking_date), 'MMM dd, yyyy')}</span>
                  <span className="font-medium text-primary">₹{b.amount}</span>
                </div>
                {/* Progress bar */}
                <div className="flex gap-1">
                  {testStatusSteps.map((s, i) => {
                    const currentIdx = testStatusSteps.indexOf(b.status);
                    return <div key={s} className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= currentIdx ? "bg-primary" : "bg-border")} />;
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="medicines" className="mt-4 space-y-4">
          {medicineOrders.length === 0 ? (
            <Card className="premium-card"><CardContent className="py-12 text-center"><Pill className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">No medicine orders yet</p></CardContent></Card>
          ) : medicineOrders.map(o => (
            <Card key={o.id} className="premium-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{o.partner_facilities?.name || 'Pharmacy'}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {o.delivery_type === 'home_delivery' ? <><Truck className="h-3 w-3" /> Home Delivery</> : <><Package className="h-3 w-3" /> Pickup</>}
                    </p>
                  </div>
                  <Badge className={cn("text-xs", statusColors[o.status])}>{statusLabels[o.status]}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{format(new Date(o.created_at), 'MMM dd, yyyy')}</span>
                  <span className="font-medium text-primary">₹{o.total_amount}</span>
                </div>
                <div className="flex gap-1">
                  {orderStatusSteps.map((s, i) => {
                    const currentIdx = orderStatusSteps.indexOf(o.status);
                    return <div key={s} className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= currentIdx ? "bg-primary" : "bg-border")} />;
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
