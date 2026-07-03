const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is required for creating a user"],
        trim:true,
        lowercase:true,
        match:[/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email address'],
        unique:[true,"Email already exists"]
    },
    name: {
        type: String,
        required:[true,"Name is required for creating an account"]
    },
    password:{
        type:String,
        required:[true,"Password is required for creating an account"],
        minLength:[6,"Password must be at least 6 characters long"],
        select:false
    },
    systemUser:{
        type:Boolean,
        default: false,
        immutable:true,
        select:false
    }
},{
        timestamps:true
    });

    //save password into hash
    userSchema.pre("save",async function(next){
        if(!this.isModified("password")){
            return next();
        }

        const hash=await bcrypt.hash(this.password,10);
        this.password=hash;

        return 
    })

    //compare hashpassword and actual password.
    userSchema.methods.comparePassword=async function(password){
        return await bcrypt.compare(password,this.password);
    }

    const userModel= mongoose.model("User",userSchema);

    module.exports=userModel;