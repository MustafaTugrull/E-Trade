const mongoose = require("mongoose");
const express = require("express");
const app = express();
const cors = require("cors");
const { v4:uuidv4 } = require("uuid")
const jwt = require("jsonwebtoken");



app.use(cors());
app.use(express.json());

//console.log(uuidv4()) => uuidv4() metodu benzersiz bir id üretir.

const url ="mongodb+srv://mustafatugrul034:Bjk1903@mustafatugrul.dkpxb.mongodb.net/?retryWrites=true&w=majority&appName=mustafatugrul";
const port = 5000;

mongoose.connect(url).then(res => {
    console.log("Connection sucsess");
}).catch(err => {
    console.log(err.message);
})

//USER COLLECTION START
const userSchema = new mongoose.Schema({
    id : String,
    userName : String,
    email : String,
    password : String,
    isAdmin : Boolean
});

const User = mongoose.model("User",userSchema)
//USER COLLECTION END

//PRODUCT COLLECTION START
const productSchema = new mongoose.Schema({
    id : String,
    name : String,
    price : Number,
    stock : Number,
    categoryName : String
    // imageUrl : String
});
const Product = mongoose.model("Product",productSchema);
//PRODUCT COLLECTION END

//CART COLLECTION START
const cartSchema = new mongoose.Schema({
    id : String,
    productId : String,
    userId : String
});
const Cart = mongoose.model("Cart",cartSchema);
//CART COLLECTION END

//ORDER COLLECTION START
const orderSchema = new mongoose.Schema({
    id : String,
    products : Array,
    userId : String
});
const Order = mongoose.model("Order",orderSchema);
//ORDER COLLECTION END

//TOKEN START
const secretKey = "Gizli anahtar Anahtar gizli";
const option = {
    expiresIn : "1h"
};
//TOKEN END


//USER REGISTER
//https://localhost:5000/auth/register
app.post("/auth/register",async (req,res)=>{
    try{
        const {userName,email, password} = req.body;
        let user = new User({
            id:uuidv4(),
            userName : userName,
            email : email,
            password : password,
            isAdmin : false
        });

        await user.save();
        const payload = {
            user : user
        }
        const token = jwt.sign(payload,secretKey,option);
        res.json({user : user, token:token});
    }catch(error){
        res.status(500).json({error : error.message})
    }
});

//USER LOGIN
app.post("/auth/login",async(req,res)=> {
    try {
        const {email, password} = req.body;
        const users = await User.find({email:email,password:password});
        if(users.length === 0){
            res.status(500).json({message : "Username or pasword not found"});
        }else{
            const payload = {
                user : users[0]
            }
            const token = jwt.sign(payload,secretKey,option);
            res.json({user:users[0],token:token})
        }
    } catch (error) {
        res.status(500).json({error : error.message})
    }
})


//PRODUCT LİST START
//https://localhost:5000/products
app.get("/products",async (req,res)=>{
    try {
        const products = await Product.find({});
        res.json(products);    
    } catch (error) {
        res.status(500).json({message : error.message})
    }
})
//PRODUCT LİST END


//PRODUCT ADD START
//https://localhost:5000/product/add
app.post("/products/add",async (req,res)=>{
    try{
        const {name, price, stock, categoryName} = req.body;
        const product = new Product({
            id:uuidv4(),
            name : name,
            price : price,
            stock : stock,
            categoryName : categoryName
        });

        await product.save();
        res.json({message : "Product added successfully..."});
    }catch(error){
        res.status(500).json({message : error.message})
    }
});
//PRODUCT ADD END

//PRODUCT DELETE START
//https://localhost:5000/product/remove
app.post("/products/remove",async (req,res)=>{
    try{
        const {id} = req.body;
        await Product.findByIdAndDelete(id);
        res.json({message : "Product deleted successfully..."});
    }catch(error){
        res.status(500).json({message : error.message})
    }
});
//PRODUCT DELETE END

//CART ADD
app.post("/cart/add",async (req,res) =>{
    try {
        const {product, user} = req.body;
        const cart = new Cart({
            id:uuidv4(),
            productId : product._id,
            userId : user._id
        });

        await cart.save();

        // const selectedProduct = await Product.findById(product._id);
        product.stock -= 1;
        await Product.findByIdAndUpdate(product._id, product);

        res.json({message : "The product has been successfully added to the cart."});
    } catch (error) {
        res.status(500).json({message : error.message})
    }
})



app.listen(port,() => {
    console.log("ETrade http://localhost:" + port + " üzerinden yayında.")
})