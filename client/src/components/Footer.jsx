import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-8 py-12 grid md:grid-cols-3 gap-10">
        {/* company */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Vehicle Rental</h2>
          <p className="text-gray-300">
            Rent your favourite cars and bikes at affordable prices. fast,secure
            and trusted vehicle rental platform
          </p>
        </div>
        {/* Quick Link  */}
        <div>
          <h2 className="text-xl font-bold mb-4">Quick Links</h2>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="hover:text-blue-400">Home</Link>
            </li>
            <li>
              <Link to="/vehicles" className="hover:text-blue-400">Vehicles</Link>
            </li>
            <li>
              <Link to="/my-bookings" className="hover:text-blue-400">My Bookings</Link>
            </li>
          </ul>
        </div>
        {/* contact Us  */}
        <div>
          <h2 className="text-xl font-bold mb-4">Contact Us</h2>
          <p>Email : support@vehiclerental.com</p>
          <p>phone : +91 9876543210</p>

          <div className="flex gap-4 mt-5 text-2xl">
            <FaFacebook className="hover:text-blue-500 cursor-pointer" />
            <FaInstagram className="hover:text-blue-500 cursor-pointer"  />
            <FaLinkedin className="hover:text-blue-500 cursor-pointer"  />
            <FaGithub className="hover:text-blue-500 cursor-pointer"  />
          </div>
        </div>
      </div>
      <div className="border-t border-gray-700 py-5 text-center text-gray-400">
        © 2026 Vehicle Rental System | All Rights Reserved.</div>
    </footer>
  );
};

export default Footer;
