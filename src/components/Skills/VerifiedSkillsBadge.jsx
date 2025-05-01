import React from 'react';
import { FiAward, FiCheck } from 'react-icons/fi';

const VerifiedSkillsBadge = ({ skill }) => {
  const { verifiedAt, score, passed } = skill;

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
      passed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {passed ? (
        <FiAward className="mr-1 text-green-500" />
      ) : (
        <FiCheck className="mr-1 text-gray-500" />
      )}
      <span>{skill.skill}</span>
      <span className="ml-1 text-xs opacity-75">
        {new Date(verifiedAt).toLocaleDateString()}
      </span>
    </div>
  );
};

export default VerifiedSkillsBadge; 