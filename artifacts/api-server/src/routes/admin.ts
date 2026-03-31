import { Router, type IRouter, type Request, type Response } from "express";
import {
  db,
  consultations,
  assessments,
  partnerRequests,
  studentReferrals,
  blogImportRecords,
  contactMessages,
  serviceRequests,
  members,
  askimateUsers,
  askimateConversations,
  askimateMessages,
  askimateWeeklyUsage,
} from "@workspace/db";
import { eq, desc, ilike, or, and, sql, count, type SQL, type Column } from "drizzle-orm";
import type { PgTable, PgColumn } from "drizzle-orm/pg-core";
import { requireAdmin } from "../middleware/auth";
import multer from "multer";
import AdmZip from "adm-zip";
import path from "path";
import fs from "fs";

const router: IRouter = Router();

router.use(requireAdmin);

const CONSULTATION_STATUSES = ["New", "Reviewed", "Contacted", "Closed"];
const GENERAL_STATUSES = ["New", "Under Review", "Contacted", "Accepted", "Rejected"];
const MESSAGE_STATUSES = ["New", "Reviewed", "Contacted", "Closed"];
const ALL_VALID_STATUSES = [...new Set([...CONSULTATION_STATUSES, ...GENERAL_STATUSES, ...MESSAGE_STATUSES])];
const ALLOWED_IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif"]);
const MAX_ZIP_ENTRIES = 500;
const MAX_UNCOMPRESSED_SIZE = 100 * 1024 * 1024;

