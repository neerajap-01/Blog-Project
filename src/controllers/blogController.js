const mongoose = require('mongoose')
const Blog = require('../model/blogModel');
const Author = require('../model/authorModel');

//Below function is to check whether the given string is a valid ObjectId or not
const isValidObjectId = (ObjectId) => {
  return mongoose.Types.ObjectId.isValid(ObjectId);
};

let validString = /\d/;//validating the string for numbers

const createBlog = async (req, res) => {
  try {
    let {...data} = req.body; //destructuring the data from the request body

    //validating the data for empty values
    if (Object.keys(data).length == 0) return res.status(400).send({ status: false, msg: "Data is required to create a Blog" });

    //checking that the below data is present or not
    if(!data.title) return res.status(400).send({ status: false, msg: "Title of book is required" });
    if(!data.body) return res.status(400).send({ status: false, msg: "Description of book is required" });
    if(!data.authorId) return res.status(400).send({ status: false, msg: "Author ID is required" });
    if(!data.category) return res.status(400).send({ status: false, msg: "Category of book is required" });
    
    //validating the data for numbers in the body
    if(validString.test(data.body) || validString.test(data.tags) || validString.test(data.category) || validString.test(data.subcategory)) return res.status(400).send({ status: false, msg: "Data must not contains numbers"});

    //validating if the author's ObjectId is valid or not
    if(!isValidObjectId(data.authorId)) return res.status(404).send({ status: false, msg: "Enter a valid author Id" });
    let getAuthorData = await Author.findById(data.authorId);
    if(!getAuthorData) return res.status(404).send({ status: false, msg: "No such author exist" });

    if(data.isPublished){
      let timeStamps = new Date();
      data.publishedAt = timeStamps;
    }

    let showBlogData = await Blog.create(data);
    res.status(201).send({ status: true, data: showBlogData });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

const getBlogs = async (req, res) => {
  try {
    let {...data} = req.query //destructuring the data from the request body

    //Below if statement is to check whether the authorId is present or not in the request query
    if(data.hasOwnProperty('authorId')){
      let {...tempData} = data;
      delete(tempData.authorId); //deleting the authorId from the data
      let getValues = Object.values(tempData) //getting the values from the data object

      //validating the getValues to check whether it contains numbers or not
      if(validString.test(getValues)) return res.status(400).send({ status: false, msg: "Data should not contain numbers" })
    }else{
      let getValues = Object.values(data) //getting the values from the data object

      //validating the getValues to check whether it contains numbers or not
      if(validString.test(getValues)) return res.status(400).send({ status: false, msg: "Data should not contain numbers" })
    }

    //validating the data for empty values in the request query
    if(Object.keys(data).length == 0){

      //below code is to get all the blogs from the database that are not deleted and are published
      let getAllBlogs = await Blog.find({ isDeleted: false, isPublished: true }).populate('authorId');

      //check that the getAllBlogs is empty or not
      if(getAllBlogs.length == 0) return res.status(404).send({ status: false, msg: "No such blog exist" });
      return res.status(200).send({ status: true, data: getAllBlogs })
    }

    data.isDeleted= false;
    data.isPublished= true;
    //below code is to get all the blogs from the database that are not deleted and are published based on the certain criteria
    let getBlogs = await Blog.find( data ).populate('authorId');

    //check that the getBlogs is empty or not
    if(getBlogs.length == 0) return res.status(404).send({ status: false, msg: "No such blog exist" });
    res.status(200).send({ status: true, data: getBlogs })
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

const updateBlog = async (req, res) => {
  try{
    let getBlogId = req.params.blogId; //getting the blogId from the request params

    //validating the blogId to check whether it is valid or not
    if(!isValidObjectId(getBlogId)) return res.status(404).send({ status: false, msg: "Enter a valid blog Id" })

    let findBlogId = await Blog.findById(getBlogId);//finding the blogId in the database to check whether it is valid or not
    if(!findBlogId) return res.status(404).send({ status: false, msg: "No such blog exist" });

    //Verify that the document is deleted or not
    if(findBlogId.isDeleted) return res.status(404).send({ status: false, msg: "No such blog found or has already been deleted" });

    let {...data} = req.body; //destructuring the data from the request body
    
    //validating the data for empty values
    if(Object.keys(data).length == 0) return res.status(400).send({ status: false, msg: "Data is required to update a Blog" });

    //checking that the below data has the attributes provided inside hasOwnProperty()
    if(data.hasOwnProperty('isDeleted') || data.hasOwnProperty('authorId') || data.hasOwnProperty('deletedAt') || data.hasOwnProperty('publishedAt')) return res.status(403).send({ status: false, msg: "Action is Forbidden" });

    //checking that the below data has the attributes provided inside hasOwnProperty()
    if(data.hasOwnProperty('title')){
      let {...tempData} = data;
      delete(tempData.title); //deleting the title from the data
      let getValues = Object.values(tempData) //getting the values from the data object
      if(validString.test(getValues)) return res.status(400).send({ status: false, msg: "Data should not contain numbers" })
    }else{
      let getValues = Object.values(data) //getting the values from the data object
      if(validString.test(getValues)) return res.status(400).send({ status: false, msg: "Data should not contain numbers" })
    }
    //Updating the blog data in the database based on the blogId and the data provided in the request body
    let updatedBlog = await Blog.findByIdAndUpdate(
      {_id: getBlogId},
      {
        $push:  {tags: data.tags, category: data.category, subcategory: data.subcategory} ,
        title: data.title,
        body: data.body,
        isPublished: data.isPublished,
      },
      {new: true}
    )

    if((!findBlogId.isPublished) && updatedBlog.isPublished){ 
      let timeStamps = new Date(); //getting the current timeStamps
      let updateData = await Blog.findOneAndUpdate(
        {_id: getBlogId}, //finding the blogId in the database to update the publishedAt
        {publishedAt: timeStamps}, //updating the publishedAt
        {new: true} //returning the updated data
      )
      return res.status(200).send({ status: true, data: updateData });
    } 

    res.status(200).send({ status: true, data: updatedBlog });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

const deleteBlogById = async (req, res)=> {
  try {
   let blogId = req.params.blogId; //getting the blogId from the request params
  
    //validating the blogId to check whether it is valid or not
    if(!isValidObjectId(blogId)) return res.status(404).send({ status: false, msg: "Enter a valid blog Id" });

    let data = await Blog.findById(blogId); //finding the blogId in the database to check whether it is valid or not
    if (!data)  return res.status(404).send({ status: false, msg: "No such blog found" });

    //Verify that the document is deleted or not
    if (data.isDeleted) return res.status(404).send({ status: false, msg: "No such blog found or has already been deleted" });

    let timeStamps = new Date(); //getting the current timeStamps

    //updating the isDeleted to true, isPublished to false and deletedAt to the current timeStamps
    await Blog.findOneAndUpdate({_id:blogId},{isDeleted:true, isPublished: false, deletedAt: timeStamps})
    res.status(200).send({status:true,msg:"Blog is deleted successfully"})
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

const deleteBlogs = async (req, res) =>{
  try{
    let {...data} = req.query; //destructuring the data from the request query
    let decodedToken = req.decodedToken;   

    //validating the data for empty values
    if(Object.keys(data).length == 0) return res.send({ status: false, msg: "Error!, Details are needed to delete a blog" });

    if(data.hasOwnProperty('authorId')){ //checking that the authorId is present or not
      if(!isValidObjectId(data.authorId)) return res.status(400).send({ status: false, msg: "Enter a valid author Id" });
      if(decodedToken.authorId !== data.authorId) return res.status(403).send({ status: false, msg: "Action Forbidden" })
      let {...tempData} = data;
      delete(tempData.authorId); //deleting the authorId from the data
      let getValues = Object.values(tempData) //getting the values from the data object

      //validating that the getValues contains numbers or not
      if(validString.test(getValues)) return res.status(400).send({ status: false, msg: "Data should not contain numbers" })
    }else{
      let getValues = Object.values(data) //getting the values from the data object

      //validating that the getValues contains numbers or not
      if(validString.test(getValues)) return res.status(400).send({ status: false, msg: "Data should not contain numbers" })
    }

    let timeStamps = new Date(); //getting the current timeStamps
    
    let getBlogData = await Blog.find({ authorId: decodedToken.authorId , data });

    //if any blog document doesn't match with  query data
    if (getBlogData.length == 0) {
      return res.status(404).send({ status: false, msg: "No blog found" });
    }

    const getNotDeletedBlog = getBlogData.filter(item => item.isDeleted === false);

    if (getNotDeletedBlog.length == 0) {
      return res.status(404).send({ status: false, msg: "The Blog is already deleted" });
    }

    data.authorId = decodedToken.authorId;
    let deletedBlogs = await Blog.updateMany(
      data, 
      {isDeleted: true, isPublished: false, deletedAt: timeStamps},
    );

    res.status(200).send({ status: true, msg: `${deletedBlogs.modifiedCount} blogs has been deleted` });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

module.exports = {createBlog, getBlogs, updateBlog, deleteBlogById, deleteBlogs}; //exporting the functions