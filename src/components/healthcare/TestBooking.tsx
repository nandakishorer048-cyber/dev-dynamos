import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, MapPin, Star, Clock, Home, Building2, Calendar, Loader2, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface TestBookingProps {
  recommendedTests: { name: string; reason: string; urgency: string }[];
  symptoms: string;
  aiRecommendation: string;
  onComplete: () => void;
  onBack: () => void;
}

type Test = { id: string; name: string; description: string; category: string; price: number; turnaround_hours: number; sample_type: string; preparation_instructions: string; facility_id: string; partner_facilities?: any };
type Facility = { id: string; name: string; facility_type: string; address: string; city: string; rating: number; total_reviews: number; offers_home_collection: boolean; phone: string };

export function TestBooking({ recommendedTests, symptoms, aiRecommendation, onComplete, onBack }: TestBookingProps) {
  const { user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [homeCollection, setHomeCollection] = useState(false);
  const [collectionAddress, setCollectionAddress] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [testsRes, facilityRes] = await Promise.all([
      supabase.from('test_catalog').select('*, partner_facilities(*)').eq('is_available', true),
      supabase.from('partner_facilities').select('*').eq('is_active', true).in('facility_type', ['lab', 'hospital']),
    ]);
    if (testsRes.data) setTests(testsRes.data as any);
    if (facilityRes.data) setFacilities(facilityRes.data as any);
    setLoading(false);
  };

  // Filter tests matching AI recommendations
  const matchingTests = tests.filter(t =>
    recommendedTests.some(rt => t.name.toLowerCase().includes(rt.name.toLowerCase().split('(')[0].trim()))
  );
  const displayTests = matchingTests.length > 0 ? matchingTests : tests;

  const handleBook = async () => {
    if (!selectedTest || !selectedFacility || !bookingDate || !user) return;
    if (homeCollection && !collectionAddress.trim()) { toast.error('Please enter collection address'); return; }

    setBooking(true);
    try {
      const commission = (selectedTest.price * (selectedTest as any).commission_percent) / 100;
      const { error } = await supabase.from('test_bookings').insert({
        user_id: user.id,
        test_id: selectedTest.id,
        facility_id: selectedFacility.id,
        booking_date: bookingDate,
        is_home_collection: homeCollection,
        collection_address: homeCollection ? collectionAddress : null,
        amount: selectedTest.price,
        commission_amount: commission,
        symptoms_context: symptoms,
        ai_recommendation: aiRecommendation,
        payment_status: 'pending',
      });
      if (error) throw error;
      toast.success('Test booked successfully!');
      onComplete();
    } catch (e: any) {
      toast.error(e.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to Results</Button>

      {/* Select Test */}
      <Card className="premium-card">
        <CardHeader><CardTitle className="text-lg">Select a Test</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {displayTests.map(test => (
            <button key={test.id} onClick={() => { setSelectedTest(test); setSelectedFacility(null); }}
              className={cn("w-full text-left p-4 rounded-xl border transition-all",
                selectedTest?.id === test.id ? "border-primary bg-primary/5 shadow-warm" : "border-border hover:border-primary/30 hover:bg-secondary/30")}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">{test.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{test.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{test.turnaround_hours}h results</span>
                    <Badge variant="outline" className="text-xs">{test.sample_type}</Badge>
                  </div>
                </div>
                <p className="font-bold text-primary whitespace-nowrap">₹{test.price}</p>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Select Facility */}
      {selectedTest && (
        <Card className="premium-card animate-slide-up">
          <CardHeader><CardTitle className="text-lg">Choose Lab/Hospital</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {facilities.map(f => (
              <button key={f.id} onClick={() => setSelectedFacility(f)}
                className={cn("w-full text-left p-4 rounded-xl border transition-all",
                  selectedFacility?.id === f.id ? "border-primary bg-primary/5 shadow-warm" : "border-border hover:border-primary/30 hover:bg-secondary/30")}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">{f.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{f.address}, {f.city}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs"><Star className="h-3 w-3 text-warning fill-warning" />{f.rating} ({f.total_reviews})</span>
                      {f.offers_home_collection && <Badge variant="outline" className="text-xs gap-1"><Home className="h-3 w-3" />Home Collection</Badge>}
                    </div>
                  </div>
                  <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Booking Details */}
      {selectedFacility && (
        <Card className="premium-card animate-slide-up">
          <CardHeader><CardTitle className="text-lg">Booking Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Preferred Date</label>
              <Input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} />
            </div>

            {selectedFacility.offers_home_collection && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Home className="h-4 w-4 text-primary" /><span className="text-sm font-medium">Home Sample Collection</span></div>
                  <Switch checked={homeCollection} onCheckedChange={setHomeCollection} />
                </div>
                {homeCollection && <Input placeholder="Enter your address for sample collection" value={collectionAddress} onChange={e => setCollectionAddress(e.target.value)} />}
              </div>
            )}

            {/* Summary */}
            <div className="rounded-xl bg-secondary/30 p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Test</span><span className="font-medium">{selectedTest?.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Lab</span><span className="font-medium">{selectedFacility.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date</span><span className="font-medium">{bookingDate || '-'}</span></div>
              <div className="border-t border-border pt-2 flex justify-between text-base"><span className="font-semibold">Total</span><span className="font-bold text-primary">₹{selectedTest?.price}</span></div>
            </div>

            <Button onClick={handleBook} disabled={booking || !bookingDate} className="w-full gradient-warm text-primary-foreground" size="lg">
              {booking ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Booking...</> : <><CreditCard className="mr-2 h-4 w-4" /> Confirm & Pay</>}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