function parseId(raw: string | string[]): number | null {
  const str = Array.isArray(raw) ? raw[0] : raw;
  const id = parseInt(str, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

router.get("/admin/stats", async (_req: Request, res: Response) => {
  try {
    const [consCount] = await db.select({ value: count() }).from(consultations);
    const [assCount] = await db.select({ value: count() }).from(assessments);
    const [partCount] = await db.select({ value: count() }).from(partnerRequests);
    const [refCount] = await db.select({ value: count() }).from(studentReferrals);
    const [msgCount] = await db.select({ value: count() }).from(contactMessages);
    const [srvCount] = await db.select({ value: count() }).from(serviceRequests);

    const [newCons] = await db.select({ value: count() }).from(consultations).where(eq(consultations.status, "New"));
    const [newAss] = await db.select({ value: count() }).from(assessments).where(eq(assessments.status, "New"));
    const [newPart] = await db.select({ value: count() }).from(partnerRequests).where(eq(partnerRequests.status, "New"));
    const [newRef] = await db.select({ value: count() }).from(studentReferrals).where(eq(studentReferrals.status, "New"));
    const [newMsg] = await db.select({ value: count() }).from(contactMessages).where(eq(contactMessages.status, "New"));
    const [newSrv] = await db.select({ value: count() }).from(serviceRequests).where(eq(serviceRequests.status, "New"));

    res.json({
      consultations: { total: consCount.value, new: newCons.value },
      assessments: { total: assCount.value, new: newAss.value },
      partnerRequests: { total: partCount.value, new: newPart.value },
      studentReferrals: { total: refCount.value, new: newRef.value },
      contactMessages: { total: msgCount.value, new: newMsg.value },
      serviceRequests: { total: srvCount.value, new: newSrv.value },
      totalNew: newCons.value + newAss.value + newPart.value + newRef.value + newMsg.value + newSrv.value,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/admin/stats/unread", async (_req: Request, res: Response) => {
  try {
    const [newCons] = await db.select({ value: count() }).from(consultations).where(eq(consultations.status, "New"));
    const [newAss] = await db.select({ value: count() }).from(assessments).where(eq(assessments.status, "New"));
    const [newPart] = await db.select({ value: count() }).from(partnerRequests).where(eq(partnerRequests.status, "New"));
    const [newRef] = await db.select({ value: count() }).from(studentReferrals).where(eq(studentReferrals.status, "New"));
    const [newMsg] = await db.select({ value: count() }).from(contactMessages).where(eq(contactMessages.status, "New"));
    const [newSrv] = await db.select({ value: count() }).from(serviceRequests).where(eq(serviceRequests.status, "New"));

    res.json({
      consultations: newCons.value,
      assessments: newAss.value,
      partners: newPart.value,
      referrals: newRef.value,
      messages: newMsg.value,
      serviceRequests: newSrv.value,
      total: newCons.value + newAss.value + newPart.value + newRef.value + newMsg.value + newSrv.value,
    });
  } catch (err) {
    console.error("Unread stats error:", err);
    res.status(500).json({ error: "Failed to fetch unread stats" });
  }
});

interface ListParams {
  whereClause: SQL | undefined;
  page: number;
  limit: number;
  offset: number;
}

function buildListParams(
  nameCol: Column,
  emailCol: Column,
  statusCol: Column,
  query: Record<string, unknown>,
): ListParams {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(10000, Math.max(1, parseInt(query.limit as string) || 20));
  const offset = (page - 1) * limit;
  const search = query.search as string | undefined;
  const statusFilter = query.status as string | undefined;

  const conditions: SQL[] = [];
  if (search) {
    const searchCond = or(ilike(nameCol, `%${search}%`), ilike(emailCol, `%${search}%`));
    if (searchCond) conditions.push(searchCond);
  }
  if (statusFilter) {
    conditions.push(eq(statusCol, statusFilter));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  return { whereClause, page, limit, offset };
}

async function listRecords(
  table: PgTable,
  nameCol: Column,
  emailCol: Column,
  statusCol: Column,
  createdCol: PgColumn,
  query: Record<string, unknown>,
) {
  const { whereClause, page, limit, offset } = buildListParams(nameCol, emailCol, statusCol, query);

  const baseQuery = whereClause
    ? db.select().from(table).where(whereClause)
    : db.select().from(table);

  const countQuery = whereClause
    ? db.select({ value: count() }).from(table).where(whereClause)
    : db.select({ value: count() }).from(table);

  const rows = await baseQuery.orderBy(desc(createdCol)).limit(limit).offset(offset);
  const [total] = await countQuery;

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total: total.value,
      totalPages: Math.ceil(total.value / limit),
    },
  };
}

function validatePatchBody(body: Record<string, unknown>, validStatuses: string[] = ALL_VALID_STATUSES): { status?: string; notes?: string } | string {
  const updates: { status?: string; notes?: string } = {};
  if (body.status !== undefined) {
    if (typeof body.status !== "string" || !validStatuses.includes(body.status)) {
      return "Invalid status";
    }
    updates.status = body.status;
  }
  if (body.notes !== undefined) {
    updates.notes = typeof body.notes === "string" ? body.notes : "";
  }
  return updates;
}

router.get("/admin/consultations", async (req: Request, res: Response) => {
  try {
    const result = await listRecords(
      consultations, consultations.fullName, consultations.email,
      consultations.status, consultations.createdAt, req.query as Record<string, unknown>
    );
    res.json(result);
  } catch (err) {
    console.error("List consultations error:", err);
    res.status(500).json({ error: "Failed to list consultations" });
  }
});

router.get("/admin/consultations/:id", async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [row] = await db.select().from(consultations).where(eq(consultations.id, id));
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch consultation" });
  }
});

router.patch("/admin/consultations/:id", async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid ID" }); return; }
    const result = validatePatchBody(req.body as Record<string, unknown>, CONSULTATION_STATUSES);
    if (typeof result === "string") { res.status(400).json({ error: result }); return; }
    const [row] = await db.update(consultations).set({ ...result, updatedAt: new Date() }).where(eq(consultations.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to update consultation" });
  }
});

router.delete("/admin/consultations/:id", async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [row] = await db.delete(consultations).where(eq(consultations.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete consultation" });
  }
});

router.get("/admin/assessments", async (req: Request, res: Response) => {
  try {
    const result = await listRecords(
      assessments, assessments.fullName, assessments.email,
      assessments.status, assessments.createdAt, req.query as Record<string, unknown>
    );
    res.json(result);
  } catch (err) {
    console.error("List assessments error:", err);
    res.status(500).json({ error: "Failed to list assessments" });
  }
});

router.get("/admin/assessments/:id", async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [row] = await db.select().from(assessments).where(eq(assessments.id, id));
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch assessment" });
  }
});

