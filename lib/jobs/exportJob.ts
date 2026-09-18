import { v2 as cloudinary } from "cloudinary";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function escapeCsvField(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowToCsv(fields: unknown[]): string {
  return fields.map(escapeCsvField).join(",");
}

async function uploadToCloudinary(
  buffer: Buffer,
  filename: string,
  resourceType: "raw"
): Promise<{ url: string; bytes: number }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: "realxworld/exports",
        public_id: filename,
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"));
        resolve({ url: result.secure_url, bytes: result.bytes });
      }
    );
    stream.end(buffer);
  });
}

export async function generateExport(
  exportId: string,
  type: string,
  userId: string
): Promise<void> {
  await prisma.export.update({
    where: { id: exportId },
    data: { status: "PROCESSING" },
  });

  try {
    let fileUrl: string;
    let fileSize: number;
    const timestamp = Date.now();

    if (type === "LISTINGS_CSV" || type === "LISTINGS_EXCEL") {
      const listings = await prisma.listing.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          type: true,
          category: true,
          status: true,
          publishedAt: true,
          createdAt: true,
          location: {
            select: { state: true, city: true, area: true, address: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (type === "LISTINGS_CSV") {
        const header = rowToCsv([
          "id", "title", "description", "price", "type", "category",
          "status", "state", "city", "area", "address", "publishedAt", "createdAt",
        ]);
        const rows = listings.map((l: any) =>
          rowToCsv([
            l.id, l.title, l.description, l.price, l.type, l.category,
            l.status, l.location.state, l.location.city, l.location.area,
            l.location.address, l.publishedAt, l.createdAt,
          ])
        );
        const csv = [header, ...rows].join("\n");
        const buffer = Buffer.from(csv, "utf-8");
        ({ url: fileUrl, bytes: fileSize } = await uploadToCloudinary(buffer, `listings_${timestamp}.csv`, "raw"));
      } else {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Listings");
        sheet.columns = [
          { header: "ID", key: "id", width: 30 },
          { header: "Title", key: "title", width: 40 },
          { header: "Description", key: "description", width: 60 },
          { header: "Price", key: "price", width: 15 },
          { header: "Type", key: "type", width: 10 },
          { header: "Category", key: "category", width: 15 },
          { header: "Status", key: "status", width: 12 },
          { header: "State", key: "state", width: 20 },
          { header: "City", key: "city", width: 20 },
          { header: "Area", key: "area", width: 20 },
          { header: "Address", key: "address", width: 40 },
          { header: "Published At", key: "publishedAt", width: 22 },
          { header: "Created At", key: "createdAt", width: 22 },
        ];
        for (const l of listings) {
          sheet.addRow({
            id: l.id,
            title: l.title,
            description: l.description,
            price: l.price,
            type: l.type,
            category: l.category,
            status: l.status,
            state: l.location.state,
            city: l.location.city,
            area: l.location.area,
            address: l.location.address,
            publishedAt: l.publishedAt,
            createdAt: l.createdAt,
          });
        }
        const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
        ({ url: fileUrl, bytes: fileSize } = await uploadToCloudinary(buffer, `listings_${timestamp}.xlsx`, "raw"));
      }
    } else if (type === "USERS_CSV") {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const header = rowToCsv(["id", "name", "email", "phone", "role", "isVerified", "isActive", "createdAt"]);
      const rows = users.map((u: any) =>
        rowToCsv([u.id, u.name, u.email, u.phone, u.role, u.isVerified, u.isActive, u.createdAt])
      );
      const csv = [header, ...rows].join("\n");
      const buffer = Buffer.from(csv, "utf-8");
      ({ url: fileUrl, bytes: fileSize } = await uploadToCloudinary(buffer, `users_${timestamp}.csv`, "raw"));
    } else if (type === "PROFESSIONALS_CSV") {
      const professionals = await prisma.professional.findMany({
        select: {
          id: true,
          userId: true,
          user: { select: { name: true, email: true } },
          category: true,
          company: true,
          experience: true,
          location: true,
          state: true,
          phone: true,
          website: true,
          status: true,
          isVerified: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const header = rowToCsv([
        "ID", "Name", "Email", "Category", "Company", "Experience (Years)",
        "Location", "State", "Phone", "Website", "Status", "Verified", "Joined",
      ]);
      const rows = professionals.map((p: any) =>
        rowToCsv([
          p.id, p.user?.name, p.user?.email, p.category, p.company, p.experience,
          p.location, p.state, p.phone, p.website, p.status, p.isVerified, p.createdAt,
        ])
      );
      const csv = [header, ...rows].join("\n");
      const buffer = Buffer.from(csv, "utf-8");
      ({ url: fileUrl, bytes: fileSize } = await uploadToCloudinary(buffer, `professionals_${timestamp}.csv`, "raw"));
    } else if (type === "VENDORS_CSV") {
      const vendors = await prisma.materialVendor.findMany({
        select: {
          id: true,
          userId: true,
          user: { select: { name: true, email: true } },
          businessName: true,
          description: true,
          phone: true,
          whatsapp: true,
          email: true,
          address: true,
          state: true,
          status: true,
          isVerified: true,
          createdAt: true,
          _count: { select: { listings: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      const header = rowToCsv([
        "ID", "Owner Name", "Owner Email", "Business Name", "Phone",
        "WhatsApp", "Business Email", "Address", "State", "Status",
        "Verified", "Listings Count", "Joined",
      ]);
      const rows = vendors.map((v: any) =>
        rowToCsv([
          v.id, v.user?.name, v.user?.email, v.businessName, v.phone,
          v.whatsapp, v.email, v.address, v.state, v.status,
          v.isVerified, v._count.listings, v.createdAt,
        ])
      );
      const csv = [header, ...rows].join("\n");
      const buffer = Buffer.from(csv, "utf-8");
      ({ url: fileUrl, bytes: fileSize } = await uploadToCloudinary(buffer, `vendors_${timestamp}.csv`, "raw"));
    } else if (type === "ENQUIRIES_CSV") {
      const enquiries = await prisma.enquiry.findMany({
        select: {
          id: true,
          buyer: { select: { name: true, email: true } },
          listing: { select: { title: true, type: true } },
          isPaid: true,
          message: true,
          createdAt: true,
          _count: { select: { messages: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      const header = rowToCsv([
        "ID", "Buyer Name", "Buyer Email", "Listing Title", "Listing Type",
        "Initial Message", "Messages Count", "Date",
      ]);
      const rows = enquiries.map((e: any) =>
        rowToCsv([
          e.id, e.buyer?.name, e.buyer?.email, e.listing?.title, e.listing?.type,
          e.message, e._count.messages, e.createdAt,
        ])
      );
      const csv = [header, ...rows].join("\n");
      const buffer = Buffer.from(csv, "utf-8");
      ({ url: fileUrl, bytes: fileSize } = await uploadToCloudinary(buffer, `enquiries_${timestamp}.csv`, "raw"));
    } else if (type === "PAYMENTS_CSV") {
      const payments = await prisma.payment.findMany({
        select: {
          id: true,
          user: { select: { name: true, email: true } },
          type: true,
          amount: true,
          currency: true,
          status: true,
          paystackRef: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const header = rowToCsv([
        "ID", "User Name", "User Email", "Payment Type", "Amount (NGN)",
        "Currency", "Status", "Paystack Reference", "Date",
      ]);
      const rows = payments.map((p: any) =>
        rowToCsv([
          p.id, p.user?.name, p.user?.email, p.type, p.amount,
          p.currency, p.status, p.paystackRef, p.createdAt,
        ])
      );
      const csv = [header, ...rows].join("\n");
      const buffer = Buffer.from(csv, "utf-8");
      ({ url: fileUrl, bytes: fileSize } = await uploadToCloudinary(buffer, `payments_${timestamp}.csv`, "raw"));
    } else {
      throw new Error(`Unsupported export type: ${type}`);
    }

    await prisma.export.update({
      where: { id: exportId },
      data: { status: "DONE", fileUrl, fileSize, completedAt: new Date() },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await prisma.export.update({
      where: { id: exportId },
      data: { status: "FAILED", completedAt: new Date() },
    });
    console.error(`Export ${exportId} failed:`, message);
  }
}
