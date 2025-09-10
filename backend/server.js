const app = require('./src/app');

app.listen(3000,(err)=>{
    if(err) console.log("Error connecting to server");
})