const mongoose=require('mongoose')

const authorSchema =new mongoose.Schema({ //creating schema for author model 
    fname:{
        type:String, //type of data in the field should be string
        required:true //firstName is required field
    },
    lname:{
        type:String,
        required:true  
    },
    title: {
        type: String,
        required: true,
        enum: ['Mr', 'Mrs', 'Miss'] //enum is used to restrict the values of the field to be only one of the given values
    },
    email:{
        type:String,
        required:true,
        unique:true //email is unique field
    },
    password: {
        type: String,
        required: true
    },
    tempPassword: {
        type: String,
    },
},{timestamps:true}); //timestamps is used to add createdAt and updatedAt fields in the schema 

module.exports = mongoose.model('Author',authorSchema); //exporting the schema to use in other files  
