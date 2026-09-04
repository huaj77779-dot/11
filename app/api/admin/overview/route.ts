import { sql } from "drizzle-orm";
import { customers, fabrics, inquiries, newsArticles, orders, users } from "../../../../db/schema";
import { requireAdmin } from "../../../lib/admin";

export async function GET(request: Request) {
  const guard = await requireAdmin(request);
  if (guard.error) return guard.error;
  const db = guard.db;
  const count = async (table: typeof customers | typeof orders | typeof inquiries | typeof fabrics | typeof newsArticles | typeof users) => {
    const [row] = await db.select({ value: sql<number>`COUNT(*)` }).from(table);
    return Number(row?.value ?? 0);
  };
  const [customerCount, orderCount, inquiryCount, fabricCount, articleCount, staffCount] = await Promise.all([
    count(customers), count(orders), count(inquiries), count(fabrics), count(newsArticles), count(users),
  ]);
  const [sales] = await db.select({ value: sql<number>`COALESCE(SUM(total_price), 0)` }).from(orders);
  const [newLeads] = await db.select({ value: sql<number>`COUNT(*)` }).from(inquiries).where(sql`status = 'new'`);
  const [pendingOrders] = await db.select({ value: sql<number>`COUNT(*)` }).from(orders).where(sql`status NOT IN ('completed','cancelled')`);
  return Response.json({
    stats: { customerCount, orderCount, inquiryCount, fabricCount, articleCount, staffCount, sales: Number(sales?.value ?? 0), newLeads: Number(newLeads?.value ?? 0), pendingOrders: Number(pendingOrders?.value ?? 0) },
  });
}

