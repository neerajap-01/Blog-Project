const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId; //creating objectId type 

const blogSchema = new mongoose.Schema({ //creating schema for blog model 
  title: { 
    type: String, //type of data in the field should be string
    required: true, //title is required field
  },
  body: {
    type: String,
    required: true,
  },
  authorId: {
    type: ObjectId, //type of data in the field should be objectId type
    ref: 'Author', //ref is used to specify the model name to which the field is referring
    required: true 
  },
  tags: [String], //tags is an array of string type
  category: {
    type: [String],
    required: true,
  },
  subcategory: {
    type: [String],
  },
  deletedAt: {
    type: String,
  },
  isDeleted: {
    type: Boolean, //type of data in the field should be boolean
    default: false, //isDeleted is a default field with value false
  },
  publishedAt: {
    type: String,
  },
  isPublished: {
    type: Boolean,
    default: false,
  }
},{timestamps:true}) //timestamps is used to add createdAt and updatedAt fields in the schema

module.exports=mongoose.model('Blog',blogSchema) //exporting the schema to use in other files