import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import type { WebhookEvent } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    // Verify the webhook signature
    const evt = await verifyWebhook(request, {
      signingSecret: process.env.CLERK_WEBHOOK_SIGNING_SECRET,
    })

    const eventType = evt.type
    console.log(`Received Clerk webhook: ${eventType}`)

    switch (eventType) {
      case 'user.created':
      case 'user.updated':
        // Type assertion for user events
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userData = evt.data as any
        const { id, email_addresses } = userData

        // Get primary email address
        const primaryEmail = email_addresses?.find(
          (email: { id: string; email_address: string }) => email.id === userData.primary_email_address_id
        )?.email_address || ''

        // Upsert user in database
        await db.user.upsert({
          where: { id: id as string },
          update: {
            email: primaryEmail,
          },
          create: {
            id: id as string,
            email: primaryEmail,
          },
        })

        console.log(`User ${eventType}: ${id} with email ${primaryEmail}`)
        break

      case 'user.deleted':
        // Delete user and cascade to documents
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const deletedUserData = evt.data as any
        await db.user.delete({
          where: { id: deletedUserData.id as string },
        })
        console.log(`User deleted: ${deletedUserData.id}`)
        break

      default:
        console.log(`Unhandled webhook event: ${eventType}`)
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    )
  }
}
