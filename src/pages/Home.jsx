import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  BriefcaseIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ComputerDesktopIcon,
  PaintBrushIcon,
  MegaphoneIcon,
  LanguageIcon,
  VideoCameraIcon,
  SparklesIcon,
  MusicalNoteIcon,
  BuildingOfficeIcon,
  UserGroupIcon as ConsultingIcon
} from '@heroicons/react/24/outline';

const mainCategories = [
  {
    id: 1,
    name: 'Programming & Tech',
    icon: ComputerDesktopIcon,
    href: '/jobs?category=programming-tech',
    color: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    id: 2,
    name: 'Graphics & Design',
    icon: PaintBrushIcon,
    href: '/jobs?category=graphics-design',
    color: 'bg-pink-50',
    iconColor: 'text-pink-600',
  },
  {
    id: 3,
    name: 'Digital Marketing',
    icon: MegaphoneIcon,
    href: '/jobs?category=digital-marketing',
    color: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    id: 4,
    name: 'Writing & Translation',
    icon: LanguageIcon,
    href: '/jobs?category=writing-translation',
    color: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    id: 5,
    name: 'Video & Animation',
    icon: VideoCameraIcon,
    href: '/jobs?category=video-animation',
    color: 'bg-red-50',
    iconColor: 'text-red-600',
  },
  {
    id: 6,
    name: 'AI Services',
    icon: SparklesIcon,
    href: '/jobs?category=ai-services',
    color: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
  },
  {
    id: 7,
    name: 'Music & Audio',
    icon: MusicalNoteIcon,
    href: '/jobs?category=music-audio',
    color: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    id: 8,
    name: 'Business',
    icon: BuildingOfficeIcon,
    href: '/jobs?category=business',
    color: 'bg-gray-50',
    iconColor: 'text-gray-600',
  },
  {
    id: 9,
    name: 'Consulting',
    icon: ConsultingIcon,
    href: '/jobs?category=consulting',
    color: 'bg-orange-50',
    iconColor: 'text-orange-600',
  }
];

const popularServices = [
  {
    id: 1,
    title: 'Website Development',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
    href: '/jobs?service=website-development',
    category: 'Programming & Tech'
  },
  {
    id: 2,
    title: 'Logo Design',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
    href: '/jobs?service=logo-design',
    category: 'Graphics & Design'
  },
  {
    id: 3,
    title: 'SEO',
    image: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
    href: '/jobs?service=seo',
    category: 'Digital Marketing'
  },
  {
    id: 4,
    title: 'Architecture & Interior Design',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
    href: '/jobs?service=architecture-interior-design',
    category: 'Graphics & Design'
  },
  {
    id: 5,
    title: 'Voice Over',
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
    href: '/jobs?service=voice-over',
    category: 'Music & Audio'
  },
  {
    id: 6,
    title: 'Social Media Marketing',
    image: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
    href: '/jobs?service=social-media-marketing',
    category: 'Digital Marketing'
  },
  {
    id: 7,
    title: 'UGC Content',
    image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
    href: '/jobs?service=ugc-content',
    category: 'Video & Animation'
  },
  {
    id: 8,
    title: 'Mobile App Development',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
    href: '/jobs?service=mobile-app-development',
    category: 'Programming & Tech'
  },
  {
    id: 9,
    title: 'Content Writing',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
    href: '/jobs?service=content-writing',
    category: 'Writing & Translation'
  },
  {
    id: 10,
    title: 'Video Editing',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
    href: '/jobs?service=video-editing',
    category: 'Video & Animation'
  },
  {
    id: 11,
    title: 'AI Development',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
    href: '/jobs?service=ai-development',
    category: 'AI Services'
  },
  {
    id: 12,
    title: 'Business Consulting',
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
    href: '/jobs?service=business-consulting',
    category: 'Business'
  }
];

const features = [
  {
    name: 'Create Gigs',
    description: 'Showcase your skills and services by creating detailed gigs with pricing and delivery time.',
    icon: BriefcaseIcon,
  },
  {
    name: 'Earn Money',
    description: 'Get paid for your work through our secure payment system with multiple payment options.',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Connect with Clients',
    description: 'Build relationships with clients from around the world and grow your business.',
    icon: UserGroupIcon,
  },
  {
    name: 'Secure Platform',
    description: 'Our platform ensures secure transactions and protects both freelancers and clients.',
    icon: ShieldCheckIcon,
  },
];

