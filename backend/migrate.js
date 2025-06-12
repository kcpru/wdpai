import fs from "node:fs";
import { Pool } from "pg";
const sql = fs.readFileSync("./schema.sql", "utf8");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
await pool.query(sql);
console.log("✓ schema applied");
process.exit(0);
