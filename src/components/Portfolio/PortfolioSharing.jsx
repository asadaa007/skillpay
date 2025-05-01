import React, { useState } from 'react';
import { 
  LinkIcon, 
  CodeBracketIcon, 
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const PortfolioSharing = ({ portfolioId, portfolioTitle }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('link'); // 'link' or 'embed'
  
  const portfolioUrl = `${window.location.origin}/portfolio/${portfolioId}`;
  const embedCode = `<iframe src="${window.location.origin}/portfolio/${portfolioId}/embed" width="100%" height="600" frameborder="0"></iframe>`;
  
  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${type} copied to clipboard!`);
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy to clipboard');
    }
  };
  
  const shareOnSocial = (platform) => {
    let url = '';
    let text = `Check out my portfolio: ${portfolioTitle}`;
    
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(portfolioUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(portfolioUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(portfolioUrl)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(`Check out my portfolio: ${portfolioTitle}`)}&body=${encodeURIComponent(`I'd like to share my portfolio with you: ${portfolioUrl}`)}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank', 'width=600,height=400');
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Share Your Portfolio</h3>
      
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('link')}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'link'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <LinkIcon className="h-5 w-5 inline-block mr-1" />
          Share Link
        </button>
        <button
          onClick={() => setActiveTab('embed')}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'embed'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CodeBracketIcon className="h-5 w-5 inline-block mr-1" />
          Embed Code
        </button>
      </div>
      
      {activeTab === 'link' ? (
        <div className="space-y-4">
          <div className="flex">
            <input
              type="text"
              value={portfolioUrl}
              readOnly
              className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <button
              onClick={() => copyToClipboard(portfolioUrl, 'Link')}
              className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {copied ? (
                <ClipboardDocumentCheckIcon className="h-5 w-5" />
              ) : (
                <ClipboardDocumentIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Share on social media</p>
            <div className="flex space-x-2">
              <button
                onClick={() => shareOnSocial('facebook')}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                aria-label="Share on Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
                </svg>
              </button>
              <button
                onClick={() => shareOnSocial('twitter')}
                className="p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500"
                aria-label="Share on Twitter"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z" />
                </svg>
              </button>
              <button
                onClick={() => shareOnSocial('linkedin')}
                className="p-2 bg-blue-700 text-white rounded-full hover:bg-blue-800"
                aria-label="Share on LinkedIn"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </button>
              <button
                onClick={() => shareOnSocial('email')}
                className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700"
                aria-label="Share via Email"
              >
                <EnvelopeIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <pre className="text-sm text-gray-700 overflow-x-auto">
              {embedCode}
            </pre>
          </div>
          
          <button
            onClick={() => copyToClipboard(embedCode, 'Embed code')}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {copied ? (
              <>
                <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="h-5 w-5 mr-2" />
                Copy Embed Code
              </>
            )}
          </button>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Preview</h4>
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <iframe 
                src={`${window.location.origin}/portfolio/${portfolioId}/embed`} 
                width="100%" 
                height="300" 
                frameBorder="0"
                title="Portfolio Embed Preview"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioSharing; 