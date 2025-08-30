import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#861F41] text-white py-4 shadow-md">
      <div className="container mx-auto text-center">
        <p style={{ fontFamily: 'AcherusGrotesque-Regular' }}>&copy; {new Date().getFullYear()} Virginia Tech. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
