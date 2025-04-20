import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const CategoriesNav = () => {
  const [showNav, setShowNav] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 100;
      if (isScrolled !== showNav) {
        setShowNav(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showNav]);

  const handleScroll = (direction) => {
    const container = document.getElementById('categories-container');
    const scrollAmount = 200; // Adjust this value to control scroll distance
    const newPosition = direction === 'left' 
      ? scrollPosition - scrollAmount 
      : scrollPosition + scrollAmount;
    
    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    setScrollPosition(newPosition);
  };

  // Categories data
  const categories = [
    { name: 'Graphics & Design', href: '/category/graphics-design' },
    { name: 'Programming & Tech', href: '/category/programming-tech' },
    { name: 'Digital Marketing', href: '/category/digital-marketing' },
    { name: 'Video & Animation', href: '/category/video-animation' },
    { name: 'Writing & Translation', href: '/category/writing-translation' },
    { name: 'Music & Audio', href: '/category/music-audio' },
    { name: 'Business', href: '/category/business' },
    { name: 'Data', href: '/category/data' },
    { name: 'Photography', href: '/category/photography' },
    { name: 'AI Services', href: '/category/ai-services' },
  ];

  if (!showNav) return null;

  return (
    <div className="fixed top-16 left-0 right-0 bg-white shadow-md z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        
        <div 
          id="categories-container"
          className="overflow-x-hidden py-3 px-12"
        >
          <ul className="flex space-x-6 transition-transform duration-300">
            {categories.map((category) => (
              <li key={category.name} className="whitespace-nowrap">
                <Link 
                  to={category.href}
                  className={`text-sm font-medium px-3 py-1 rounded-md transition-colors duration-200 ${
                    location.pathname === category.href
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => handleScroll('right')}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default CategoriesNav; 