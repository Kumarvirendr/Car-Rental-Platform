
export const SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const API_URL = `${SERVER_URL}/api`;
export const UPLOADS_URL = `${SERVER_URL}/uploads`;

export const vehicleImageUrl = (image) => {
  if (!image) return "";
  return image.startsWith("http") ? image : `${UPLOADS_URL}/${image}`;
};