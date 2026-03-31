/**
 * AskiMate Real-time utilities
 * Handles delta polling, notification sounds, and live updates without WebSocket overhead
 */

// Notification sound for incoming mentor messages
let audioContext: AudioContext | null = null;

export const playNotificationSound = () => {
  try {
    // Create a simple beep using Web Audio API
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContext;
    const now = ctx.currentTime;
    
    // Create a simple two-tone "ding" sound
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    
    osc1.type = 'sine';
    osc2.type = 'sine';
    
    osc1.frequency.setValueAtTime(800, now);
    osc2.frequency.setValueAtTime(1000, now);
    
    gain1.gain.setValueAtTime(0.1, now);
    gain2.gain.setValueAtTime(0.1, now);
    
    // Fade in and out
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(gain);
    gain2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.1);
    osc2.stop(now + 0.1);
  } catch (err) {
    console.debug('Notification sound unavailable:', err);
  }
};

/**
 * Track the last message ID to enable delta polling
 */
export const getLastMessageId = (messages: any[]): number | null => {
  if (messages.length === 0) return null;
  // Assuming messages are sorted by ID or timestamp
  const lastMsg = messages[messages.length - 1];
  return lastMsg?.id || null;
};

/**
 * Fetch only new messages since the last known message ID
 * Instead of fetching all messages, this queries only newer ones
 */
export const fetchNewMessages = async (
  conversationId: number,
  lastMessageId: number | null,
  token: string,
  baseUrl: string,
): Promise<any[]> => {
  try {
    // Fetch all messages - the backend returns full history
    // We'll filter client-side to find only new ones
    const res = await fetch(
      `${baseUrl}api/askimate/chat/${conversationId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) throw new Error('Failed to fetch messages');

    const data = await res.json();
    const allMessages = data.messages || [];

    // If no last message ID, this is the first fetch
    if (lastMessageId === null) {
      return allMessages;
    }

    // Return only messages newer than lastMessageId
    return allMessages.filter((msg: any) => msg.id > lastMessageId);
  } catch (err) {
    console.error('Failed to fetch new messages:', err);
    return [];
  }
};

/**
 * Append new messages to existing messages, preventing duplicates
 */
export const mergeNewMessages = (
  existingMessages: any[],
  newMessages: any[],
): any[] => {
  if (newMessages.length === 0) {
    return existingMessages;
  }

  // Create a set of existing message IDs for quick lookup
  const existingIds = new Set(existingMessages.map((m) => m.id));

  // Filter out duplicates and append
  const uniqueNewMessages = newMessages.filter((msg) => !existingIds.has(msg.id));

  return [...existingMessages, ...uniqueNewMessages];
};

/**
 * Check if a message is newly received (not sent by current user)
 */
export const isIncomingMessage = (message: any, currentUserType: 'user' | 'admin'): boolean => {
  if (currentUserType === 'user') {
    // User should see incoming mentor messages
    return message.sender === 'mentor';
  } else {
    // Admin should see incoming user messages
    return message.sender === 'user';
  }
};
