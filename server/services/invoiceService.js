import PDFDocument from "pdfkit";
import fs from "fs";

export const generateInvoice = ({
  bookingId,
  customerName,
  customerEmail,
  vehicleName,
  startDate,
  endDate,
  totalAmount,
  paymentId,
  orderId,
  filePath,
}) => {
  const doc = new PDFDocument();


  const stream =fs.createWriteStream(filePath);
  

  console.log("invoice path:",filePath);

  stream.on("finish",()=>{
    console.log("Invoice PDF created successfully");
  });

   stream.on("error",(error)=>{
    console.log("Invoice PDF error:",error);
  });
  

  doc.pipe(stream);

  doc.fontSize(20).text("VEHICLE RENTAL PLATFORM", {
    align: "center",
  });

  doc.moveDown();

  doc.fontSize(16).text("INVOICE", {
    align: "center",
  });

  doc.moveDown(2);

  doc.fontSize(12);

  doc.text(`Booking ID: ${bookingId}`);
  doc.text(`Customer: ${customerName}`);
  doc.text(`Email: ${customerEmail}`);

  doc.moveDown();

  doc.text(`Vehicle: ${vehicleName}`);
  doc.text(`Start Date: ${startDate}`);
  doc.text(`End Date: ${endDate}`);

  doc.moveDown();


  doc.text(`Total Amount: INR ${totalAmount}`);

  doc.moveDown();

  doc.text(`Payment Status: Paid`);
  doc.text(`Payment ID: ${paymentId}`);
  doc.text(`Order ID: ${orderId}`);

  doc.moveDown(2);

  doc.text("Thank you for choosing Vehicle Rental Platform.", {
    align: "center",
  });

  doc.end();

  return doc;
};