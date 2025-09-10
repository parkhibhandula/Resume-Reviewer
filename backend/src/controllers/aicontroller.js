const aiservice = require('../services/aiservice');

module.exports.getReview = (async(req,res)=>{
    const prompt = req.body.prompt;
    if(!prompt){
        return res.status(400).send("Give a prompt");
    }
    const response = await aiservice(prompt);
    res.send(response);
})