router.patch("/admin/assessments/:id", async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid ID" }); return; }
    const result = validatePatchBody(req.body as Record<string, unknown>, GENERAL_STATUSES);
    if (typeof result === "string") { res.status(400).json({ error: result }); return; }
    const [row] = await db.update(assessments).set({ ...result, updatedAt: new Date() }).where(eq(assessments.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to update assessment" });
  }
});

router.delete("/admin/assessments/:id", async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [row] = await db.delete(assessments).where(eq(assessments.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete assessment" });
  }
});

router.get("/admin/partners", async (req: Request, res: Response) => {
  try {
    const result = await listRecords(
      partnerRequests, partnerRequests.fullName, partnerRequests.email,
      partnerRequests.status, partnerRequests.createdAt, req.query as Record<string, unknown>
    );
    res.json(result);
  } catch (err) {
    console.error("List partners error:", err);
    res.status(500).json({ error: "Failed to list partner requests" });
  }
});

router.get("/admin/partners/:id", async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [row] = await db.select().from(partnerRequests).where(eq(partnerRequests.id, id));
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch partner request" });
  }
});

router.patch("/admin/partners/:id", async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid ID" }); return; }
    const result = validatePatchBody(req.body as Record<string, unknown>, GENERAL_STATUSES);
    if (typeof result === "string") { res.status(400).json({ error: result }); return; }
    const [row] = await db.update(partnerRequests).set({ ...result, updatedAt: new Date() }).where(eq(partnerRequests.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to update partner request" });
  }
});

router.delete("/admin/partners/:id", async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [row] = await db.delete(partnerRequests).where(eq(partnerRequests.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete partner request" });
  }
});

router.get("/admin/referrals", async (req: Request, res: Response) => {
  try {
    const result = await listRecords(
      studentReferrals, studentReferrals.fullName, studentReferrals.email,
      studentReferrals.status, studentReferrals.createdAt, req.query as Record<string, unknown>
    );
    res.json(result);
  } catch (err) {
    console.error("List referrals error:", err);
    res.status(500).json({ error: "Failed to list student referrals" });
  }
});

router.get("/admin/referrals/:id", async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [row] = await db.select().from(studentReferrals).where(eq(studentReferrals.id, id));
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch student referral" });
  }
});

router.patch("/admin/referrals/:id", async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid ID" }); return; }
    const result = validatePatchBody(req.body as Record<string, unknown>, GENERAL_STATUSES);
    if (typeof result === "string") { res.status(400).json({ error: result }); return; }
    const [row] = await db.update(studentReferrals).set({ ...result, updatedAt: new Date() }).where(eq(studentReferrals.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to update student referral" });
  }
});

router.delete("/admin/referrals/:id", async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [row] = await db.delete(studentReferrals).where(eq(studentReferrals.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete student referral" });
  }
});

router.get("/admin/messages", async (req: Request, res: Response) => {
  try {
    const result = await listRecords(
      contactMessages, contactMessages.fullName, contactMessages.email,
      contactMessages.status, contactMessages.createdAt, req.query as Record<string, unknown>
    );
    res.json(result);
  } catch (err) {
    console.error("List messages error:", err);
    res.status(500).json({ error: "Failed to list contact messages" });
  }
});

router.get("/admin/messages/:id", async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [row] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contact message" });
  }
});

router.patch("/admin/messages/:id", async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid ID" }); return; }
    const result = validatePatchBody(req.body as Record<string, unknown>, MESSAGE_STATUSES);
    if (typeof result === "string") { res.status(400).json({ error: result }); return; }
    const [row] = await db.update(contactMessages).set({ ...result, updatedAt: new Date() }).where(eq(contactMessages.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to update contact message" });
  }
});

router.delete("/admin/messages/:id", async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [row] = await db.delete(contactMessages).where(eq(contactMessages.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete contact message" });
  }
});

