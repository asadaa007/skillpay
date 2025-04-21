import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const CategoriesNav = () => {
  const [showNav, setShowNav] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50; // Reduced threshold to 50px
      console.log('Scroll position:', window.scrollY, 'Show nav:', isScrolled);
      if (isScrolled !== showNav) {
        setShowNav(isScrolled);
      }
    };

    // Initial check
    handleScroll();

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

  // Categories data with correct routes
  const categories = [
    { name: 'Web Development', href: '/web-development' },
    { name: 'Mobile Development', href: '/mobile-development' },
    { name: 'UI/UX Design', href: '/ui-design' },
    { name: 'Writing', href: '/writing' },
    { name: 'Marketing', href: '/marketing' },
    { name: 'Other Services', href: '/other-services' }
  ];

  if (!showNav) return null;

  return (
    <div className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Left scroll button */}
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-1 rounded-full shadow-md hover:bg-gray-50"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>

          {/* Categories container */}
          <div
            id="categories-container"
            className="flex overflow-x-auto py-4 px-8 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.href}
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-md mr-2 ${
                  location.pathname === category.href
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Right scroll button */}
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-1 rounded-full shadow-md hover:bg-gray-50"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoriesNav; 