import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL +
        (process.env.DATABASE_URL?.includes("?")
          ? "&connect_timeout=30"
          : "?connect_timeout=30"),
    },
  },
});

// ─── Constants ───────────────────────────────────────────────────────────────

const SEED_EMAILS = [
  "emeka.okafor@realxworld.net",
  "fatima.a@realxworld.net",
  "chidi.n@realxworld.net",
  "amina.b@realxworld.net",
  "tunde.a@realxworld.net",
];

const PROPERTY_IMAGES = [
  "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1974596/pexels-photo-1974596.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800",
];

// ─── Agents ──────────────────────────────────────────────────────────────────

const agentData = [
  { name: "Emeka Okafor",    email: "emeka.okafor@realxworld.net", phone: "08012345678" }, // index 0
  { name: "Fatima Abdullahi", email: "fatima.a@realxworld.net",    phone: "08023456789" }, // index 1
  { name: "Chidi Nwosu",     email: "chidi.n@realxworld.net",      phone: "08034567890" }, // index 2
  { name: "Amina Bello",     email: "amina.b@realxworld.net",      phone: "08045678901" }, // index 3
  { name: "Tunde Adeyemi",   email: "tunde.a@realxworld.net",      phone: "08056789012" }, // index 4
];

// ─── Listings ─────────────────────────────────────────────────────────────────

type ListingSeed = {
  title: string;
  description: string;
  price: number;
  type: "SALE" | "RENT";
  category: "RESIDENTIAL" | "COMMERCIAL" | "LAND";
  state: string;
  city: string;
  area: string;
  address: string;
  agentIndex: number;
};

