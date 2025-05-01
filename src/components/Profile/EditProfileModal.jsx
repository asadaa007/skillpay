import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';

const EditSectionModal = ({ 
  isOpen, 
  onClose, 
  title,
  section,
  profileData, 
  handleInputChange, 
  handleArrayInputChange,
  handleLanguageChange,
  handleSubmit, 
  saving 
}) => {
  const [newLanguage, setNewLanguage] = useState({ name: '', proficiency: 'Native' });
  const [newSkill, setNewSkill] = useState('');
  const [newExperience, setNewExperience] = useState({
    company: '',
    city: '',
    country: '',
    title: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    currentlyWork: false,
    description: ''
  });
  const [newEducation, setNewEducation] = useState('');
  const [newCertification, setNewCertification] = useState('');

  const addLanguage = () => {
    if (newLanguage.name.trim()) {
      const updatedLanguages = [
        ...profileData.languages,
        { ...newLanguage }
      ];
      handleLanguageChange(updatedLanguages);
      setNewLanguage({ name: '', proficiency: 'Native' });
    }
  };

  const removeLanguage = (index) => {
    const updatedLanguages = profileData.languages.filter((_, i) => i !== index);
    handleLanguageChange(updatedLanguages);
  };

  const handleSkillInputChange = (e) => {
    setNewSkill(e.target.value);
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (newSkill.trim()) {
        const updatedSkills = [...profileData.skills, newSkill.trim()];
        handleArrayInputChange({ target: { value: updatedSkills.join(', ') } }, 'skills');
        setNewSkill('');
      }
    }
  };

  const handleExperienceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewExperience(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEducationInputChange = (e) => {
    setNewEducation(e.target.value);
  };

  const handleCertificationInputChange = (e) => {
    setNewCertification(e.target.value);
  };

  const addExperience = () => {
    if (!newExperience.company || !newExperience.title) return;

    const updatedExperiences = [
      ...profileData.experiences,
      newExperience
    ];

    handleArrayInputChange({ target: { value: updatedExperiences } }, 'experiences');
    setNewExperience({
      company: '',
      city: '',
      country: '',
      title: '',
      startMonth: '',
      startYear: '',
      endMonth: '',
      endYear: '',
      currentlyWork: false,
      description: ''
    });
  };

  const removeExperience = (index) => {
    const updatedExperiences = profileData.experiences.filter((_, i) => i !== index);
    handleArrayInputChange({ target: { value: updatedExperiences } }, 'experiences');
  };

  const renderContent = () => {
    switch (section) {
      case 'basic':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={profileData.fullName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Professional Title</label>
              <input
                type="text"
                name="title"
                value={profileData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                value={profileData.location}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>
          </div>
        );

      case 'languages':
        return (
          <div className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Language</label>
                <input
                  type="text"
                  value={newLanguage.name}
                  onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Proficiency</label>
                <select
                  value={newLanguage.proficiency}
                  onChange={(e) => setNewLanguage({ ...newLanguage, proficiency: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                >
                  <option value="Native">Native</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Basic">Basic</option>
                </select>
              </div>
            </div>
            <button
              type="button"
              onClick={addLanguage}
              className="btn-secondary"
            >
              Add Language
            </button>
            <div className="space-y-2">
              {profileData.languages.map((lang, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span>{lang.name} - {lang.proficiency}</span>
                  <button
                    type="button"
                    onClick={() => removeLanguage(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Add Skills</label>
              <input
                type="text"
                value={newSkill}
                onChange={handleSkillInputChange}
                onKeyDown={handleSkillKeyDown}
                placeholder="Type a skill and press Enter or comma"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">Press Enter or comma to add a skill</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {profileData.skills.map((skill, index) => (
                <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                  <span className="text-sm">{skill}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newSkills = [...profileData.skills];
                      newSkills.splice(index, 1);
                      handleArrayInputChange({ target: { value: newSkills } }, 'skills');
                    }}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'experience':
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company</label>
                <input
                  type="text"
                  name="company"
                  value={newExperience.company}
                  onChange={handleExperienceChange}
                  placeholder="Ex: Upwork"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="city"
                    value={newExperience.city}
                    onChange={handleExperienceChange}
                    placeholder="Enter city"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={newExperience.country}
                    onChange={handleExperienceChange}
                    placeholder="Ex: United States"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newExperience.title}
                  onChange={handleExperienceChange}
                  placeholder="Ex: Senior Software Engineer"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Month</label>
                  <select
                    name="startMonth"
                    value={newExperience.startMonth}
                    onChange={handleExperienceChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  >
                    <option value="">From, month</option>
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <select
                    name="startYear"
                    value={newExperience.startYear}
                    onChange={handleExperienceChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  >
                    <option value="">From, year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              {!newExperience.currentlyWork && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Month</label>
                    <select
                      name="endMonth"
                      value={newExperience.endMonth}
                      onChange={handleExperienceChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    >
                      <option value="">To, month</option>
                      {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Year</label>
                    <select
                      name="endYear"
                      value={newExperience.endYear}
                      onChange={handleExperienceChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    >
                      <option value="">To, year</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="currentlyWork"
                  checked={newExperience.currentlyWork}
                  onChange={handleExperienceChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  I currently work here
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea
                  name="description"
                  value={newExperience.description}
                  onChange={handleExperienceChange}
                  rows={4}
                  placeholder="Enter description"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
            </div>

            {/* List of existing experiences */}
            {profileData.experiences?.length > 0 && (
              <div className="mt-6 space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Work Experience</h4>
                {profileData.experiences.map((exp, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-gray-900">{exp.title}</h5>
                        <p className="text-gray-600">{exp.company}</p>
                        <p className="text-sm text-gray-500">
                          {exp.city}, {exp.country}
                        </p>
                        <p className="text-sm text-gray-500">
                          {exp.startMonth} {exp.startYear} - {exp.currentlyWork ? 'Present' : `${exp.endMonth} ${exp.endYear}`}
                        </p>
                        {exp.description && (
                          <p className="mt-2 text-gray-700">{exp.description}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'education':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Education</label>
              <textarea
                value={profileData.education}
                onChange={(e) => handleInputChange({ target: { name: 'education', value: e.target.value } })}
                rows={8}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Enter your educational background, including degrees, institutions, and years of study..."
              />
            </div>
          </div>
        );

      case 'certifications':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Certifications</label>
              <textarea
                value={profileData.certifications}
                onChange={(e) => handleInputChange({ target: { name: 'certifications', value: e.target.value } })}
                rows={8}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Enter your certifications, including names, issuing organizations, and dates..."
              />
            </div>
          </div>
        );

      case 'links':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <input
                type="url"
                name="website"
                value={profileData.website || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="https://your-website.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">GitHub</label>
              <input
                type="url"
                name="github"
                value={profileData.github || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
              <input
                type="url"
                name="linkedin"
                value={profileData.linkedin || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Twitter</label>
              <input
                type="url"
                name="twitter"
                value={profileData.twitter || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="https://twitter.com/username"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${isOpen ? 'block' : 'hidden'}`}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {title}
                </h3>
                {renderContent()}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={section === 'experience' ? addExperience : handleSubmit}
              disabled={saving}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSectionModal; 