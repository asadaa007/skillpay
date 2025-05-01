import React from 'react';
import { 
  ViewColumnsIcon, 
  Squares2X2Icon, 
  PhotoIcon, 
  DocumentTextIcon, 
  CodeBracketIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';

const PortfolioTemplates = ({ selectedTemplate, onSelectTemplate }) => {
  const templates = [
    {
      id: 'grid',
      name: 'Grid Layout',
      description: 'A clean, organized grid layout for showcasing multiple projects',
      icon: <Squares2X2Icon className="h-6 w-6" />,
      preview: 'https://i0.wp.com/css-tricks.com/wp-content/uploads/2022/05/s_A8CA686DA97A9B54A10BB8506B0F905A3FEF553C480B7AEBFFA08B417AE4ABF7_1642170540124_Untitled.png?resize=2048%2C1200&ssl=1'
    },
    {
      id: 'masonry',
      name: 'Masonry Layout',
      description: 'A Pinterest-style layout for projects of varying sizes',
      icon: <ViewColumnsIcon className="h-6 w-6" />,
      preview: 'https://cruip.com/wp-content/uploads/2024/05/masonry-tailwind-demo.png'
    },
    {
      id: 'carousel',
      name: 'Carousel Layout',
      description: 'A slideshow-style layout for highlighting your best work',
      icon: <PhotoIcon className="h-6 w-6" />,
      preview: 'https://assets.justinmind.com/wp-content/uploads/2016/10/carousel-ui-header-768x492.png'
    },
    {
      id: 'gallery',
      name: 'Gallery Layout',
      description: 'A full-width gallery layout for visual projects',
      icon: <SwatchIcon className="h-6 w-6" />,
      preview: 'https://i.pinimg.com/736x/28/44/bb/2844bbc9cd237bd5998c98c4665f20d1.jpg'
    },
    {
      id: 'case-study',
      name: 'Case Study Layout',
      description: 'A detailed layout for showcasing project processes and results',
      icon: <DocumentTextIcon className="h-6 w-6" />,
      preview: 'https://elements-resized.envatousercontent.com/elements-cover-images/f91f5a73-a324-4717-a93a-cf523c0f7695?w=433&cf_fit=scale-down&q=85&format=auto&s=7a4a8e8f80b07f141a8fb5012d641f59c272c663afe059627de420eb572a6dfd'
    },
    {
      id: 'code-showcase',
      name: 'Code Showcase Layout',
      description: 'A specialized layout for displaying code snippets and technical projects',
      icon: <CodeBracketIcon className="h-6 w-6" />,
      preview: 'https://codesandbox.io/_next/image?url=%2Fnew%2Fblog%2Fsandpack-showcase%2Fbanner.png&w=3840&q=75'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Choose a Template</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-primary/50'
            }`}
            onClick={() => onSelectTemplate(template.id)}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className={`p-2 rounded-md ${
                selectedTemplate === template.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {template.icon}
              </div>
              <h4 className="font-medium text-gray-900">{template.name}</h4>
            </div>
            <p className="text-sm text-gray-500 mb-3">{template.description}</p>
            <div className="aspect-video rounded-md overflow-hidden bg-gray-100">
              <img 
                src={template.preview} 
                alt={`${template.name} preview`} 
                className="w-full h-full object-cover"
              />
            </div>
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                Selected
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioTemplates; 