
require('dotenv').config();
const express = require("express");
const app = express();
const PORT = 4000;
const cors = require("cors");
const bodyParser = require("body-parser");
const User = require('./model/User');
const  {registerSchema, loginSchema} = require('./utils/cheking');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {verifyLogin} = require('./middleware/auth');
const Blog = require('./model/Blog');
const Product = require('./model/Product');
const Category = require('./model/Categories');
const Tag = require('./model/Tag');
const ProductTag = require('./model/ProductTag');
const Order = require('./model/Order');
const OrderLine = require('./model/OrderLine');



app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("MongoDB connected successfully");
}).catch(err => {
  console.error("MongoDB connection error", err);
});


app.get("/", (req, res) => {
    res.send("this is the home page");
});

app.post("/register", async (req, res) => {
    try{
        const {error, value} = registerSchema.validate(req.body);
        if(error){
            return res.status(400).json({message: error.details[0].message});
        }
        const { name, email, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const addNewUser = new User({
            name,
            email,
            password: hashedPassword
        });
        if(!name || !email || !password){
            return res.status(400).json({message: "All fields are required"});
        }
        const existingUser = await User.findOne({email, name});
        if(existingUser){
            return res.status(400).json({message: "User already exists"});
        }
        const savedUser = await addNewUser.save();
        res.status(200).json({message: "User added successfully", savedUser});
    }catch(err){
        res.status(500).json({message: "Something went wrong"});
    }
})

app.post("/login", async (req, res) => {
    try{
        const {error, value} = loginSchema.validate(req.body);
        if(error){
            return res.status(400).json({message: error.details[0].message});
        }
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({message: "All fields are required"});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "User not found"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: "Invalid password"});
        }
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });

        await user.save();
        const {password:PasswordRemoved, ...others} = user._doc;
        res.status(200).json({message: "User logged in successfully", data: others, token});
    }catch(err){
        res.status(500).json({message: "Something went wrong"});
    }
})

app.get("/profile",verifyLogin, async (req, res) => {
    try{
        const user = await User.findById(req.userId);

        if(!user){
            return res.status(400).json({message: "User not found"});
        }
        const {password:PasswordRemoved, ...others} = user._doc;
        res.status(200).json({message: "User fetched successfully", data: others});
    }catch(err){
        res.status(500).json({message: "Something went wrong"});
    }
})


app.get("/blog", async (req, res) => {
    try{
        const blog = await Blog.find();
        res.status(200).json({message: "Blog fetched successfully", data: blog});
    }catch(err){
        res.status(500).json({message: "Something went wrong"});
    }
});

app.post("/blog", async (req, res) => {
    try{
        const {title, description, author} = req.body;
        if(!title || !description || !author){
            return res.status(400).json({message: "All fields are required"});
        }
        const exisTingBlog = await Blog.findOne({title});
        if(exisTingBlog){
            return res.status(400).json({message: "Blog already exists"});
        }
        const addNewBlog = new Blog(req.body);
        const saveBlog = await addNewBlog.save();
        res.status(200).json({message: "Blog added successfully", saveBlog});
    }catch(err){
        res.status(500).json({message: "Something went wrong"});
    }
})

app.post("/create-Category", async (req, res) => {
    try{
        const {name} = req.body;
        if(!name){
            return res.status(400).json({message: "All fields are required"});
        }
        const exisTingCategory = await Category.findOne({name});
        if(exisTingCategory){
            return res.status(400).json({message: "Category already exists"});
        }
        const addNewCategory = new Category(req.body);
        const saveCategory = await addNewCategory.save();
        res.status(200).json({message: "Category added successfully", saveCategory});
    }catch(err){
        res.status(500).json({message: "Something went wrong"});
    }
})

app.get("/category", async (req, res) => {
    try{
        const category = await Category.find();
        res.status(200).json({message: "Category fetched successfully", data: category});
    }catch(err){
        res.status(500).json({message: "Something went wrong"});
    }
})

app.post("/product", async (req, res) => {
    try{
        const {title, description, price, image ,category:category, tags} = req.body;
        if(!title || !description || !price || !category  || !image){
            return res.status(400).json({message: "All fields are required"});
        }
        const exisTingProduct = await Product.findOne({title});
        if(exisTingProduct){
            return res.status(400).json({message: "Product already exists"});
        }
        const createProduct = new Product(req.body);
        const saveProduct = await createProduct.save();
        res.status(200).json({message: "Product added successfully", saveProduct});
    }catch(err){
        res.status(500).json({message: "Something went wrong"});
    }
})



