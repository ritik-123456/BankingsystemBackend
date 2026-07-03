require('dotenv').config();
const mongoose = require('mongoose');
const userModel = require('./src/models/user.model');
const accountModel = require('./src/models/account.model');
const ledgerModel = require('./src/models/ledger.model');
const transactionModel = require('./src/models/transaction.model');

async function inspect() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB.\n");

  const users = await userModel.find();
  console.log("=== USERS ===");
  for (const u of users) {
    console.log(`- ${u.name} (${u.email}) ID: ${u._id}`);
  }

  const accounts = await accountModel.find();
  console.log("\n=== ACCOUNTS ===");
  for (const a of accounts) {
    const bal = await a.getBalance();
    console.log(`- Account ID: ${a._id} | User: ${a.user} | Balance: ${bal} | Status: ${a.status}`);
  }

  const transactions = await transactionModel.find();
  console.log("\n=== TRANSACTIONS ===");
  for (const t of transactions) {
    console.log(`- Tx ID: ${t._id} | From: ${t.fromAccount} | To: ${t.toAccount} | Amount: ${t.amount} | Status: ${t.status}`);
  }

  const ledgers = await ledgerModel.find();
  console.log("\n=== LEDGERS ===");
  for (const l of ledgers) {
    console.log(`- Ledger ID: ${l._id} | Account: ${l.account} | Amount: ${l.amount} | Type: ${l.type} | Tx: ${l.transaction}`);
  }

  await mongoose.disconnect();
}

inspect().catch(console.error);
