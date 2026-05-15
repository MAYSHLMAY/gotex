import Pusher from 'pusher'
import PusherClient from 'pusher-js'

// Server-side Pusher instance
export function getPusherServer() {
  if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || !process.env.PUSHER_SECRET) {
    return null
  }
  
  return new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER || 'eu',
    useTLS: true,
  })
}

// Client-side Pusher instance (singleton)
let pusherClient: PusherClient | null = null

export function getPusherClient() {
  if (typeof window === 'undefined') return null
  
  if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
    console.warn('[Pusher] NEXT_PUBLIC_PUSHER_KEY not configured')
    return null
  }
  
  if (!pusherClient) {
    pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
    })
  }
  
  return pusherClient
}

// Check if Pusher is configured
export function realtimeConfigured(): boolean {
  return Boolean(process.env.PUSHER_KEY && process.env.PUSHER_CLUSTER)
}

// Channel names
export const CHANNELS = {
  orders: (userId: string) => `private-orders-${userId}`,
  delivery: (orderId: string) => `delivery-${orderId}`,
  inventory: (farmerId: string) => `inventory-${farmerId}`,
  notifications: (userId: string) => `private-notifications-${userId}`,
}

// Event types
export const EVENTS = {
  ORDER_CREATED: 'order:created',
  ORDER_STATUS_CHANGED: 'order:status-changed',
  DELIVERY_LOCATION_UPDATE: 'delivery:location-update',
  DELIVERY_STATUS_CHANGED: 'delivery:status-changed',
  INVENTORY_LOW: 'inventory:low',
  NEW_MESSAGE: 'message:new',
}

// Server-side: trigger event
export async function triggerEvent(
  channel: string,
  event: string,
  data: Record<string, unknown>
): Promise<boolean> {
  const pusher = getPusherServer()
  if (!pusher) {
    console.log(`[Pusher Mock] ${channel} -> ${event}:`, data)
    return true
  }
  
  try {
    await pusher.trigger(channel, event, data)
    return true
  } catch (err) {
    console.error('[Pusher] Trigger error:', err)
    return false
  }
}
