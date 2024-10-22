// pages/index.tsx
import React from 'react';
import HomePage from '../components/HomePage';  // Importing the HomePage component

const IndexPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <HomePage />  {/* Rendering the HomePage component */}
    </div>
  );
};

export default IndexPage;
