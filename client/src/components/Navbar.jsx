import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { FaTicketAlt } from "react-icons/fa";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    }

    return (
        <nav className="bg-gray-900 shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-4">
                    <Link to="/" className="flex items-center text-white text-2xl font-bold flex items-center gap-2">
                        <FaTicketAlt className="mr-2" />
                        Eventora
                    </Link>
                    <Link to="/" className="text-gray-200 hover:text-white transition cursor-pointer">Events</Link>
                    {user ? (
                        <>
                            <Link to={user.role === "admin" ? "/admin" : "/dashboard"} 
                            className="text-gray-200 hover:text-white transition cursor-pointer">Dashboard</Link>
                            <button onClick={handleLogout} className="bg-gray-700 hover:bg-black text-white py-2 px-4 rounded-md 
                            transition cursor-pointer">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-200 hover:text-white transition cursor-pointer">Login</Link>
                            <Link to="/register" className="bg-white text-gray-900 hover:bg-gray-100 py-2 px-4 rounded-md
                            font-semibold transition cursor-pointer">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};
export default Navbar;