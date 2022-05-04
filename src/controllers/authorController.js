const Author = require('../model/authorModel');
const validateEmail = require('email-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//Add author Router handler
const addAuthor = async (req, res) => {
  try { 
    let {...data} = req.body; //getting the data from req.body in a spread operator
    //Below is the validation for the data
    if (Object.keys(data).length == 0) return res.status(400).send({ status: false, msg: "Data is required to add a Author" });

    //Below is the validation for the data for email, password, name
    if(!data.fname) return res.status(400).send({ status: false, msg: "First Name is required" });
    if(!data.lname) return res.status(400).send({ status: false, msg: "Last Name is required" });
    if(!data.title) return res.status(400).send({ status: false, msg: "Title is required" });
    if(!data.email) return res.status(400).send({ status: false, msg: "Email is required" });
    if(!data.password) return res.status(400).send({ status: false, msg: "Password is required" });

    data.password = await bcrypt.hash(data.password, 10); 
    
    let validString = /\d/; //validating the string for numbers

    //checking if the firstName and lastName are valid string
    if(validString.test(data.fname)) return res.status(400).send({ status: false, msg: "Enter a valid First Name" });
    if(validString.test(data.lname)) return res.status(400).send({ status: false, msg: "Enter a valid Last Name" });

    let validTitle = ['Mr', 'Mrs', 'Miss']; //validating the title

    //checking if the title is valid
    if(!validTitle.includes(data.title)) return res.status(400).send({ status: false, msg: "Title should be one of Mr, Mrs, Miss" });

    //checking if the email is valid by using email-validator package
    if(!validateEmail.validate(data.email)) return res.status(400).send({ status: false, msg: "Enter a valid email" })
    
    //checking if the email is already exist
    let uniqueEmail = await Author.findOne({ email: data.email });
    if(uniqueEmail) return res.status(400).send({ status: false, msg: "Email already exist" })

    let showAuthorData = await Author.create(data);
    res.status(201).send({ status: true, data: showAuthorData });
  } catch(err) {
    res.status(500).send({ status: false, msg: err.message });
  }
}

//Login author Router handler
const loginAuthor = async (req, res) => {
  try {
    let {...data} = req.body;//getting the data from req.body in a spread operator.

    //Below is the validation for the data
    if(Object.keys(data).length == 0) return res.status(400).send({ status: false, msg: "Email and password is required to login" });

    if(!data.email) return res.status(400).send({ status: false, msg: "Email is required" });
    if(!data.password) return res.status(400).send({ status: false, msg: "Password is required" });

    //checking if the email is valid by using email-validator package
    if(!validateEmail.validate(data.email)) return res.status(400).send({ status: false, msg: "Enter a valid email" })

    //checking if the email is already exist
    let getAuthorData = await Author.findOne({ email: data.email });
    if(!getAuthorData) return res.status(401).send({ status: false, msg: "Email is incorrect" });

    let checkPassword = await bcrypt.compare(data.password, getAuthorData.password)
    if(!checkPassword) return res.status(401).send({ status: false, msg: "Password is incorrect" });

    //generating the token for logged in author
    let token = jwt.sign({authorId: getAuthorData._id}, "Blog Project-1", {expiresIn: '1d'});

    //sending the token to the client in response in the header
    res.setHeader("x-api-key", token);
    res.status(200).send({ status: true, msg: "Logged in successfully", token: token });
  }catch(err) {
    res.status(500).send({ status: false, error: err.message });
  }
}

module.exports = {addAuthor,loginAuthor}; //exporting the router handlers
