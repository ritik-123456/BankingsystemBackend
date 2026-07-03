require('dotenv').config();
const mongoose = require('mongoose');
const userModel = require('./src/models/user.model');
const accountModel = require('./src/models/account.model');
const ledgerModel = require('./src/models/ledger.model');
const transactionModel = require('./src/models/transaction.model');

async function seed() {
  console.log("Connecting to database...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to database successfully.");

  const email = "system@bank.com";
  const name = "System Faucet Bank";
  const password = "systempassword123";

  // Check if system user exists
  let systemUser = await userModel.findOne({ email }).select("+systemUser");

  if (!systemUser) {
    console.log(`Creating system user: ${email}...`);
    systemUser = await userModel.create({
      email,
      name,
      password,
      systemUser: true
    });
    console.log("System user created successfully.");
  } else {
    console.log("System user already exists.");
  }

  // Ensure system user has an account
  let systemAccount = await accountModel.findOne({ user: systemUser._id });

  if (!systemAccount) {
    console.log("Creating bank account for system user...");
    systemAccount = await accountModel.create({
      user: systemUser._id,
      status: "ACTIVE",
      currency: "INR"
    });
    console.log("System bank account created successfully.");

    // Create an initial massive deposit in the system account ledger so its balance doesn't matter
    // (Though createInitialFunds does not verify system balance, it is good to have balance or record the faucet source)
    const seedTransaction = await transactionModel.create({
      fromAccount: systemAccount._id,
      toAccount: systemAccount._id,
      amount: 100000000,
      status: "COMPLETED",
      idempotencyKey: `system-seed-init-${Date.now()}`
    });

    await ledgerModel.create({
      account: systemAccount._id,
      amount: 100000000,
      transaction: seedTransaction._id,
      type: "CREDIT"
    });

    console.log("Funded system bank account with ledger credits.");
  } else {
    console.log("System bank account already exists.");
  }

  console.log("\n--- SEED COMPLETE ---");
  console.log(`System Email: ${email}`);
  console.log(`System Password: ${password}`);
  console.log(`System Account ID: ${systemAccount._id}`);
  console.log("----------------------");

  await mongoose.disconnect();
  console.log("Disconnected from database.");
}

seed().catch(err => {
  console.error("Seeding error:", err);
  process.exit(1);
});
