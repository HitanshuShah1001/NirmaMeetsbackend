const jwt = require('jsonwebtoken');


module.exports = async(req,res,next) => {
    console.log(req,'>hedarers');
    try {
        const token = await req.body.token

        const decodedtoken  = await jwt.verify(token,"secret")

        const user = await decodedtoken;

        req.user = user;

        next();



    }catch(error){
        res.status(401).json({
            message:'Invalid json request'
        })
    }
}