import { requestPushPermission } from './firebaseConfig';

interface SendNotificationPayload {
  deviceToken: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification`;

export async function sendNotification(
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  try {
    const deviceToken = await requestPushPermission();

    if (!deviceToken) {
      console.warn('Could not get device token for notification');
      return false;
    }

    const payload: SendNotificationPayload = {
      deviceToken,
      title,
      body,
      data,
    };

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Failed to send notification:', await response.json());
      return false;
    }

    const result = await response.json();
    console.log('Notification sent:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

export async function sendDietReminder(foodItem: string): Promise<boolean> {
  const messages = [
    `Have you had your ${foodItem.toLowerCase()} today?`,
    `Don't forget about your ${foodItem.toLowerCase()} goal!`,
    `Time for some ${foodItem.toLowerCase()}?`,
    `Remember to track your ${foodItem.toLowerCase()} intake!`,
    `How's your ${foodItem.toLowerCase()} progress today?`,
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return sendNotification('Mediterranean Diet Reminder', randomMessage, {
    type: 'diet_reminder',
    foodItem,
  });
}

export async function sendCompletionNotification(itemName: string): Promise<boolean> {
  return sendNotification(
    'Great job!',
    `You've completed your ${itemName} goal for today!`,
    {
      type: 'completion',
      item: itemName,
    }
  );
}