router.get("/admin/recent", async (_req: Request, res: Response) => {
  try {
    const recentCons = await db.select({
      id: consultations.id,
      type: sql<string>`'consultation'`,
      name: consultations.fullName,
      email: consultations.email,
      status: consultations.status,
      createdAt: consultations.createdAt,
    }).from(consultations).orderBy(desc(consultations.createdAt)).limit(10);

    const recentAss = await db.select({
      id: assessments.id,
      type: sql<string>`'assessment'`,
      name: assessments.fullName,
      email: assessments.email,
      status: assessments.status,
      createdAt: assessments.createdAt,
    }).from(assessments).orderBy(desc(assessments.createdAt)).limit(10);

    const recentPart = await db.select({
      id: partnerRequests.id,
      type: sql<string>`'partner'`,
      name: partnerRequests.fullName,
      email: partnerRequests.email,
      status: partnerRequests.status,
      createdAt: partnerRequests.createdAt,
    }).from(partnerRequests).orderBy(desc(partnerRequests.createdAt)).limit(10);

    const recentRef = await db.select({
      id: studentReferrals.id,
      type: sql<string>`'referral'`,
      name: studentReferrals.fullName,
      email: studentReferrals.email,
      status: studentReferrals.status,
      createdAt: studentReferrals.createdAt,
    }).from(studentReferrals).orderBy(desc(studentReferrals.createdAt)).limit(10);

    const recentMsg = await db.select({
      id: contactMessages.id,
      type: sql<string>`'message'`,
      name: contactMessages.fullName,
      email: contactMessages.email,
      status: contactMessages.status,
      createdAt: contactMessages.createdAt,
    }).from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(10);

    const all = [...recentCons, ...recentAss, ...recentPart, ...recentRef, ...recentMsg]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    res.json(all);
  } catch (err) {
    console.error("Recent error:", err);
    res.status(500).json({ error: "Failed to fetch recent submissions" });
  }
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.post("/admin/blog-import", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const zip = new AdmZip(req.file.buffer);
    const zipEntries = zip.getEntries();

    if (zipEntries.length > MAX_ZIP_ENTRIES) {
      res.status(400).json({ error: `ZIP contains too many entries (max ${MAX_ZIP_ENTRIES})` });
      return;
    }

    let totalUncompressed = 0;
    for (const entry of zipEntries) {
      totalUncompressed += entry.header.size;
      if (totalUncompressed > MAX_UNCOMPRESSED_SIZE) {
        res.status(400).json({ error: "ZIP uncompressed size exceeds 100MB limit" });
        return;
      }
    }

    let postsJson: { posts: unknown[] } | null = null;
    const imageEntries: AdmZip.IZipEntry[] = [];

    for (const entry of zipEntries) {
      const name = entry.entryName.toLowerCase();
      if (name === "posts.json" || name.endsWith("/posts.json")) {
        const parsed = JSON.parse(entry.getData().toString("utf8")) as Record<string, unknown>;
        if (parsed && Array.isArray(parsed.posts)) {
          postsJson = parsed as { posts: unknown[] };
        }
      }
      if ((name.startsWith("images/") || name.includes("/images/")) && !entry.isDirectory) {
        const ext = path.extname(entry.entryName).toLowerCase();
        if (ALLOWED_IMAGE_EXTS.has(ext)) {
          imageEntries.push(entry);
        }
      }
    }

    if (!postsJson) {
      res.status(400).json({ error: "ZIP must contain a valid posts.json with a \"posts\" array" });
      return;
    }

    const blogImagesDir = path.resolve(process.cwd(), "artifacts/universitio/public/blog-images");
    if (!fs.existsSync(blogImagesDir)) {
      fs.mkdirSync(blogImagesDir, { recursive: true });
    }

    let imagesSaved = 0;
    for (const imgEntry of imageEntries) {
      const fileName = path.basename(imgEntry.entryName).replace(/[^a-zA-Z0-9._-]/g, "_");
      if (fileName && !fileName.startsWith(".")) {
        const dest = path.join(blogImagesDir, fileName);
        fs.writeFileSync(dest, imgEntry.getData());
        imagesSaved++;
      }
    }

    const [record] = await db.insert(blogImportRecords).values({
      filename: req.file.originalname || "blog-import.zip",
      postCount: postsJson.posts.length,
      imageCount: imagesSaved,
      importData: postsJson,
      importedBy: req.admin?.email || "admin",
    }).returning();

    res.status(201).json({
      success: true,
      id: record.id,
      postCount: postsJson.posts.length,
      imageCount: imagesSaved,
    });
  } catch (err) {
    console.error("Blog import error:", err);
    res.status(500).json({ error: "Failed to process blog import" });
  }
});

