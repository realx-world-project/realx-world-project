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
): Promise<string> {
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
        resolve(result.secure_url);
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
        const rows = listings.map((l) =>
          rowToCsv([
            l.id, l.title, l.description, l.price, l.type, l.category,
            l.status, l.location.state, l.location.city, l.location.area,
            l.location.address, l.publishedAt, l.createdAt,
          ])
        );
        const csv = [header, ...rows].join("\n");
        const buffer = Buffer.from(csv, "utf-8");
        fileUrl = await uploadToCloudinary(buffer, `listings_${timestamp}.csv`, "raw");
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
        fileUrl = await uploadToCloudinary(buffer, `listings_${timestamp}.xlsx`, "raw");
      }
    } else {
      // USERS_CSV
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
      const rows = users.map((u) =>
        rowToCsv([u.id, u.name, u.email, u.phone, u.role, u.isVerified, u.isActive, u.createdAt])
      );
      const csv = [header, ...rows].join("\n");
      const buffer = Buffer.from(csv, "utf-8");
      fileUrl = await uploadToCloudinary(buffer, `users_${timestamp}.csv`, "raw");
    }

    await prisma.export.update({
      where: { id: exportId },
      data: { status: "DONE", fileUrl, completedAt: new Date() },
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
