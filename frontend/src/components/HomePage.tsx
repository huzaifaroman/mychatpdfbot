"use client";

import React, { useEffect, useState } from 'react';
import ChatPDFInterface from './ChatPDFInterface'; // Import ChatPDFInterface

const HomePage: React.FC = () => {
  useEffect(() => {
    // Append animation styles to document head
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(styleSheet);

    // Clean up function to remove styles when component unmounts
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // State for hover effects
  const [isHovered, setIsHovered] = useState<{ nav: boolean; button: boolean }>({ nav: false, button: false });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null); // Track which item is being hovered
  const [showChat, setShowChat] = useState(false); // State to control when to show the ChatPDFInterface

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null); // Reset when mouse leaves
  };

  return (
    <div style={styles.container}>
      {/* Conditionally render the Navigation Bar only if ChatPDFInterface is not showing */}
      {!showChat && (
        <nav style={styles.navbar}>
          <ul style={styles.navList}>
            {['Home', 'Features', 'Start chat', 'Developer', 'Contact'].map((item, index) => (
              <li
                key={index}
                style={{
                  ...styles.navItem,
                  transform: hoveredIndex === index ? 'scale(1.1)' : 'scale(1)',
                  color: hoveredIndex === index ? 'black' : '#fff', // Change color on hover
                  transition: 'transform 0.3s ease, color 0.3s ease', // Smooth transition for hover effects
                }}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                {item}
              </li>
            ))}
          </ul>
        </nav>
      )}
      
      {/* Conditionally render the logo only if ChatPDFInterface is not showing */}
      {!showChat && (
        <div style={styles.logoContainer}>
          <img src="/logo.png" alt="Audacity Logo" style={styles.logo} />
        </div>
      )}

      {/* Conditionally render the Hero Section only if ChatPDFInterface is not showing */}
      {!showChat && (
        <div style={{ ...styles.heroSection, animation: 'fadeIn 1s ease-in-out' }}>
          <h1 style={styles.heroTitle}>Welcome to the Audacity (Chat & PDF)</h1>
          <p style={styles.heroText}>Now No Worries About Exam and Preparation.</p>
          <button
            style={{
              ...styles.getStartedButton,
              transform: isHovered.button ? 'scale(1.1)' : 'scale(1)',
              backgroundColor: isHovered.button ? '#005bb5' : '#0070f3',
              transition: 'transform 0.3s ease, backgroundColor 0.3s ease',
            }}
            onMouseEnter={() => setIsHovered(prev => ({ ...prev, button: true }))}
            onMouseLeave={() => setIsHovered(prev => ({ ...prev, button: false }))}
            onClick={() => setShowChat(true)} // Show ChatPDFInterface when button is clicked
          >
            Get Started
          </button>
        </div>
      )}

      {/* Conditionally Render ChatPDFInterface */}
      {showChat && <ChatPDFInterface setShowChat={setShowChat} />} {/* Ensure you're passing setShowChat here */}
    </div>
  );
};

// Inline CSS styles
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '100vh',
    backgroundColor: '#000', // Set background to black
    padding: '0 20px',
  },
  logoContainer: {
    marginTop: '20px',
  },
  logo: {
    width: '150px', // Adjust the width of the logo
    height: 'auto', // Keep aspect ratio
  },
  navbar: {
    width: '100%',
    backgroundColor: '#333',
    padding: '20px 0',
    marginBottom: '10px',
    position: 'relative' as 'relative',
    zIndex: 2,
  },
  navList: {
    listStyleType: 'none',
    display: 'flex',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
  },
  navItem: {
    color: '#fff',
    margin: '0 15px',
    cursor: 'pointer',
    fontSize: '1.2rem',
    transition: 'transform 0.3s ease, color 0.3s ease', // Smooth transition for hover effects
  },
  heroSection: {
    textAlign: 'center' as 'center',
    height: '70%',
    width: '60%',
    color: '#fff', // Change text color to white for better visibility on black background
    borderRadius: '50px', // Bubble effect
    padding: '20px',
    boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)', // Glow effect
    marginTop: '20px', // Add margin to separate from the navbar
  },
  heroTitle: {
    fontSize: '2.5rem',
    margin: '0 0 20px 0',
  },
  heroText: {
    fontSize: '1.2rem',
    marginBottom: '30px',
    color: '#ccc', // Lighten text for visibility
  },
  getStartedButton: {
    padding: '25px 35px',
    fontSize: '1rem',
    color: '#fff',
    background: 'linear-gradient(135deg, black, green)',
    backgroundColor: '#0070f3',
    border: 'none',
    borderRadius: '20px', // Make button more rounded for bubble effect
    cursor: 'pointer',
  },
};

export default HomePage;
