const express = require('express');
var bodyParser = require('body-parser');
const mongoose=require('mongoose')
const route = require('./routes/route.js');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
})
.then(() => { console.log('Connected to MongoDB') })
.catch(err => { console.log('Error connecting to MongoDB: ' + err) });

app.use('/', route);

app.get('/health', (req, res) => res.status(200).send({ status: true, msg: 'Server is running' }))

app.listen(process.env.PORT || 3000, function() {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});