app.get("/product", async (req, res) => {
    try{
        const product = await Product.find({
            $or: [
                {title: {$regex: req.query.search, $options: "i"}},
                {description: {$regex: req.query.search, $options: "i"}}
            ]
        }).populate("category").populate("tags");
        res.status(200).json({message: "Product fetched successfully", data: product});
    }catch(err){
        res.status(500).json({message: "Something went wrong"});
    }
})

app.get("/product/:id", async (req, res) => {
    try{
        const product = await Product.findById(req.params.id).populate("category").populate("tags");
        if(!product){
            return res.status(400).json({message: "Product not found"});
        }
        res.status(200).json({message: "Product fetched successfully", data: product});
    }catch(err){
        res.status(500).json({message: "Something went wrong"});
    }
})

app.put("/product/:id", async (req, res) => {
    try{
        const {title, description, price, category:category, tags} = req.body;
        if(!title || !description || !price || !category || !tags){
            return res.status(400).json({message: "All fields are required"});
        }
        const product = await Product.findById(req.params.id);
        if(!product){
            return res.status(400).json({message: "Product not found"});
        }
        const updateProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {new: true});
        res.status(200).json({message: "Product updated successfully", data: updateProduct});
    }catch(err){
        res.status(500).json({message: "Something went wrong"});
    }
})

app.delete("/product/:id", async (req, res) => {
    try{
        const product = await Product.findById(req.params.id);
        if(!product){
            return res.status(400).json({message: "Product not found"});
        }
        const deleteProduct = await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({message: "Product deleted successfully", data: deleteProduct});
    }catch(err){
        res.status(500).json({message: "Something went wrong"});
    }
})

app.get("/Tag", async (req, res) => {
    try{
        const tag = await Tag.find();
        res.status(200).json({message: "Tag fetched successfully", data: tag});
    }catch(err){
        res.status(500).json({message: "Something went wrong"});
    }
})

app.post("/Tag", async (req, res) => {
    try{
        const {name} = req.body;
        if(!name){
            return res.status(400).json({message: "All fields are required"});
        }
        const exisTingTag = await Tag.findOne({name});
        if(exisTingTag){
            return res.status(400).json({message: "Tag already exists"});
        }
        const addNewTag = new Tag(req.body);
        const saveTag = await addNewTag.save();
        res.status(200).json({message: "Tag added successfully", saveTag});
    }catch(err){
        res.status(500).json({message: "Something went wrong"});
    }
})

app.put("/Tag/:id", async (req, res) => {
    try{
        const {name} = req.body;
        if(!name){
            return res.status(400).json({message: "All fields are required"});
        }
        const tag = await Tag.findById(req.params.id);
        if(!tag){
            return res.status(400).json({message: "Tag not found"});
        }
        const updateTag = await Tag.findByIdAndUpdate(req.params.id, req.body, {new: true});
        res.status(200).json({message: "Tag updated successfully", data: updateTag});
    }catch(err){
        res.status(500).json({message: "Something went wrong"});
    }
})

app.delete("/Tag/:id", async (req, res) => {
    try{
        const tag = await Tag.findById(req.params.id);
        if(!tag){
            return res.status(400).json({message: "Tag not found"});
        }
        const deleteTag = await Tag.findByIdAndDelete(req.params.id);
        res.status(200).json({message: "Tag deleted successfully", data: deleteTag});
    }catch(err){
        res.status(500).json({message: "Something went wrong"});
    }
})


app.post("/add-New-Order", async (req, res) => {
    try{
        const userId = req.body.User;
        const productsBodyData = req.body.products;
        var totalPrice = 0;
        productsBodyData.forEach((el) => {
            totalPrice += el.price * el.quantity;
          });
          const newOrder = new Order({
            code: Math.floor(100000 + Math.random() * 900000),
            totalPrice: totalPrice,
            user: userId,
          });
          const savedOrder = await newOrder.save();
          const newOrderLine = new OrderLine({
            quantity: el.quantity,
            order: savedOrder._id,
            product: el.idProduit,
          });
          await newOrderLine.save();

    
        console.log(totalPrice);
          res.status(200).json({message: "Order added successfully", totalPrice});
    }catch(err){
        res.status(500).json({message: "Something went wrong"});
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