const listingsData: ListingSeed[] = [
  // ── Lagos (8) ──────────────────────────────────────────────────────────────
  {
    title: "Luxury 4 Bedroom Detached Duplex in Lekki Phase 1",
    description:
      "Stunning 4 bedroom detached duplex in the heart of Lekki Phase 1. Features include a spacious living room, modern kitchen, en-suite bedrooms, BQ, 2 car garage, 24/7 power supply, and excellent security. Perfect for families seeking luxury living in Lagos premier neighbourhood.",
    price: 250_000_000,
    type: "SALE",
    category: "RESIDENTIAL",
    state: "Lagos", city: "Lekki", area: "Phase 1",
    address: "15 Admiralty Way, Lekki Phase 1, Lagos",
    agentIndex: 0,
  },
  {
    title: "3 Bedroom Flat with BQ in Victoria Island",
    description:
      "Well finished 3 bedroom apartment with boys quarter on Victoria Island. The apartment features a large living area, dining room, fitted kitchen, guest toilet, and a large balcony with ocean views. Located in a serene and secured estate with 24/7 light and water.",
    price: 180_000_000,
    type: "SALE",
    category: "RESIDENTIAL",
    state: "Lagos", city: "Victoria Island", area: "Adeola Odeku",
    address: "7 Adeola Odeku Street, Victoria Island, Lagos",
    agentIndex: 0,
  },
  {
    title: "Modern 2 Bedroom Apartment for Rent in Ikeja GRA",
    description:
      "Tastefully furnished 2 bedroom apartment in the prestigious Ikeja GRA. Features include a modern kitchen with fitted cabinets, air conditioning in all rooms, 24/7 security, covered parking, and a serene compound. Close to major banks, supermarkets, and transport links.",
    price: 3_500_000,
    type: "RENT",
    category: "RESIDENTIAL",
    state: "Lagos", city: "Ikeja", area: "GRA",
    address: "22 Obafemi Awolowo Way, Ikeja GRA, Lagos",
    agentIndex: 0,
  },
  {
    title: "Commercial Office Space in Lagos Island",
    description:
      "Prime commercial office space on Lagos Island Marina district. Open plan layout with 3 private offices, boardroom, reception area, and 2 toilets. Located in a high-traffic commercial area with excellent visibility. Suitable for law firms, financial institutions, and corporate businesses.",
    price: 15_000_000,
    type: "RENT",
    category: "COMMERCIAL",
    state: "Lagos", city: "Lagos Island", area: "Marina",
    address: "45 Marina Street, Lagos Island, Lagos",
    agentIndex: 1,
  },
  {
    title: "Half Plot of Land in Ibeju-Lekki",
    description:
      "Strategic half plot of land measuring 300sqm in the rapidly developing Ibeju-Lekki corridor. The area is close to the Dangote Refinery, Lekki Free Trade Zone, and the new international airport. Title document is C of O. This is a prime investment opportunity.",
    price: 12_000_000,
    type: "SALE",
    category: "LAND",
    state: "Lagos", city: "Ibeju-Lekki", area: "Eleko",
    address: "Eleko Junction, Ibeju-Lekki, Lagos",
    agentIndex: 0,
  },
  {
    title: "5 Bedroom Mansion in Banana Island",
    description:
      "Ultra-luxury 5 bedroom mansion on the exclusive Banana Island. Features include a private swimming pool, home cinema, gym, smart home automation, 4 car garage, and beautifully landscaped garden. Staff quarters included. This is the pinnacle of Lagos luxury living.",
    price: 800_000_000,
    type: "SALE",
    category: "RESIDENTIAL",
    state: "Lagos", city: "Ikoyi", area: "Banana Island",
    address: "3 Bourdillon Road, Banana Island, Ikoyi, Lagos",
    agentIndex: 0,
  },
  {
    title: "2 Bedroom Terrace House in Surulere",
    description:
      "Newly built 2 bedroom terrace house in Surulere. The property features a living room, dining area, modern kitchen, and a private compound. Located in a quiet residential area with good road access. Close to schools, markets, and public transport. C of O available.",
    price: 45_000_000,
    type: "SALE",
    category: "RESIDENTIAL",
    state: "Lagos", city: "Surulere", area: "Aguda",
    address: "18 Aguda Street, Surulere, Lagos",
    agentIndex: 4,
  },
  {
    title: "Warehouse for Lease in Apapa",
    description:
      "Large commercial warehouse measuring 2000sqm in Apapa industrial hub. Features include high ceiling clearance, loading bay, office space, security room, and 24/7 access. Strategically located close to Apapa port making it ideal for logistics, manufacturing, and distribution companies.",
    price: 25_000_000,
    type: "RENT",
    category: "COMMERCIAL",
    state: "Lagos", city: "Apapa", area: "Creek Road",
    address: "10 Creek Road, Apapa, Lagos",
    agentIndex: 4,
  },

  // ── Abuja (5) ─────────────────────────────────────────────────────────────
  {
    title: "4 Bedroom Semi-Detached Duplex in Maitama",
    description:
      "Exquisite 4 bedroom semi-detached duplex in the prestigious Maitama district of Abuja. Features include a large living room, family lounge, American kitchen, en-suite bedrooms, BQ, and a beautiful garden. Located in a serene and well-secured neighbourhood close to embassies and government offices.",
    price: 350_000_000,
    type: "SALE",
    category: "RESIDENTIAL",
    state: "FCT (Abuja)", city: "Abuja", area: "Maitama",
    address: "24 Aguiyi Ironsi Street, Maitama, Abuja",
    agentIndex: 1,
  },
  {
    title: "3 Bedroom Apartment for Rent in Wuse 2",
    description:
      "Spacious 3 bedroom apartment in the heart of Wuse 2. The apartment features a large sitting room, dining area, fitted kitchen, and ample parking space. Located minutes from major banks, shopping malls, and restaurants. 24/7 power supply and security provided.",
    price: 4_500_000,
    type: "RENT",
    category: "RESIDENTIAL",
    state: "FCT (Abuja)", city: "Abuja", area: "Wuse 2",
    address: "15 Aminu Kano Crescent, Wuse 2, Abuja",
    agentIndex: 1,
  },
  {
    title: "Full Plot of Land in Gwarinpa",
    description:
      "Full residential plot measuring 600sqm in Gwarinpa, Abuja's largest housing estate. The land has a registered survey plan and is suitable for building a residential property. The area has good road network, electricity, and water supply. R of O title available.",
    price: 35_000_000,
    type: "SALE",
    category: "LAND",
    state: "FCT (Abuja)", city: "Abuja", area: "Gwarinpa",
    address: "3rd Avenue, Gwarinpa Estate, Abuja",
    agentIndex: 1,
  },
  {
    title: "Office Complex in Central Business District",
    description:
      "Modern office complex in Abuja CBD. The property offers 500sqm of open plan office space spread across 2 floors with dedicated parking for 20 vehicles. Features include a reception lobby, server room, and backup power. Ideal for corporate organisations and government agencies.",
    price: 45_000_000,
    type: "RENT",
    category: "COMMERCIAL",
    state: "FCT (Abuja)", city: "Abuja", area: "CBD",
    address: "Plot 1234 Herbert Macaulay Way, CBD, Abuja",
    agentIndex: 1,
  },
  {
    title: "3 Bedroom Bungalow in Lugbe",
    description:
      "Well maintained 3 bedroom bungalow in Lugbe district. Features include a sitting room, dining area, modern kitchen, 2 bathrooms, and a spacious compound with a borehole. The property is close to the Nnamdi Azikiwe International Airport and major roads. Suitable for families and young professionals.",
    price: 28_000_000,
    type: "SALE",
    category: "RESIDENTIAL",
    state: "FCT (Abuja)", city: "Abuja", area: "Lugbe",
    address: "45 Airport Road, Lugbe, Abuja",
    agentIndex: 1,
  },

  // ── Port Harcourt (4) ─────────────────────────────────────────────────────
  {
    title: "4 Bedroom Duplex in GRA Phase 2",
    description:
      "Beautiful 4 bedroom duplex in the exclusive GRA Phase 2, Port Harcourt. The property features a large living area, dining room, modern kitchen, en-suite bedrooms, BQ, and a well-landscaped compound. 24/7 power and security. Close to oil company offices and shopping centres.",
    price: 120_000_000,
    type: "SALE",
    category: "RESIDENTIAL",
    state: "Rivers", city: "Port Harcourt", area: "GRA Phase 2",
    address: "8 Peter Odili Road, GRA Phase 2, Port Harcourt",
    agentIndex: 2,
  },
  {
    title: "2 Bedroom Flat for Rent in Trans Amadi",
    description:
      "Clean 2 bedroom flat in Trans Amadi, Port Harcourt. Features a sitting room, kitchen, bathroom, and toilet. The compound is fenced and gated with a security guard. Located close to major oil servicing companies and industrial facilities. Suitable for working professionals.",
    price: 2_800_000,
    type: "RENT",
    category: "RESIDENTIAL",
    state: "Rivers", city: "Port Harcourt", area: "Trans Amadi",
    address: "33 Trans Amadi Industrial Layout, Port Harcourt",
    agentIndex: 2,
  },
  {
    title: "Commercial Plot in Rumuola",
    description:
      "Prime commercial plot measuring 500sqm on Rumuola Road, Port Harcourt. The land is suitable for building a plaza, supermarket, or office complex. Located on a busy road with high vehicular and pedestrian traffic. Governor Consent title available.",
    price: 18_000_000,
    type: "SALE",
    category: "LAND",
    state: "Rivers", city: "Port Harcourt", area: "Rumuola",
    address: "Rumuola Road, Port Harcourt, Rivers State",
    agentIndex: 2,
  },
  {
    title: "5 Bedroom Mansion in Old GRA",
    description:
      "Magnificent 5 bedroom mansion in the serene Old GRA, Port Harcourt. Features include a private swimming pool, home office, cinema room, 4 car garage, and fully equipped BQ. The compound is beautifully landscaped with exotic plants. A rare gem in one of Port Harcourt's most prestigious addresses.",
    price: 450_000_000,
    type: "SALE",
    category: "RESIDENTIAL",
    state: "Rivers", city: "Port Harcourt", area: "Old GRA",
    address: "12 Kingsway Road, Old GRA, Port Harcourt",
    agentIndex: 2,
  },

  // ── Other states (3) ──────────────────────────────────────────────────────
  {
    title: "3 Bedroom Flat in Bodija, Ibadan",
    description:
      "Newly built 3 bedroom flat in the serene Bodija estate, Ibadan. Features include a spacious sitting room, modern kitchen with fitted cabinets, en-suite master bedroom, and prepaid electricity meter. Located close to the University of Ibadan and Bodija market. C of O title.",
    price: 22_000_000,
    type: "SALE",
    category: "RESIDENTIAL",
    state: "Oyo", city: "Ibadan", area: "Bodija",
    address: "7 University Road, Bodija, Ibadan, Oyo State",
    agentIndex: 4,
  },
  {
    title: "2 Bedroom Apartment in Sabon Gari, Kano",
    description:
      "Clean and spacious 2 bedroom apartment in Sabon Gari, Kano. Features a sitting room, kitchen, bathroom, and a covered parking space. The compound is well maintained with a functional borehole. Suitable for working professionals and small families. Close to commercial areas and markets.",
    price: 1_800_000,
    type: "RENT",
    category: "RESIDENTIAL",
    state: "Kano", city: "Kano", area: "Sabon Gari",
    address: "22 Ibrahim Taiwo Road, Sabon Gari, Kano",
    agentIndex: 3,
  },
  {
    title: "Commercial Plaza for Sale in Enugu",
    description:
      "Well positioned commercial plaza with 8 shops on Okpara Avenue, Enugu. The property is currently generating rental income of N4.5m per annum. Located in Enugu's most active commercial corridor with excellent road frontage and parking space. C of O title. Great investment opportunity.",
    price: 95_000_000,
    type: "SALE",
    category: "COMMERCIAL",
    state: "Enugu", city: "Enugu", area: "Independence Layout",
    address: "15 Okpara Avenue, Independence Layout, Enugu",
    agentIndex: 4,
  },
];

