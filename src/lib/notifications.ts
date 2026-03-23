// ============================================
// NOTIFICATION & REMINDER SYSTEM
// ============================================

// Optional custom notification sound placed in public/sounds/notification-soft.mp3
const NOTIFICATION_SOUND_URL = "/sounds/notification-soft.mp3";
// Fallback: base64 encoded short beep
const NOTIFICATION_SOUND_FALLBACK = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleAUFTI7X3qdrFAFIm9j2fwsMT5TZ59YGBU+U2OfWBgVPlNjn1gYFT5TY59YGBU+U2OfWBgVPlNjn1gYFT5TY59YGBU+U2OfWBgVPlNjn1gYFT5TY59YGBU+U2OfWBgVPlNjn1gYFT5TY59YGBU+U2OfWBgVPlNjn1gYFT5TY59YGBU+U2OfWBgVPlNjn1gYFT5TY59YGBU+U2OfWBgVPlNjn1gYFT5TY59YGBU+U2OfWBgU=";

let audioContext: AudioContext | null = null;
let notificationAudio: HTMLAudioElement | null = null;
let lastNotificationSoundAt = 0;
const NOTIFICATION_SOUND_COOLDOWN_MS = 1500;

const getNotificationAudio = () => {
  if (!notificationAudio) {
    notificationAudio = new Audio(NOTIFICATION_SOUND_URL);
    notificationAudio.preload = "auto";
    notificationAudio.volume = 0.5;
  }
  return notificationAudio;
};

/**
 * Initialize audio context (must be called after user interaction)
 */
export function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Preload the notification sound so playback is immediate.
 */
export function primeNotificationSound() {
  try {
    const audio = getNotificationAudio();
    audio.load();
    return true;
  } catch (error) {
    console.warn("Could not preload notification sound:", error);
    return false;
  }
}

/**
 * Play a notification sound
 */
export async function playNotificationSound(soundUrl?: string) {
  const now = Date.now();
  if (now - lastNotificationSoundAt < NOTIFICATION_SOUND_COOLDOWN_MS) {
    return;
  }
  lastNotificationSoundAt = now;

  try {
    const tryPlay = async (source: string) => {
      const audio = new Audio(source);
      audio.volume = 0.5;
      const playPromise = audio.play();
      if (playPromise) {
        await playPromise;
      }
      return true;
    };

    if (soundUrl && soundUrl !== NOTIFICATION_SOUND_URL) {
      try {
        await tryPlay(soundUrl);
        return;
      } catch {
        // Fall through to default sound
      }
    }

    try {
      const audio = getNotificationAudio();
      if (audio.readyState < 2) {
        audio.load();
        throw new Error("Notification sound not ready");
      }
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise) {
        await playPromise;
      }
      return;
    } catch {
      await tryPlay(NOTIFICATION_SOUND_FALLBACK);
      return;
    }
  } catch (error) {
    console.warn('Could not play notification sound:', error);
    // Fallback: try Web Audio API beep
    try {
      const ctx = initAudio();
      if (ctx) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.warn('Web Audio API fallback failed:', e);
    }
  }
}

/**
 * Request permission for browser notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

/**
 * Show a browser notification with optional sound
 */
export async function showNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    playSound?: boolean;
    soundUrl?: string;
    onClick?: () => void;
  }
) {
  const { body, icon, tag, playSound = true, soundUrl, onClick } = options || {};
  
  // Play sound if enabled
  if (playSound) {
    playNotificationSound(soundUrl);
  }
  
  // Show browser notification if permitted
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: icon || '/favicon.svg',
      tag,
      silent: true, // We handle sound ourselves
    });
    
    if (onClick) {
      notification.onclick = () => {
        window.focus();
        notification.close();
        onClick();
      };
    }
    
    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);
    
    return notification;
  }
  
  return null;
}

/**
 * Appointment reminder type
 */
export interface AppointmentReminder {
  id: string;
  appointmentId: string;
  clientName: string;
  serviceName: string;
  time: string;
  date: string;
  reminderTime: Date;
}

// Store for active reminders
const activeReminders: Map<string, ReturnType<typeof setTimeout>> = new Map();

/**
 * Schedule a reminder for an appointment
 */
export function scheduleReminder(
  reminder: AppointmentReminder,
  minutesBefore: number = 15,
  onReminder: (reminder: AppointmentReminder) => void
) {
  // Clear existing reminder for this appointment
  cancelReminder(reminder.appointmentId);
  
  // Parse the appointment datetime
  const appointmentDateTime = new Date(`${reminder.date}T${reminder.time}`);
  const reminderDateTime = new Date(appointmentDateTime.getTime() - minutesBefore * 60 * 1000);
  
  const now = new Date();
  const delay = reminderDateTime.getTime() - now.getTime();
  
  // Only schedule if reminder is in the future
  if (delay > 0) {
    const timeoutId = setTimeout(() => {
      onReminder(reminder);
      activeReminders.delete(reminder.appointmentId);
    }, delay);
    
    activeReminders.set(reminder.appointmentId, timeoutId);
    return true;
  }
  
  return false;
}

/**
 * Cancel a scheduled reminder
 */
export function cancelReminder(appointmentId: string) {
  const timeoutId = activeReminders.get(appointmentId);
  if (timeoutId) {
    clearTimeout(timeoutId);
    activeReminders.delete(appointmentId);
  }
}

/**
 * Cancel all reminders
 */
export function cancelAllReminders() {
  activeReminders.forEach((timeoutId) => clearTimeout(timeoutId));
  activeReminders.clear();
}

/**
 * Get upcoming reminders count
 */
export function getActiveRemindersCount() {
  return activeReminders.size;
}
