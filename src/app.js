const express=require('express');
const cookieParser=require('cookie-parser');

const authRouter=require('../src/routes/auth.routes');
const accountRouter=require('../src/routes/account.routes');
const transactionRouter=require('../src/routes/transaction.routes')

const app=express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth",authRouter);
app.use("/api/accounts",accountRouter);
app.use("/api/transaction",transactionRouter);


module.exports=app; 