const accountModel=require('../models/account.model');

async function createAccountController(req,res){
    const user= req.user;
    const { currency, status } = req.body;

    const account=await accountModel.create({
        user:user._id,
        currency: currency || "INR",
        status: status || "ACTIVE"
    })

    res.status(201).json({
        account
    })
}

async function getUserAccountController(req,res){
    const account=await accountModel.find({
        user:req.user._id
    })

    res.status(200).json({
        account
    })
}

async function getBalanceController(req,res){
    const accountId=req.params.accountId;
    
    const account=await accountModel.findOne({
        _id:accountId,
        user:req.user._id
    })

    if(!account){
        return res.status(404).json({
            message:"Account not found"
        })
    }

    const balance=await account.getBalance();

    res.status(200).json({
        balance:balance,
        account:account
    })
}

module.exports={createAccountController,getUserAccountController,getBalanceController};