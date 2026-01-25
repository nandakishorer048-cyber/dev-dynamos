import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Reminder {
  id: string;
  reminder_time: string;
  is_enabled: boolean;
  days_of_week: number[];
  medications: {
    id: string;
    name: string;
    dosage: string | null;
  };
}

// Base64 encoded notification sound (short pleasant chime)
const NOTIFICATION_SOUND_URL = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYNNuMsAAAAAAD/+9DEAAAGAAGn9AAAIq5Js/80kBJJGP//9f//EiQlBQOA4Pg+D/EIIAgCAYEgcH+D4Pg+UBQFBwfB8HygKC5QHB8oD4Pv/B9/4nB8HwfKA4Pv/lwfB////5cEwYAgCIJ8H3/g+/0HwmCYJg//+D7/Qf/+sIQhf//B8H3//////KAoOD4uD4Pl//////ygKApOD4uUBQdL//////8oHA4Ph4uD5f///+sHCEIX/B9///1g4QhGEfB9/4Pv9B//rCEIWV/+D7/////WEIQv/4Pv/lAcHz/EIQhf/lB//+D7///rB0IQjAZgGYCmApgKYJg+D4Pg+XB8HwfB8HwfB8HwfB8HwfB8HwfL8HwfB8HwfB8vwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfL8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8vwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8A//vQxNYAAADSAAAAAAAAANIAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

export function useReminderNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notifiedRemindersRef = useRef<Set<string>>(new Set());
  const lastCheckMinuteRef = useRef<string>('');

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 0.7;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.log('Could not play notification sound:', err);
      });
    }
  }, []);

  const checkReminders = useCallback(async () => {
    if (!user) return;

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const currentMinute = `${now.getHours()}:${now.getMinutes()}`;

    // Only check once per minute
    if (currentMinute === lastCheckMinuteRef.current) return;
    lastCheckMinuteRef.current = currentMinute;

    // Reset notified reminders at midnight
    if (currentTime === '00:00') {
      notifiedRemindersRef.current.clear();
    }

    try {
      const { data: reminders, error } = await supabase
        .from('medication_reminders')
        .select(`
          id,
          reminder_time,
          is_enabled,
          days_of_week,
          medications (
            id,
            name,
            dosage
          )
        `)
        .eq('user_id', user.id)
        .eq('is_enabled', true);

      if (error) {
        console.error('Error fetching reminders:', error);
        return;
      }

      if (!reminders) return;

      // Check each reminder
      for (const reminder of reminders as Reminder[]) {
        const reminderTime = reminder.reminder_time.slice(0, 5); // HH:MM
        const reminderKey = `${reminder.id}-${currentTime}`;

        // Check if this reminder should fire now
        if (
          reminder.is_enabled &&
          reminder.days_of_week?.includes(currentDay) &&
          reminderTime === currentTime &&
          !notifiedRemindersRef.current.has(reminderKey)
        ) {
          // Mark as notified
          notifiedRemindersRef.current.add(reminderKey);

          // Play sound
          playNotificationSound();

          // Show toast notification
          toast({
            title: '💊 Medication Reminder',
            description: `Time to take ${reminder.medications?.name}${reminder.medications?.dosage ? ` (${reminder.medications.dosage})` : ''}`,
            duration: 10000, // Show for 10 seconds
          });
        }
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }, [user, toast, playNotificationSound]);

  // Set up interval to check reminders
  useEffect(() => {
    if (!user) return;

    // Check immediately on mount
    checkReminders();

    // Check every 30 seconds
    const intervalId = setInterval(checkReminders, 30000);

    return () => clearInterval(intervalId);
  }, [user, checkReminders]);

  return { checkReminders, playNotificationSound };
}
