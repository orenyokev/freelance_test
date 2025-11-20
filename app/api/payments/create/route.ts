import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
}) : null

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { projectId, bidId } = await request.json()

    if (!projectId || !bidId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify project and bid
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        bids: {
          where: { id: bidId }
        }
      }
    })

    if (!project || project.bids.length === 0) {
      return NextResponse.json(
        { error: "Project or bid not found" },
        { status: 404 }
      )
    }

    const bid = project.bids[0]

    if (project.customerId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    if (bid.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: "Bid must be accepted before payment" },
        { status: 400 }
      )
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        amount: bid.amount,
        projectId,
        customerId: session.user.id,
        freelancerId: bid.freelancerId,
        status: 'PENDING',
      }
    })

    // Create Stripe checkout session
    if (stripe) {
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: project.title,
                description: `Payment for project: ${project.title}`,
              },
              unit_amount: Math.round(bid.amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXTAUTH_URL}/payments/success?payment_id=${payment.id}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/projects/${projectId}`,
        metadata: {
          paymentId: payment.id,
          projectId,
          bidId,
        },
      })

      // Update payment with Stripe session ID
      await prisma.payment.update({
        where: { id: payment.id },
        data: { stripeId: checkoutSession.id }
      })

      return NextResponse.json({
        sessionId: checkoutSession.id,
        url: checkoutSession.url,
      })
    } else {
      // Mock payment for development
      return NextResponse.json({
        sessionId: `mock_${payment.id}`,
        url: `/payments/success?payment_id=${payment.id}`,
        mock: true,
      })
    }
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

