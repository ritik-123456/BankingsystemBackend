const {Router}=require('express');
const authMiddleware=require('../middleware/auth.middleware');
const transactionController=require('../controller/transaction.controller');

const transactionRoutes=Router();

//create new transaction..
transactionRoutes.post("/",authMiddleware.authMiddleware,transactionController.createTransaction);

//get user transactions history
transactionRoutes.get("/",authMiddleware.authMiddleware,transactionController.getUserTransactions);

//create initial funds transaction from system user
transactionRoutes.post("/system/initial-funds",authMiddleware.authMiddleware,transactionController.createInitialFunds);

module.exports=transactionRoutes;