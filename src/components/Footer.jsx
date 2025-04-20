import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-2xl font-bold text-primary">
              SkillPay
            </Link>
            <p className="mt-4 text-gray-500 text-sm">
              SkillPay is a platform that connects skilled professionals with clients looking for their services.
              Create your profile, showcase your skills, and start earning today.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              For Freelancers
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/register" className="text-base text-gray-500 hover:text-primary">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/gigs" className="text-base text-gray-500 hover:text-primary">
                  Browse Gigs
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-base text-gray-500 hover:text-primary">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Support
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-primary">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-primary">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-primary">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} SkillPay. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 