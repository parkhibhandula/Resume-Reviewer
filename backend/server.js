const app = require('./src/app');

const port = process.env.PORT || 3000;
app.listen(port,(err)=>{
    if(err) console.log("Error connecting to server");
})