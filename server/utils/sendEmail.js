import nodemailer from "nodemailer";




const sendEmail=async(options)=>{
    const transporter=nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASS,

        },
    });

    // console.log("USER",process.env.EMAIL_USER);
    // console.log("PASS",process.env.EMIL_PASS);


    await transporter.sendMail({
        from:process.env.EMAIL_USER,
        to:options.email,
        subject:options.subject,
        text:options.message,
    })
}

export default sendEmail;