const { Client } = require('pg');

// Your original string
const connectionString = "postgresql://postgres.mfdwlcwexserzdzjhkgj:FQ%2CbNLVFAX6Ej%24%26@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=30";

const client = new Client({
  connectionString: connectionString,
});

async function testConnection() {
  console.log("🚀 Testing database connection...");
  try {
    await client.connect();
    console.log("✅ SUCCESS: Connected to the database!");
    const res = await client.query('SELECT NOW()');
    console.log("🕒 Server time:", res.rows[0].now);
    await client.end();
  } catch (err) {
    console.error("❌ CONNECTION FAILED:");
    console.error(err.message);
    
    if (err.message.includes('password authentication failed')) {
      console.log("\n💡 TIP: Check if your password is correct or if special characters need encoding.");
    } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
      console.log("\n💡 TIP: This looks like a network issue. Check your firewall or try the Supabase Pooler (Port 6543).");
    }
  }
}

testConnection();