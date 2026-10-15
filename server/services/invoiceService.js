import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const invoicePathFor = (bookingId) =>
  path.join(__dirname, "../invoices", `invoice-${bookingId}.pdf`);

const formatDate = (date) => new Date(date).toISOString().slice(0, 10);


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
  filePath = invoicePathFor(bookingId),
}) =>
  new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
    doc.on("error", reject);

    doc.pipe(stream);

    doc.fontSize(20).text("VEHICLE RENTAL PLATFORM", { align: "center" });
    doc.moveDown();
    doc.fontSize(16).text("INVOICE", { align: "center" });
    doc.moveDown(2);

    doc.fontSize(12);
    doc.text(`Booking ID: ${bookingId}`);
    doc.text(`Customer: ${customerName}`);
    doc.text(`Email: ${customerEmail}`);
    doc.moveDown();

    doc.text(`Vehicle: ${vehicleName}`);
    doc.text(`Start Date: ${formatDate(startDate)}`);
    doc.text(`End Date: ${formatDate(endDate)}`);
    doc.moveDown();

    doc.text(`Total Amount: INR ${totalAmount}`);
    doc.moveDown();

    doc.text("Payment Status: Paid");
    doc.text(`Payment ID: ${paymentId}`);
    doc.text(`Order ID: ${orderId}`);
    doc.moveDown(2);

    doc.text("Thank you for choosing Vehicle Rental Platform.", {
      align: "center",
    });

    doc.end();
  });