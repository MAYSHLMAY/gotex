import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoice } from "@/lib/generateInvoice";

type Params = { params: { id: string } };

// GET: Generate and return PDF invoice
export async function GET(_req: Request, { params }: Params) {
  try {
    const orderId = params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: {
          include: {
            user: {
              select: { phone: true }
            }
          }
        },
        items: {
          include: {
            produce: {
              select: { nameEn: true, nameAm: true }
            },
            farmer: {
              include: {
                user: {
                  select: { nameEn: true }
                }
              }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const doc = generateInvoice({
      id: order.id,
      createdAt: order.createdAt,
      status: order.status,
      totalAmountETB: order.totalAmountETB,
      buyer: {
        businessName: order.buyer.businessName,
        deliveryAddress: order.deliveryAddress,
        user: {
          phone: order.buyer.user.phone
        }
      },
      items: order.items.map(item => ({
        produce: {
          nameEn: item.produce.nameEn,
          nameAm: item.produce.nameAm
        },
        farmer: {
          user: {
            nameEn: item.farmer.user.nameEn
          }
        },
        quantityKg: item.quantityKg,
        pricePerKg: item.pricePerKg
      }))
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="gotera-invoice-${orderId.slice(0, 8)}.pdf"`
      }
    });
  } catch (error) {
    console.error('[Invoice GET Error]:', error);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}

// POST: Create invoice record (for admin)
export async function POST(_req: Request, { params }: Params) {
  try {
    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const existing = await prisma.invoice.findUnique({ where: { orderId: order.id } });
    if (existing) return NextResponse.json({ data: existing });

    const invoice = await prisma.invoice.create({
      data: {
        orderId: order.id,
        amountETB: order.totalAmountETB,
        pdfUrl: null,
      },
    });

    return NextResponse.json({ data: invoice });
  } catch (error) {
    console.error('[Invoice POST Error]:', error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
