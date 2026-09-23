import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5000/api",
  
// });


const api = axios.create({
  baseURL: "http://10.214.72.242:5000/api",
});

api.interceptors.request.use(
  (config)=>{
    const token=localStorage.getItem("token");
    if(token){
      config.headers.Authorization=token;
    }
    return config;
  },
(error)=>{
  return Promise.reject(error);
}
);

export default api;
