import { useState, Fragment, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  HomeIcon,
  BriefcaseIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  FolderIcon,
  ChatBubbleLeftIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import Notifications from './Notifications';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 0;
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      // Error is handled by the logout function
    }
  };

  // General navigation items (shown to all users)
  const generalNavigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Jobs', href: '/jobs', icon: ClipboardDocumentListIcon },
  ];

  // User-specific navigation items (shown only when logged in)
  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
    { name: 'Portfolio', href: '/portfolio', icon: FolderIcon },
    { name: 'Gigs', href: '/gigs', icon: BriefcaseIcon },
    { name: 'Orders', href: '/orders', icon: ShoppingCartIcon },
    { name: 'Messages', href: '/messages', icon: ChatBubbleLeftIcon },
  ];

  // Determine which navigation items to show based on user authentication
  const navigation = user ? [...generalNavigation, ...userNavigation] : generalNavigation;

  return (
    <nav className={`fixed top-0 left-0 right-0 transition-all duration-300 z-20 ${
      isScrolled ? 'bg-white border-b border-gray-200' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link to="/" className={`text-2xl font-bold transition-colors duration-300 ${
                isScrolled ? 'text-gray-800' : 'text-gray-800'
              }`}>
                SkillPay
              </Link>
            </div>
            <div className="hidden lg:ml-6 lg:flex lg:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors duration-300 ${
                    location.pathname === item.href
                      ? isScrolled 
                        ? 'border-primary text-gray-900' 
                        : 'border-primary text-gray-900'
                      : isScrolled
                        ? 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                        : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`h-5 w-5 mr-1 transition-colors duration-300 ${
                    isScrolled ? 'text-gray-600 group-hover:text-gray-900' : 'text-gray-600 group-hover:text-gray-900'
                  }`} />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden lg:ml-6 lg:flex lg:items-center">
            {user ? (
              <>
                <div className="mr-4">
                  <Notifications />
                </div>
                <Menu as="div" className="relative ml-3">
                  <div className="flex items-center">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 text-sm font-medium transition-colors duration-300"
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt="Profile"
                          className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <UserCircleIcon className="h-8 w-8 text-gray-600" />
                      )}
                      <span className="hidden md:block text-gray-700">{user.fullName || user.email}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
                    >
                      Logout
                    </button>
                  </div>
                </Menu>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="transition-colors duration-300 text-gray-600 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors duration-300"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center lg:hidden">
            {user && (
              <div className="mr-2">
                <Notifications />
              </div>
            )}
            <button
              type="button"
              className={`inline-flex items-center justify-center p-2 rounded-md transition-colors duration-300 ${
                isScrolled
                  ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:hidden bg-white`}>
        <div className="pt-2 pb-3 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 text-base font-medium transition-colors duration-300 ${
                location.pathname === item.href
                  ? 'text-primary bg-gray-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              onClick={handleLogout}
            >
              <item.icon className={`h-5 w-5 mr-2 transition-colors duration-300 ${
                location.pathname === item.href ? 'text-primary' : 'text-gray-600'
              }`} />
              {item.name}
            </Link>
          ))}
        </div>
        
        {user ? (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Profile"
                    className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <UserCircleIcon className="h-10 w-10 text-gray-600" />
                )}
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-900">
                  {user.fullName || user.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                to="/profile"
                className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-300"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="space-y-1">
              <Link
                to="/login"
                className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-300"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;