router.get("/admin/blog-imports", async (_req: Request, res: Response) => {
  try {
    const rows = await db.select({
      id: blogImportRecords.id,
      filename: blogImportRecords.filename,
      postCount: blogImportRecords.postCount,
      imageCount: blogImportRecords.imageCount,
      importedBy: blogImportRecords.importedBy,
      createdAt: blogImportRecords.createdAt,
    }).from(blogImportRecords).orderBy(desc(blogImportRecords.createdAt));
    res.json(rows);
  } catch (err) {
    console.error("Blog imports list error:", err);
    res.status(500).json({ error: "Failed to list blog imports" });
  }
});

/* =========================================================
   SERVICE REQUESTS admin routes
   ========================================================= */

router.get("/admin/service-requests", async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const conditions: SQL[] = [];
    if (search) {
      conditions.push(
        or(
          ilike(serviceRequests.fullName, `%${search}%`),
          ilike(serviceRequests.email, `%${search}%`),
          ilike(serviceRequests.serviceType, `%${search}%`),
        ) as SQL,
      );
    }
    const rows = await db
      .select()
      .from(serviceRequests)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(serviceRequests.createdAt));
    res.json(rows);
  } catch (err) {
    console.error("Service requests list error:", err);
    res.status(500).json({ error: "Failed to list service requests" });
  }
});

router.get("/admin/service-requests/:id", async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const [row] = await db.select().from(serviceRequests).where(eq(serviceRequests.id, id));
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    console.error("Service request get error:", err);
    res.status(500).json({ error: "Failed to fetch service request" });
  }
});

router.patch("/admin/service-requests/:id", async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
  const { status, adminNotes } = req.body as { status?: string; adminNotes?: string };
  try {
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (status) updates.status = status;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;
    const [row] = await db.update(serviceRequests).set(updates).where(eq(serviceRequests.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    console.error("Service request update error:", err);
    res.status(500).json({ error: "Failed to update service request" });
  }
});

router.delete("/admin/service-requests/:id", async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(serviceRequests).where(eq(serviceRequests.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error("Service request delete error:", err);
    res.status(500).json({ error: "Failed to delete service request" });
  }
});

/* =========================================================
   MEMBERS — unified view across all form types + imported list
   ========================================================= */

type UnifiedMember = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  source: string;
  createdAt: Date;
  isDeletable: boolean;
};

router.get("/admin/members", async (req: Request, res: Response) => {
  try {
    const search = ((req.query.search as string) || "").toLowerCase();

    const [cons, asss, parts, refs, msgs, srvs, imported] = await Promise.all([
      db.select({ id: consultations.id, fullName: consultations.fullName, email: consultations.email, phone: consultations.mobile, createdAt: consultations.createdAt }).from(consultations),
      db.select({ id: assessments.id, fullName: assessments.fullName, email: assessments.email, phone: assessments.mobile, createdAt: assessments.createdAt }).from(assessments),
      db.select({ id: partnerRequests.id, fullName: partnerRequests.fullName, email: partnerRequests.email, phone: partnerRequests.phone, createdAt: partnerRequests.createdAt }).from(partnerRequests),
      db.select({ id: studentReferrals.id, fullName: studentReferrals.fullName, email: studentReferrals.email, createdAt: studentReferrals.createdAt }).from(studentReferrals),
      db.select({ id: contactMessages.id, fullName: contactMessages.fullName, email: contactMessages.email, phone: contactMessages.phone, createdAt: contactMessages.createdAt }).from(contactMessages),
      db.select({ id: serviceRequests.id, fullName: serviceRequests.fullName, email: serviceRequests.email, phone: serviceRequests.phone, createdAt: serviceRequests.createdAt }).from(serviceRequests),
      db.select({ id: members.id, fullName: members.fullName, email: members.email, phone: members.phone, source: members.source, createdAt: members.createdAt }).from(members),
    ]);

    const all: UnifiedMember[] = [
      ...cons.map(r => ({ ...r, source: "Consultation", isDeletable: false })),
      ...asss.map(r => ({ ...r, source: "Assessment", isDeletable: false })),
      ...parts.map(r => ({ ...r, source: "Partner", isDeletable: false })),
      ...refs.map(r => ({ ...r, phone: null as string | null, source: "Referral", isDeletable: false })),
      ...msgs.map(r => ({ ...r, source: "Contact", isDeletable: false })),
      ...srvs.map(r => ({ ...r, source: "Service Request", isDeletable: false })),
      ...imported.map(r => ({ ...r, isDeletable: true })),
    ];

    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const filtered = search
      ? all.filter(m =>
          (m.fullName ?? "").toLowerCase().includes(search) ||
          (m.email ?? "").toLowerCase().includes(search),
        )
      : all;

    res.json({ total: filtered.length, members: filtered });
  } catch (err) {
    console.error("Members list error:", err);
    res.status(500).json({ error: "Failed to list members" });
  }
});