// ─── Cleanup ─────────────────────────────────────────────────────────────────

async function clearSeedData() {
  console.log("🧹 Clearing existing seed data...");

  const seedUsers = await prisma.user.findMany({
    where: { email: { in: SEED_EMAILS } },
    select: {
      id: true,
      listings: { select: { id: true, locationId: true } },
    },
  });

  if (seedUsers.length === 0) {
    console.log("   No existing seed data found — fresh run.\n");
    return;
  }

  for (const user of seedUsers) {
    const listingIds = user.listings.map((l) => l.id);
    const locationIds = user.listings.map((l) => l.locationId);

    if (listingIds.length > 0) {
      await prisma.auditLog.deleteMany({ where: { entity: "Listing", entityId: { in: listingIds } } });
      await prisma.listingImage.deleteMany({ where: { listingId: { in: listingIds } } });
      await prisma.savedListing.deleteMany({ where: { listingId: { in: listingIds } } });
      await prisma.report.deleteMany({ where: { listingId: { in: listingIds } } });
      await prisma.listing.deleteMany({ where: { id: { in: listingIds } } });
      await prisma.location.deleteMany({ where: { id: { in: locationIds } } });
    }

    await prisma.export.deleteMany({ where: { userId: user.id } });
    await prisma.auditLog.deleteMany({ where: { userId: user.id } });
  }

  await prisma.user.deleteMany({ where: { email: { in: SEED_EMAILS } } });
  console.log(`   Removed ${seedUsers.length} seed agents and their associated data.\n`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function main() {
  console.log("🌱 RealX World — Seed Script\n");

  await prisma.$connect();
  console.log("✅ Database connected");

  await clearSeedData();

  // ── Step 1: Create agents ────────────────────────────────────────────────
  console.log("👤 Creating agents...");
  const passwordHash = await hash("Agent123!", 10);
  const now = new Date();

  const agents: { id: string; name: string | null }[] = [];

  for (const data of agentData) {
    const agent = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: "AGENT",
        isVerified: true,
        isActive: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: agent.id,
        action: "SEED_CREATE",
        entity: "User",
        entityId: agent.id,
        meta: { role: "AGENT", source: "seed" },
      },
    });

    agents.push(agent);
    console.log(`   ✔ ${agent.name} (${data.email})`);
  }

  // ── Step 2: Create listings ──────────────────────────────────────────────
  console.log(`\n🏘  Creating ${listingsData.length} listings...\n`);

  for (let i = 0; i < listingsData.length; i++) {
    const data = listingsData[i];
    const agent = agents[data.agentIndex];

    // Location
    const location = await prisma.location.create({
      data: {
        state: data.state,
        city: data.city,
        area: data.area,
        address: data.address,
      },
    });

    // Listing
    const listing = await prisma.listing.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        type: data.type,
        category: data.category,
        status: "PUBLISHED",
        publishedAt: now,
        userId: agent.id,
        locationId: location.id,
      },
    });

    // Images — 2 per listing, rotated across PROPERTY_IMAGES
    for (let j = 0; j < 2; j++) {
      await prisma.listingImage.create({
        data: {
          listingId: listing.id,
          url: PROPERTY_IMAGES[(i + j) % 8],
          publicId: `seed/listing-${i + 1}-img-${j + 1}`,
          isPrimary: j === 0,
          order: j,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: agent.id,
        action: "SEED_CREATE",
        entity: "Listing",
        entityId: listing.id,
        meta: {
          title: listing.title,
          type: listing.type,
          category: listing.category,
          status: "PUBLISHED",
          source: "seed",
        },
      },
    });

    const price = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(data.price);

    console.log(`   [${String(i + 1).padStart(2, "0")}/20] ${data.title}`);
    console.log(`         ${price} · ${data.type} · ${data.category} · ${data.city}, ${data.state}`);
  }

  console.log("\n✅ Seed complete!");
  console.log(`   Agents:   ${agents.length}`);
  console.log(`   Listings: ${listingsData.length}`);
  console.log(`   Status:   All PUBLISHED\n`);
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
