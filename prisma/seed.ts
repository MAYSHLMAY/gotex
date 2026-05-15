import { PrismaClient, Role, OrderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Ethiopian farmers with exact names, regions and coordinates
const farmerData = [
  { nameEn: "Abebe Girma", region: "Oromia", woreda: "Sebeta", lat: 8.9167, lng: 38.6167 },
  { nameEn: "Tigist Haile", region: "Amhara", woreda: "Debre Birhan", lat: 9.6833, lng: 39.5333 },
  { nameEn: "Mulugeta Bekele", region: "SNNPR", woreda: "Hawassa", lat: 7.05, lng: 38.4667 },
  { nameEn: "Selamawit Tadesse", region: "Oromia", woreda: "Adama", lat: 8.54, lng: 39.27 },
  { nameEn: "Dawit Alemu", region: "Oromia", woreda: "Bishoftu", lat: 8.75, lng: 39.0 },
  { nameEn: "Hiwot Tesfaye", region: "Amhara", woreda: "Bahir Dar", lat: 11.5936, lng: 37.39 },
  { nameEn: "Yohannes Desta", region: "Tigray", woreda: "Mekelle", lat: 13.4833, lng: 39.4667 },
  { nameEn: "Birtukan Mengistu", region: "Oromia", woreda: "Holeta", lat: 9.0667, lng: 38.5 },
  { nameEn: "Gemechu Lema", region: "Oromia", woreda: "Zeway", lat: 7.9333, lng: 38.7167 },
  { nameEn: "Azalech Wolde", region: "SNNPR", woreda: "Sidama", lat: 6.9, lng: 38.4 },
  { nameEn: "Tesfaye Negash", region: "Oromia", woreda: "Jimma", lat: 7.6667, lng: 36.8333 },
  { nameEn: "Lemlem Araya", region: "Tigray", woreda: "Adwa", lat: 14.1667, lng: 38.9 },
  { nameEn: "Kassahun Worku", region: "Amhara", woreda: "Kombolcha", lat: 11.0833, lng: 39.7333 },
  { nameEn: "Mekdes Solomon", region: "Oromia", woreda: "Modjo", lat: 8.59, lng: 39.12 },
  { nameEn: "Girma Kebede", region: "SNNPR", woreda: "Wolaita Sodo", lat: 6.85, lng: 37.75 },
];

// Produce with Gotera prices and Atikilt Tera baseline prices (40-60% higher)
const produceData = [
  { nameEn: "Tomatoes", nameAm: "ቲማቲም", category: "vegetables", goteraPrice: 18, atikiltTeraPrice: 28 },
  { nameEn: "Red Onions", nameAm: "ቀይ ሽንኩርት", category: "vegetables", goteraPrice: 22, atikiltTeraPrice: 35 },
  { nameEn: "Potatoes", nameAm: "ድንች", category: "vegetables", goteraPrice: 14, atikiltTeraPrice: 22 },
  { nameEn: "Green Pepper", nameAm: "አረንጓዴ በርበሬ", category: "vegetables", goteraPrice: 35, atikiltTeraPrice: 55 },
  { nameEn: "Garlic", nameAm: "ነጭ ሽንኩርት", category: "herbs", goteraPrice: 85, atikiltTeraPrice: 130 },
  { nameEn: "Ginger", nameAm: "ዝንጅብል", category: "herbs", goteraPrice: 95, atikiltTeraPrice: 150 },
  { nameEn: "Berbere Peppers", nameAm: "በርበሬ", category: "spices", goteraPrice: 120, atikiltTeraPrice: 180 },
  { nameEn: "Avocado", nameAm: "አቮካዶ", category: "fruits", goteraPrice: 25, atikiltTeraPrice: 40 },
  { nameEn: "Mango", nameAm: "ማንጎ", category: "fruits", goteraPrice: 20, atikiltTeraPrice: 32 },
  { nameEn: "Teff", nameAm: "ጤፍ", category: "grains", goteraPrice: 45, atikiltTeraPrice: 65 },
  { nameEn: "Cabbage", nameAm: "ጎመን", category: "vegetables", goteraPrice: 10, atikiltTeraPrice: 16 },
  { nameEn: "Carrots", nameAm: "ካሮት", category: "vegetables", goteraPrice: 16, atikiltTeraPrice: 25 },
];

// Buyer data
const buyerData = [
  { businessName: "Sheraton Addis", businessType: "hotel", lat: 9.0227, lng: 38.7615 },
  { businessName: "Yod Abyssinia Restaurant", businessType: "restaurant", lat: 9.0157, lng: 38.7524 },
  { businessName: "Kuriftu Resort", businessType: "hotel", lat: 8.75, lng: 38.9833 },
  { businessName: "Addis Catering PLC", businessType: "caterer", lat: 9.0054, lng: 38.7636 },
  { businessName: "Ethio Wholesale Market", businessType: "wholesaler", lat: 9.035, lng: 38.73 },
];

// Driver data
const driverData = [
  { nameEn: "Bekele Hailu", vehicleType: "pickup", plateNumber: "AA-3-45621", capacityKg: 500, lat: 9.02, lng: 38.75, refrigerated: false },
  { nameEn: "Tadele Gebre", vehicleType: "truck", plateNumber: "AA-2-78934", capacityKg: 2000, lat: 8.98, lng: 38.78, refrigerated: false },
  { nameEn: "Chaltu Dire", vehicleType: "refrigerated_truck", plateNumber: "AA-4-12345", capacityKg: 1500, lat: 9.05, lng: 38.72, refrigerated: true },
];

async function main() {
  console.log("Starting Gotera seed...");

    // Clean up existing data (in reverse order of dependencies)
  console.log("Cleaning up existing data...");
  await prisma.notification.deleteMany();
  await prisma.rfqBid.deleteMany();
  await prisma.rfq.deleteMany();
  await prisma.procurementTemplateLine.deleteMany();
  await prisma.procurementTemplate.deleteMany();
  await prisma.harvestPlan.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  // await prisma.cartItem.deleteMany();
  await prisma.produce.deleteMany();
  await prisma.logisticsRequest.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.farmer.deleteMany();
  await prisma.buyer.deleteMany();
  await prisma.cooperative.deleteMany();
  await prisma.user.deleteMany();
  await prisma.platformSetting.deleteMany();
  console.log("Cleanup complete.");
  
  const passwordHash = await bcrypt.hash("gotera-demo-2026", 10);

  // Create 15 Ethiopian farmers
  const farmers = [];
  for (let i = 0; i < farmerData.length; i++) {
    const fd = farmerData[i];
    const user = await prisma.user.create({
      data: {
        role: Role.FARMER,
        nameEn: fd.nameEn,
        nameAm: fd.nameEn, // Use same name for now
        phone: `+25190000${String(1000 + i).slice(-4)}`,
        email: `${fd.nameEn.toLowerCase().replace(/\s/g, ".")}@demo.gotera.et`,
        passwordHash,
        verified: true,
      },
    });
    const farmer = await prisma.farmer.create({
      data: {
        userId: user.id,
        region: fd.region,
        woreda: fd.woreda,
        farmSizeSqm: 5000 + i * 400,
        farmTypes: ["vegetables", "fruits", "grains"].slice(0, (i % 3) + 1),
        lat: fd.lat,
        lng: fd.lng,
        trustScore: 4.0 + (i % 10) * 0.1,
      },
    });
    farmers.push(farmer);
    console.log(`Created farmer: ${fd.nameEn}`);
  }

  // Each farmer gets 4 produce listings
  for (let i = 0; i < farmers.length; i++) {
    const farmer = farmers[i];
    // Get 4 different produce items for each farmer (rotate through the list)
    const farmerProduce = [
      produceData[i % produceData.length],
      produceData[(i + 3) % produceData.length],
      produceData[(i + 6) % produceData.length],
      produceData[(i + 9) % produceData.length],
    ];
    
    for (const p of farmerProduce) {
      const grade = ["A", "A+", "B"][Math.floor(Math.random() * 3)];
      await prisma.produce.create({
        data: {
          farmerId: farmer.id,
          nameEn: p.nameEn,
          nameAm: p.nameAm,
          category: p.category,
          quantityKg: 100 + Math.floor(Math.random() * 400),
          pricePerKg: p.goteraPrice,
          atikiltTeraBaselinePrice: p.atikiltTeraPrice,
          minOrderKg: 10,
          grade,
          harvestDate: new Date(Date.now() - Math.floor(Math.random() * 7) * 86400000),
          freshnessWindow: 5 + Math.floor(Math.random() * 5),
          imageUrls: [
            `https://images.unsplash.com/photo-1546094096-0df4bcaaa508?auto=format&fit=crop&w=800&q=60`,
          ],
          isAvailable: true,
          deliveryOffered: true,
          deliveryRadiusKm: 30 + Math.floor(Math.random() * 20),
        },
      });
    }
  }
  console.log("Created produce for all farmers");

  // Create 5 sample buyers
  const buyers = [];
  for (let i = 0; i < buyerData.length; i++) {
    const bd = buyerData[i];
    const user = await prisma.user.create({
      data: {
        role: Role.BUYER,
        nameEn: `${bd.businessName} Manager`,
        nameAm: `${bd.businessName} ሥራ አስኪያጅ`,
        phone: `+25191111${String(1000 + i).slice(-4)}`,
        email: `${bd.businessName.toLowerCase().replace(/\s/g, ".")}@demo.gotera.et`,
        passwordHash,
        verified: true,
      },
    });
    const buyer = await prisma.buyer.create({
      data: {
        userId: user.id,
        businessName: bd.businessName,
        businessLicense: `BR-${10000 + i}`,
        contactPerson: user.nameEn,
        city: "Addis Ababa",
        businessType: bd.businessType,
        deliveryAddress: `Bole, Addis Ababa — ${bd.businessName}`,
        deliveryLat: bd.lat,
        deliveryLng: bd.lng,
        procurementFreq: ["daily", "weekly", "monthly"][i % 3],
      },
    });
    buyers.push(buyer);
    console.log(`Created buyer: ${bd.businessName}`);
  }

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      role: Role.ADMIN,
      nameEn: "Gotera Admin",
      nameAm: "ጎተራ አስተዳዳሪ",
      phone: "+251900009999",
      email: "admin@demo.gotera.et",
      passwordHash,
      verified: true,
    },
  });
  console.log("Created admin user");

  // Create cooperative
  const cooperative = await prisma.cooperative.create({
    data: { name: "Woliso Highland Co-op", region: "Oromia" },
  });

  await prisma.farmer.updateMany({
    where: { id: { in: farmers.slice(0, 5).map((f) => f.id) } },
    data: { cooperativeId: cooperative.id },
  });
  console.log("Created cooperative");

  // Platform settings
  await prisma.platformSetting.createMany({
    data: [
      { key: "commission_rate", value: "0.03" },
      { key: "site_name", value: "Gotera" },
    ],
    skipDuplicates: true,
  });

  // Create 30 days of price history for top 8 vegetables
  const priceHistoryProduce = produceData.slice(0, 8);
  for (let day = 0; day < 30; day++) {
    const date = new Date(Date.now() - day * 86400000);
    for (const p of priceHistoryProduce) {
      // Add some daily variance to prices (5% fluctuation)
      const variance = 1 + (Math.random() * 0.1 - 0.05);
      const goteraPrice = Math.round(p.goteraPrice * variance * 100) / 100;
      const atikiltTeraPrice = Math.round(p.atikiltTeraPrice * variance * 100) / 100;
      
      await prisma.priceHistory.create({
        data: {
          produceName: p.nameEn,
          goteraPrice,
          atikiltTeraPrice,
          recordedAt: date,
        },
      });
    }
  }
  console.log("Created 30 days of price history for top 8 produce");

  // Create harvest plans
  await prisma.harvestPlan.createMany({
    data: [
      {
        farmerId: farmers[0].id,
        nameEn: "Tomato bulk harvest",
        nameAm: "የቲማቲም መከር",
        quantityKg: 500,
        harvestDate: new Date(Date.now() + 21 * 86400000),
      },
      {
        farmerId: farmers[1].id,
        nameEn: "Potato cycle",
        nameAm: "የድንች መከር",
        quantityKg: 320,
        harvestDate: new Date(Date.now() + 14 * 86400000),
      },
      {
        farmerId: farmers[2].id,
        nameEn: "Onion harvest",
        nameAm: "የሽንኩርት መከር",
        quantityKg: 400,
        harvestDate: new Date(Date.now() + 7 * 86400000),
      },
    ],
  });
  console.log("Created harvest plans");

  // Create procurement template
  await prisma.procurementTemplate.create({
    data: {
      buyerId: buyers[0].id,
      name: "Weekly hotel greens",
      lines: {
        create: [
          { nameEn: "Tomatoes", nameAm: "ቲማቲም", targetKg: 50 },
          { nameEn: "Red Onions", nameAm: "ቀይ ሽንኩርት", targetKg: 30 },
          { nameEn: "Green Pepper", nameAm: "አረንጓዴ በርበሬ", targetKg: 20 },
          { nameEn: "Potatoes", nameAm: "ድንች", targetKg: 40 },
        ],
      },
    },
  });
  console.log("Created procurement template");

  // Create RFQ
  const rfq = await prisma.rfq.create({
    data: {
      buyerId: buyers[1].id,
      produceType: "Potatoes",
      quantityKg: 200,
      frequency: "weekly",
      durationDays: 90,
      deadline: new Date(Date.now() + 10 * 86400000),
      status: "OPEN",
    },
  });

  await prisma.rfqBid.createMany({
    data: [
      {
        rfqId: rfq.id,
        farmerId: farmers[2].id,
        pricePerKg: 14,
        quantityKg: 220,
        message: "Can supply weekly from Hawassa region.",
      },
      {
        rfqId: rfq.id,
        farmerId: farmers[3].id,
        pricePerKg: 13.5,
        quantityKg: 200,
      },
    ],
  });
  console.log("Created RFQ with bids");

  // Create sample delivered orders for savings calculation
  for (let i = 0; i < 5; i++) {
    const buyer = buyers[i % buyers.length];
    const orderProduce = await prisma.produce.findMany({
      where: { farmerId: farmers[i].id },
      take: 2,
    });
    
    if (orderProduce.length > 0) {
      let totalAmount = 0;
      let atikiltTeraTotal = 0;
      const items = orderProduce.map(p => {
        const qty = 20 + Math.floor(Math.random() * 50);
        totalAmount += qty * p.pricePerKg;
        atikiltTeraTotal += qty * (p.atikiltTeraBaselinePrice ?? p.pricePerKg * 1.5);
        return { produce: p, qty };
      });

      const order = await prisma.order.create({
        data: {
          buyerId: buyer.id,
          status: OrderStatus.DELIVERED,
          totalAmountETB: totalAmount,
          atikiltTeraBaselineEtb: atikiltTeraTotal,
          deliveryAddress: buyer.deliveryAddress ?? "Addis Ababa",
          deliveryLat: buyer.deliveryLat,
          deliveryLng: buyer.deliveryLng,
          notes: `Sample order ${i + 1}`,
        },
      });

      for (const item of items) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            produceId: item.produce.id,
            farmerId: farmers[i].id,
            quantityKg: item.qty,
            pricePerKg: item.produce.pricePerKg,
            status: "DELIVERED",
          },
        });
      }

      await prisma.invoice.create({
        data: {
          orderId: order.id,
          amountETB: totalAmount,
          pdfUrl: null,
        },
      });
    }
  }
  console.log("Created sample delivered orders");

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: adminUser.id,
      title: "Verification queue",
      body: "3 new farmer documents are ready for review.",
      href: "/admin/verification",
    },
  });

  console.log(
    "\n✅ Seed complete: 15 farmers, 60 produce items, 5 buyers, 3 drivers (note: driver table needed), 1 admin, sample orders, RFQ, templates, harvest plans.",
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
