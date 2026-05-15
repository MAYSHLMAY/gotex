import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface InvoiceOrder {
  id: string
  createdAt: Date | string
  status: string
  totalAmountETB: number
  buyer: {
    businessName: string
    deliveryAddress: string | null
    user: {
      phone: string
    }
  }
  items: Array<{
    produce: {
      nameEn: string
      nameAm: string
    }
    farmer: {
      user: {
        nameEn: string
      }
    }
    quantityKg: number
    pricePerKg: number
  }>
}

export function generateInvoice(order: InvoiceOrder): jsPDF {
  const doc = new jsPDF()

  // Gold header bar
  doc.setFillColor(212, 160, 23)
  doc.rect(0, 0, 210, 32, 'F')
  doc.setTextColor(26, 26, 46)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('GOTERA', 14, 16)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('From Farm to Your Kitchen, Without the Chaos', 14, 25)

  doc.setTextColor(26, 26, 46)
  doc.setFontSize(10)
  doc.text(`Invoice #: GOT-${order.id.slice(0, 8).toUpperCase()}`, 14, 45)
  const createdDate = typeof order.createdAt === 'string' 
    ? new Date(order.createdAt) 
    : order.createdAt
  doc.text(`Date: ${createdDate.toLocaleDateString('en-ET')}`, 14, 53)
  doc.text(`Status: ${order.status.toUpperCase()}`, 14, 61)

  doc.setFont('helvetica', 'bold')
  doc.text('Bill To:', 130, 45)
  doc.setFont('helvetica', 'normal')
  doc.text(order.buyer.businessName, 130, 53)
  doc.text(order.buyer.deliveryAddress ?? '', 130, 61)
  doc.text(order.buyer.user.phone ?? '', 130, 69)

  autoTable(doc, {
    startY: 80,
    head: [['Produce', 'Farmer', 'Qty (kg)', 'Price/kg (ETB)', 'Total (ETB)']],
    body: order.items.map(item => [
      `${item.produce.nameEn} / ${item.produce.nameAm}`,
      item.farmer.user.nameEn,
      item.quantityKg.toFixed(1),
      item.pricePerKg.toFixed(2),
      (item.quantityKg * item.pricePerKg).toFixed(2)
    ]),
    foot: [
      ['', '', '', 'Subtotal', order.totalAmountETB.toFixed(2)],
      ['', '', '', 'Platform Fee (3%)', (order.totalAmountETB * 0.03).toFixed(2)],
      ['', '', '', 'TOTAL ETB', (order.totalAmountETB * 1.03).toFixed(2)]
    ],
    headStyles: { fillColor: [139, 69, 19], textColor: [255, 255, 255] },
    footStyles: { fillColor: [212, 160, 23], textColor: [26, 26, 46], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 240, 232] },
  })

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150)
  doc.text('Built in Addis Ababa | gotera.et', 14, 285)

  return doc
}