router.delete("/admin/members/:id", async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) { res.status(400).json({ error: "Invalid ID" }); return; }
  try {
    await db.delete(members).where(eq(members.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error("Member delete error:", err);
    res.status(500).json({ error: "Failed to delete member" });
  }
});

router.post("/admin/members/import", async (req: Request, res: Response) => {
  try {
    const rows = req.body as Array<{ fullName: string; email: string; phone?: string; source?: string; createdAt?: string }>;
    if (!Array.isArray(rows) || rows.length === 0) {
      res.status(400).json({ error: "Expected a non-empty array of member objects" });
      return;
    }

    const existing = await db.select({ email: members.email }).from(members);
    const existingEmails = new Set(existing.map(r => r.email.toLowerCase()));

    const toInsert = rows
      .filter(r => r.email && r.fullName)
      .filter(r => !existingEmails.has(r.email.toLowerCase()))
      .map(r => ({
        fullName: r.fullName.trim(),
        email: r.email.trim().toLowerCase(),
        phone: r.phone?.trim() || null,
        source: (r.source || "imported").trim(),
        createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
        updatedAt: new Date(),
      }));

    if (toInsert.length === 0) {
      res.json({ inserted: 0, skipped: rows.length, message: "All records already exist or are invalid" });
      return;
    }

    await db.insert(members).values(toInsert);
    res.json({ inserted: toInsert.length, skipped: rows.length - toInsert.length });
  } catch (err) {
    console.error("Member import error:", err);
    res.status(500).json({ error: "Failed to import members" });
  }
});

// AskiMate Users Management
router.get("/admin/askimate-users", async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.search ? String(req.query.search).toLowerCase() : "";
    const page = parseInt(String(req.query.page || "1"), 10);
    const limit = parseInt(String(req.query.limit || "20"), 10);
    const offset = (page - 1) * limit;

    let query = db.select({
      id: askimateUsers.id,
      firstName: askimateUsers.firstName,
      lastName: askimateUsers.lastName,
      email: askimateUsers.email,
      plan: askimateUsers.plan,
      trialStartedAt: askimateUsers.trialStartedAt,
      trialEndsAt: askimateUsers.trialEndsAt,
      createdAt: askimateUsers.createdAt,
      updatedAt: askimateUsers.updatedAt,
    }).from(askimateUsers);

    if (searchQuery) {
      query = query.where(
        or(
          ilike(askimateUsers.email, `%${searchQuery}%`),
          ilike(askimateUsers.firstName, `%${searchQuery}%`),
          ilike(askimateUsers.lastName, `%${searchQuery}%`)
        )
      );
    }

    const [totalResult] = await db
      .select({ value: count() })
      .from(askimateUsers);

    const users = await query.orderBy(desc(askimateUsers.createdAt)).limit(limit).offset(offset);

    // Get usage and conversation counts for each user
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const [usageResult] = await db
          .select({ questionsUsed: askimateWeeklyUsage.questionsUsed })
          .from(askimateWeeklyUsage)
          .where(eq(askimateWeeklyUsage.userId, user.id))
          .orderBy(desc(askimateWeeklyUsage.week))
          .limit(1);

        const [conversationCount] = await db
          .select({ count: count() })
          .from(askimateConversations)
          .where(eq(askimateConversations.userId, user.id));

        const isTrialActive = user.plan === "premium" && user.trialEndsAt
          ? new Date(user.trialEndsAt) > new Date()
          : false;

        return {
          ...user,
          weeklyUsage: usageResult?.questionsUsed || 0,
          conversationCount: conversationCount?.count || 0,
          isTrialActive,
          trialStartedAt: user.trialStartedAt ? new Date(user.trialStartedAt) : null,
          trialEndsAt: user.trialEndsAt ? new Date(user.trialEndsAt) : null,
        };
      })
    );

    const total = totalResult?.value || 0;
    const totalPages = Math.ceil(total / limit);

    res.json({
      data: enrichedUsers,
      pagination: { page, limit, total, totalPages },
    });
  } catch (err) {
    console.error("AskiMate users fetch error:", err);
    res.status(500).json({ error: "Failed to fetch AskiMate users" });
  }
});

