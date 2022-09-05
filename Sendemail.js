const mail = (email,otp) => {
    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
        service:'gmail',
        
        
        auth:{
            user: 'hitanshushah5@gmail.com',
            pass:'vflwwzpkxuumctbs'
        }
    });

    var mailOptions = {
        from: 'hitanshushah5@gmail.com',
        to:'shubhshah050@gmail.com',
        subject:'Sending email using nodejs',
        text:`Here is the OTP for changing your password ${otp}`
    }

    transporter.sendMail(mailOptions,function(error,info){
        if(error){
            console.log(error,'errorrr');
        }
        else{
            console.log('Email sent', + info.response);
        }
    })

}

module.exports = mail;