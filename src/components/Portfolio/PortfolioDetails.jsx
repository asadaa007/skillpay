import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import PortfolioReviews from './PortfolioReviews';

const PortfolioDetails = ({ item, onClose }) => {
  if (!item) return null;

  const renderContent = () => {
    switch (item.template) {
      case 'masonry':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {item.images.map((image, index) => (
              <div key={index} className="aspect-w-4 aspect-h-3">
                <img 
                  src={image} 
                  alt={`${item.title} - Image ${index + 1}`} 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        );

      case 'carousel':
        return (
          <div className="relative">
            <div className="aspect-w-16 aspect-h-9">
              <img 
                src={item.images[0]} 
                alt={item.title} 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            {item.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {item.images.map((_, index) => (
                  <div 
                    key={index} 
                    className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'case-study':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {item.images.map((image, index) => (
                <div key={index} className="aspect-w-4 aspect-h-3">
                  <img 
                    src={image} 
                    alt={`${item.title} - Image ${index + 1}`} 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
            {item.customFields && Object.entries(item.customFields).map(([key, value]) => (
              <div key={key} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">{key}</h4>
                <p className="mt-1 text-gray-600">{value}</p>
              </div>
            ))}
          </div>
        );

      case 'code-showcase':
        return (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-sm text-gray-300 overflow-x-auto">
                <code>{item.customFields?.codeSnippet || '// Code snippet will appear here'}</code>
              </pre>
            </div>
            {item.images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item.images.map((image, index) => (
                  <div key={index} className="aspect-w-4 aspect-h-3">
                    <img 
                      src={image} 
                      alt={`${item.title} - Image ${index + 1}`} 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'gallery':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {item.images.map((image, index) => (
              <div key={index} className="aspect-w-1 aspect-h-1">
                <img 
                  src={image} 
                  alt={`${item.title} - Image ${index + 1}`} 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        );

      case 'grid':
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {item.images.map((image, index) => (
              <div key={index} className="aspect-w-4 aspect-h-3">
                <img 
                  src={image} 
                  alt={`${item.title} - Image ${index + 1}`} 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Description</h4>
              <p className="mt-1 text-gray-900">{item.description}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Category</h4>
              <p className="mt-1 text-gray-900">{item.category}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Skills Used</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Project Content</h4>
              <div className="mt-2">
                {renderContent()}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Reviews</h4>
              <div className="mt-2">
                <PortfolioReviews portfolioId={item.id} portfolioTitle={item.title} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDetails; 