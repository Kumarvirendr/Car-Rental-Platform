
import Booking from "../models/bookingModel.js";
const ONE_DAY=1000*60*60*24;
export const BLOCKING_STATUSES=["approved","active"];

export const calculateDays=(startDate,endDate)=> 
    Math.ceil((new Date(endDate)-new Date(startDate)) / ONE_DAY);

export const hasOverlap = (vehicleId, startDate, endDate) =>
  Booking.exists({
    vehicle: vehicleId,
    status: { $in: BLOCKING_STATUSES },
    startDate: { $lte: new Date(endDate) },
    endDate: { $gte: new Date(startDate) },
  });

