const express = require('express');
const {addAuthor,loginAuthor} = require('../controllers/authorController'); //importing authorController
const {createBlog, getBlogs, updateBlog, deleteBlogById, deleteBlogs} = require('../controllers/blogController'); //importing blogController
const {authentication,authorization} = require('../middleware/auth'); //importing auth middleware

const router = express.Router();

router.post('/authors', addAuthor); //adding author route with post method and calling addAuthor function from authorController
router.post('/login', loginAuthor); //adding login route with post method and calling loginAuthor function from authorController

//adding blog route with post method and calling 2 middlewares to check authentication and authorization and calling the respective functions from blogController.
router.post('/blogs', authentication, authorization, createBlog); 
router.get('/blogs', authentication, getBlogs);
router.put('/blogs/:blogId', authentication, authorization, updateBlog);
router.delete('/blogs/:blogId', authentication, authorization, deleteBlogById);
router.delete('/blogs', authentication, deleteBlogs);

module.exports = router;