import { LocalNotifications } from '@capacitor/local-notifications';

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

    const userWantsNotifications = window.confirm(
      "Bildirimleri aktif etmek ister misiniz?\nGünlük okuma hatırlatıcıları ve can dolum bildirimleri almak için izin verin."
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

    const messages = [
      {
        id: 2001, // Pazar
        weekday: 1,
        title: "Haftalık Serini Koru! 🔥",
        body: "Bugün de okuma yaparak serini devam ettir. İngilizce öğrenme yolculuğunda harika gidiyorsun! 🥇"
      },
      {
        id: 2002, // Pazartesi
        weekday: 2,
        title: "Yeni Haftaya Harika Başlangıç! 🚀",
        body: "Hadi hikayelere devam et, maceralar seni bekliyor, İngilizce öğrenme vakti! 📚✨"
      },
      {
        id: 2003, // Salı
        weekday: 3,
        title: "İngilizce Serüvenine Devam Et! 🌟",
        body: "Bugün yeni bir hikaye okuyup kelime hazneni geliştirmeye ne dersin? Macera seni bekliyor! 🗺️"
      },
      {
        id: 2004, // Çarşamba
        weekday: 4,
        title: "Günün Hikayesi Seni Bekliyor! 📖",
        body: "Kendine küçük bir iyilik yap ve 5 dakika İngilizce oku. Alışkanlıklar seni zirveye taşır! 💪"
      },
      {
        id: 2005, // Perşembe
        weekday: 5,
        title: "Gizemli Hikayelerin Kilidini Aç! 🔑",
        body: "Karakterlerin maceraları kaldığı yerden devam ediyor. İngilizce öğrenmek hiç bu kadar keyifli olmamıştı! 🎭"
      },
      {
        id: 2006, // Cuma
        weekday: 6,
        title: "Hafta Sonu Geliyor, Okuma Vakti! 🎉",
        body: "Haftalık hedefini tamamlamak için harika bir gün! Hadi bugün de bir hikaye bitirelim. 🏆"
      },
      {
        id: 2007, // Cumartesi
        weekday: 7,
        title: "Kahveni Al ve İngilizce Öyküne Başla! ☕",
        body: "Cumartesi keyfine güzel bir hikaye eşlik etsin. Hem eğlen hem İngilizceni geliştir! 🌈"
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

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1002,
          title: "Canların Doldu! ❤️",
          body: "Canların tamamen doldu, okumaya ve İngilizce öğrenmeye devam edebilirsin!",
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

