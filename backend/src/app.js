const express = require('express');
const app = express();
const airoute = require('./routes/airoute');
const cors = require('cors');

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

app.get('/',(req,res)=>{
    res.send("Hello");
})

app.use('/ai',airoute);
module.exports = app;