// GET /admin/askimate-users/:userId/conversations
router.get("/admin/askimate-users/:userId/conversations", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(String(req.params.userId), 10);
    if (!Number.isFinite(userId) || userId <= 0) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const conversations = await db
      .select({
        id: askimateConversations.id,
        title: askimateConversations.title,
        questionCount: askimateConversations.questionCount,
        createdAt: askimateConversations.createdAt,
        updatedAt: askimateConversations.updatedAt,
      })
      .from(askimateConversations)
      .where(eq(askimateConversations.userId, userId))
      .orderBy(desc(askimateConversations.updatedAt));

    res.json({ data: conversations });
  } catch (err) {
    console.error("Conversation fetch error:", err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// GET /admin/askimate-conversations/:conversationId/messages
router.get("/admin/askimate-conversations/:conversationId/messages", async (req: Request, res: Response) => {
  try {
    const conversationId = parseInt(String(req.params.conversationId), 10);
    if (!Number.isFinite(conversationId) || conversationId <= 0) {
      res.status(400).json({ error: "Invalid conversation ID" });
      return;
    }

    const messages = await db
      .select({
        id: askimateMessages.id,
        conversationId: askimateMessages.conversationId,
        sender: askimateMessages.sender,
        isUserMessage: askimateMessages.isUserMessage,
        content: askimateMessages.content,
        createdAt: askimateMessages.createdAt,
      })
      .from(askimateMessages)
      .where(eq(askimateMessages.conversationId, conversationId))
      .orderBy(askimateMessages.createdAt);

    res.json({ data: messages });
  } catch (err) {
    console.error("Messages fetch error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// POST /admin/askimate-conversations/:conversationId/mentor-reply
router.post("/admin/askimate-conversations/:conversationId/mentor-reply", async (req: Request, res: Response) => {
  try {
    const conversationId = parseInt(String(req.params.conversationId), 10);
    const { message } = req.body as { message: string };

    if (!Number.isFinite(conversationId) || conversationId <= 0) {
      res.status(400).json({ error: "Invalid conversation ID" });
      return;
    }

    if (!message || message.trim().length === 0) {
      res.status(400).json({ error: "Message cannot be empty" });
      return;
    }

    // Verify conversation exists
    const [conversation] = await db
      .select({ id: askimateConversations.id })
      .from(askimateConversations)
      .where(eq(askimateConversations.id, conversationId))
      .limit(1);

    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    // Insert mentor message
    const [inserted] = await db
      .insert(askimateMessages)
      .values({
        conversationId,
        content: message.trim(),
        isUserMessage: false,
        sender: "mentor",
      })
      .returning({
        id: askimateMessages.id,
        sender: askimateMessages.sender,
        content: askimateMessages.content,
        createdAt: askimateMessages.createdAt,
      });

    // Update conversation timestamp
    await db
      .update(askimateConversations)
      .set({ updatedAt: new Date() })
      .where(eq(askimateConversations.id, conversationId));

    res.json({ data: inserted });
  } catch (err) {
    console.error("Mentor reply error:", err);
    res.status(500).json({ error: "Failed to send mentor reply" });
  }
});

export default router;
