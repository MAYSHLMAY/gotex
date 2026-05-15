import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export async function sendEmail({
  to,
  subject,
  html,
  from = 'Gotera <noreply@gotera.app>',
}: EmailOptions): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    })

    if (error) {
      console.error('[Resend] Email error:', error.message)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (err) {
    console.error('[Resend] Error:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

// Pre-built email templates
export const emailTemplates = {
  orderConfirmation: (orderId: string, total: number, items: string[]) => ({
    subject: `Order Confirmed - #${orderId.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2d6a4f; padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0;">Gotera</h1>
        </div>
        <div style="padding: 24px;">
          <h2 style="color: #1A1A2E;">Order Confirmed!</h2>
          <p>Your order <strong>#${orderId.slice(-8).toUpperCase()}</strong> has been confirmed.</p>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0 0 8px;"><strong>Items:</strong></p>
            <ul style="margin: 0; padding-left: 20px;">
              ${items.map(item => `<li>${item}</li>`).join('')}
            </ul>
            <p style="margin: 16px 0 0;"><strong>Total: ${total.toLocaleString()} ETB</strong></p>
          </div>
          <p>We'll notify you when your order is on its way.</p>
        </div>
        <div style="background: #f5f5f5; padding: 16px; text-align: center; color: #666;">
          <p style="margin: 0;">Gotera - Fresh from Ethiopian Farmers</p>
        </div>
      </div>
    `,
  }),

  deliveryUpdate: (orderId: string, status: string, driverName?: string) => ({
    subject: `Delivery Update - #${orderId.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2d6a4f; padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0;">Gotera</h1>
        </div>
        <div style="padding: 24px;">
          <h2 style="color: #1A1A2E;">Delivery Update</h2>
          <p>Your order <strong>#${orderId.slice(-8).toUpperCase()}</strong> status:</p>
          <div style="background: #D4A017; color: #1A1A2E; padding: 12px 24px; border-radius: 8px; display: inline-block; font-weight: bold;">
            ${status}
          </div>
          ${driverName ? `<p style="margin-top: 16px;">Driver: <strong>${driverName}</strong></p>` : ''}
        </div>
      </div>
    `,
  }),

  welcomeFarmer: (name: string) => ({
    subject: 'Welcome to Gotera!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2d6a4f; padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0;">Gotera</h1>
        </div>
        <div style="padding: 24px;">
          <h2 style="color: #1A1A2E;">Welcome, ${name}!</h2>
          <p>Thank you for joining Gotera. You're now part of Ethiopia's largest direct farm-to-buyer marketplace.</p>
          <p>Here's what you can do:</p>
          <ul>
            <li>List your produce and set your prices</li>
            <li>Receive orders directly from buyers</li>
            <li>Track your earnings and analytics</li>
            <li>Get AI-powered farming tips</li>
          </ul>
          <a href="${process.env.NEXTAUTH_URL}/farmer/dashboard" style="display: inline-block; background: #D4A017; color: #1A1A2E; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
            Go to Dashboard
          </a>
        </div>
      </div>
    `,
  }),
}
