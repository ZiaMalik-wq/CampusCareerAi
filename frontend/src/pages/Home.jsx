import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
      <h1 className="text-5xl font-bold text-gray-900 mb-6">
        Find Your Dream <span className="text-blue-600">Internship</span>
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mb-8">
        CampusCareer AI uses advanced artificial intelligence to match your CV 
        with the best opportunities tailored just for you.
      </p>
      <div className="flex gap-4">
        <Link to="/jobs" className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
          Browse Jobs
        </Link>
        <Link to="/register" className="px-8 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition">
          Get Started
        </Link>
      </div>
    </div>
  );
};

export default Home;