const benefits = [
  'No hidden fees or commissions',
  'Secure payment processing',
  '24/7 customer support',
  'Easy-to-use platform',
  'Global client reach',
  'Flexible work schedule',
];

const Home = () => {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => 
      prev + 1 >= popularServices.length - 2 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev - 1 < 0 ? popularServices.length - 3 : prev - 1
    );
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary-light/10 mix-blend-multiply" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80')] bg-cover bg-center opacity-10" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Find the perfect</span>
              <span className="block text-primary">freelance services</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              SkillPay connects talented freelancers with clients looking for quality work. Create your profile, showcase your skills, and start earning today.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-primary hover:bg-primary-dark transition-colors duration-300"
                >
                  Go to Dashboard
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-primary hover:bg-primary-dark transition-colors duration-300"
                  >
                    Get Started
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-300"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-gray-50 rounded-xl p-6 text-center shadow-sm">
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="mt-2 text-sm font-medium text-gray-600">Active Freelancers</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center shadow-sm">
              <div className="text-3xl font-bold text-primary">5K+</div>
              <div className="mt-2 text-sm font-medium text-gray-600">Completed Projects</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center shadow-sm">
              <div className="text-3xl font-bold text-primary">$1M+</div>
              <div className="mt-2 text-sm font-medium text-gray-600">Earned by Freelancers</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center shadow-sm">
              <div className="text-3xl font-bold text-primary">98%</div>
              <div className="mt-2 text-sm font-medium text-gray-600">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Browse by Category</h2>
            <p className="mt-4 text-lg text-gray-600">Find the perfect service in our diverse categories</p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {mainCategories.map((category) => (
              <Link
                key={category.id}
                to={category.href}
                className={`group relative flex flex-col items-center p-6 rounded-2xl ${category.color} transition-transform hover:scale-105`}
              >
                <category.icon className={`h-12 w-12 ${category.iconColor}`} />
                <h3 className="mt-4 text-sm font-medium text-gray-900 text-center">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Services Section */}
      <div className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Popular Services</h2>
              <p className="mt-4 text-lg text-gray-600">Most in-demand services by our talented freelancers</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50"
              >
                <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
              </button>
              <button
                onClick={nextSlide}
                className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50"
              >
                <ChevronRightIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * (100 / 3)}%)` }}
            >
              <div className="flex min-w-full">
                {popularServices.map((service) => (
                  <div key={service.id} className="w-1/3 flex-shrink-0 px-3">
                    <Link
                      to={service.href}
                      className="block group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="relative pb-[75%] w-full">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-primary">{service.category}</p>
                        <h3 className="mt-1 text-lg font-medium text-gray-900 line-clamp-2">{service.title}</h3>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything you need to succeed
            </p>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              SkillPay provides all the tools you need to build your freelance business and connect with clients.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-16">
              {features.map((feature) => (
                <div key={feature.name} className="relative bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="absolute -top-6 left-8">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white shadow-lg">
                      <feature.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="pt-6">
                    <h3 className="text-xl font-bold text-gray-900">{feature.name}</h3>
                    <p className="mt-4 text-base text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Why choose SkillPay?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                We're committed to providing the best experience for both freelancers and clients. Our platform is designed to help you succeed.
              </p>
              <div className="mt-8">
                <ul className="space-y-4">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-6 w-6 text-primary" aria-hidden="true" />
                      </div>
                      <p className="ml-3 text-base text-gray-700">{benefit}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <img
                  className="w-full h-auto"
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"
                  alt="Team collaboration"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to get started?</span>
              <span className="block text-primary-light">Join SkillPay today.</span>
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Create your profile and start earning in minutes.
            </p>
          </div>
          <div className="mt-8 flex justify-center lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-full shadow">
              <Link
                to={user ? "/dashboard" : "/register"}
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-primary bg-white hover:bg-gray-50 transition-colors duration-300"
              >
                {user ? "Go to Dashboard" : "Get Started"}
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 