import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Phone, 
  AlertTriangle, 
  MapPin, 
  Heart,
  X,
  Siren
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function EmergencyButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleEmergencyCall = () => {
    // Open phone dialer with emergency number
    window.location.href = 'tel:911';
  };

  const handleShareLocation = async () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const mapsUrl = `https://maps.google.com/maps?q=${latitude},${longitude}`;
          
          if (navigator.share) {
            navigator.share({
              title: 'My Emergency Location',
              text: `I need help! My location: ${latitude}, ${longitude}`,
              url: mapsUrl,
            });
          } else {
            window.open(mapsUrl, '_blank');
          }
        },
        (error) => {
          console.error('Location error:', error);
          alert('Unable to get location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const emergencyServices = [
    {
      name: 'Call Emergency (911)',
      icon: Phone,
      color: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
      action: () => setShowConfirm(true),
    },
    {
      name: 'Share My Location',
      icon: MapPin,
      color: 'bg-primary hover:bg-primary/90 text-primary-foreground',
      action: handleShareLocation,
    },
    {
      name: 'Poison Control',
      icon: AlertTriangle,
      color: 'bg-warning hover:bg-warning/90 text-warning-foreground',
      action: () => window.location.href = 'tel:1-800-222-1222',
    },
    {
      name: 'Medical Info',
      icon: Heart,
      color: 'bg-health-coral hover:bg-health-coral/90 text-white',
      action: () => window.location.href = '/profile',
    },
  ];

  return (
    <>
      {/* Floating Emergency Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "flex items-center justify-center gap-2",
          "h-14 px-5 rounded-full",
          "bg-destructive text-destructive-foreground",
          "shadow-lg hover:shadow-xl",
          "transition-all duration-200 hover:scale-105",
          "font-semibold"
        )}
        aria-label="Emergency"
      >
        <Siren className="h-5 w-5" />
        <span>SOS</span>
      </button>

      {/* Emergency Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-sm border-destructive/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-6 w-6" />
              Emergency Services
            </DialogTitle>
            <DialogDescription>
              Get immediate help or share your location with emergency contacts.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 mt-4">
            {emergencyServices.map((service) => (
              <Button
                key={service.name}
                onClick={service.action}
                className={cn("w-full h-14 text-lg gap-3 justify-start", service.color)}
              >
                <service.icon className="h-6 w-6" />
                {service.name}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="mt-4 gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </DialogContent>
      </Dialog>

      {/* Call Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-xs border-destructive">
          <DialogHeader>
            <DialogTitle className="text-center text-destructive">
              Call 911?
            </DialogTitle>
            <DialogDescription className="text-center">
              This will dial emergency services. Only use for real emergencies.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 mt-4">
            <Button
              onClick={handleEmergencyCall}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground h-14 text-lg gap-2"
            >
              <Phone className="h-6 w-6" />
              Yes, Call 911
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
