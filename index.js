const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json())


app.listen(3000,() => {
    console.log('App is connected to port 3000!')
})

app.get('/',(req,res) => {
    res.json({message:'Welcome to Nirmameets!'})
})

