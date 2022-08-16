const jwt = require('jsonwebtoken');


module.exports = async(req,res,next) => {
    try {
        const token = await req.headers.authorization.split(" ")[1]
        console.log(req.headers.authorizations)

        console.log(token,'token');

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