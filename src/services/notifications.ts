import { LocalNotifications } from '@capacitor/local-notifications';
import { t, LanguageCode } from '../i18n';

const getNativeLanguage = (): LanguageCode => {
  try {
    return (localStorage.getItem('linguist_native_language') as LanguageCode) || 'tr';
  } catch (e) {
    return 'tr';
  }
};

export const requestNotificationPermissions = async (force: boolean = false): Promise<boolean> => {
  try {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display === 'granted') {
      return true;
    }

    // If dismissed before and not forced, do not prompt the user automatically
    if (localStorage.getItem('linguist_notifications_prompt_dismissed') === 'true' && !force) {
      return false;
    }

    const lang = getNativeLanguage();
    const userWantsNotifications = window.confirm(
      t('notify_prompt_text', lang)
    );

    if (!userWantsNotifications) {
      localStorage.setItem('linguist_notifications_prompt_dismissed', 'true');
      return false;
    }

    const req = await LocalNotifications.requestPermissions();
    if (req.display === 'granted') {
      localStorage.removeItem('linguist_notifications_prompt_dismissed');
      return true;
    } else {
      localStorage.setItem('linguist_notifications_prompt_dismissed', 'true');
      return false;
    }
  } catch (e) {
    console.error('Failed to request notification permissions:', e);
    return false;
  }
};

export const scheduleDailyReminder = async () => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    // Cancel legacy daily reminder ID 1001 and current weekly rotated IDs 2001-2007
    await LocalNotifications.cancel({
      notifications: [
        { id: 1001 },
        { id: 2001 },
        { id: 2002 },
        { id: 2003 },
        { id: 2004 },
        { id: 2005 },
        { id: 2006 },
        { id: 2007 }
      ]
    });

    const lang = getNativeLanguage();
    const messages = [
      {
        id: 2001, // Pazar
        weekday: 1,
        title: t('notify_daily_title_1', lang),
        body: t('notify_daily_body_1', lang)
      },
      {
        id: 2002, // Pazartesi
        weekday: 2,
        title: t('notify_daily_title_2', lang),
        body: t('notify_daily_body_2', lang)
      },
      {
        id: 2003, // Salı
        weekday: 3,
        title: t('notify_daily_title_3', lang),
        body: t('notify_daily_body_3', lang)
      },
      {
        id: 2004, // Çarşamba
        weekday: 4,
        title: t('notify_daily_title_4', lang),
        body: t('notify_daily_body_4', lang)
      },
      {
        id: 2005, // Perşembe
        weekday: 5,
        title: t('notify_daily_title_5', lang),
        body: t('notify_daily_body_5', lang)
      },
      {
        id: 2006, // Cuma
        weekday: 6,
        title: t('notify_daily_title_6', lang),
        body: t('notify_daily_body_6', lang)
      },
      {
        id: 2007, // Cumartesi
        weekday: 7,
        title: t('notify_daily_title_7', lang),
        body: t('notify_daily_body_7', lang)
      }
    ];

    await LocalNotifications.schedule({
      notifications: messages.map(msg => ({
        id: msg.id,
        title: msg.title,
        body: msg.body,
        schedule: {
          on: {
            weekday: msg.weekday,
            hour: 20,
            minute: 0
          },
          repeats: true,
          allowWhileIdle: true
        }
      }))
    });
    console.log('[NotificationService] Weekly rotated daily reminders scheduled successfully.');
  } catch (e) {
    console.error('Failed to schedule daily reminder:', e);
  }
};

export const scheduleHeartsRefilledNotification = async (currentHearts: number, lastRefillTimestamp: number) => {
  try {
    // If user has 5 hearts, cancel any pending hearts notification
    if (currentHearts >= 5) {
      await cancelHeartsNotification();
      return;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    // Cancel existing one first to prevent double scheduling
    await cancelHeartsNotification();

    const heartsNeeded = 5 - currentHearts;
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    // Time since last refill:
    const timeSinceLastRefill = now - lastRefillTimestamp;
    
    // Remaining time for the current heart:
    const remainingForCurrentHeart = Math.max(0, oneHour - (timeSinceLastRefill % oneHour));
    
    // Total delay calculation
    const totalDelayMs = ((heartsNeeded - 1) * oneHour) + remainingForCurrentHeart;
    const triggerTime = new Date(now + totalDelayMs);

    const lang = getNativeLanguage();
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1002,
          title: t('notify_hearts_title', lang),
          body: t('notify_hearts_body', lang),
          schedule: {
            at: triggerTime,
            allowWhileIdle: true
          }
        }
      ]
    });
    console.log(`[NotificationService] Hearts refilled notification scheduled at: ${triggerTime.toLocaleString()}`);
  } catch (e) {
    console.error('Failed to schedule hearts notification:', e);
  }
};

export const cancelHeartsNotification = async () => {
  try {
    await LocalNotifications.cancel({
      notifications: [{ id: 1002 }]
    });
    console.log('[NotificationService] Hearts notification cancelled.');
  } catch (e) {
    console.error('Failed to cancel hearts notification:', e);
  }
};

