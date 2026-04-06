import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const DB_PASSWORD = 'aAbkX2NN!M-nwd8';
const DB_HOST = 'db.nhzxaduqutvsrpjecuah.supabase.co';
const SCHEMA_PATH = path.join(__dirname, '..', 'supabase', 'FULL_SCHEMA.sql');

async function sync() {
  console.log('🚀 Starting Supabase Database Sync...');
  
  const client = new Client({
    host: DB_HOST,
    port: 5432,
    user: 'postgres',
    password: DB_PASSWORD,
    database: 'postgres',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log(`📡 Connecting to ${DB_HOST}...`);
    await client.connect();
    console.log('✅ Connected to Database.');

    console.log(`📄 Reading schema from ${SCHEMA_PATH}...`);
    const sql = readFileSync(SCHEMA_PATH, 'utf8');

    console.log('⚙️ Executing SQL Schema...');
    // Split by common SQL delimiters if needed, but pg client can handle multiple statements if they are separated by ;
    await client.query(sql);
    
    console.log('🎉 Database Schema Synchronized Successfully!');
  } catch (err) {
    console.error('❌ Sync Failed:', err.message);
    if (err.detail) console.error('Detail:', err.detail);
    if (err.hint) console.error('Hint:', err.hint);
    process.exit(1);
  } finally {
    await client.end();
  }
}

sync();
