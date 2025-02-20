import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4">About GauchoGirls</h1>
      <p className="text-center">
        GauchoGirls is a platform for students to leave and view anonymous reviews.
      </p>
      <div className="text-center mt-6">
        <Link to="/" className="text-blue-600 underline">Back to Home</Link>
      </div>
    </div>
  );
}