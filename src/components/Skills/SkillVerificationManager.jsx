import React, { useState } from 'react';
import SkillVerification from './SkillVerification';
import VerifiedSkillsBadge from './VerifiedSkillsBadge';

const SkillVerificationManager = ({ userSkills, verifiedSkills }) => {
  const [selectedSkill, setSelectedSkill] = useState(null);

  const unverifiedSkills = userSkills.filter(
    skill => !verifiedSkills?.some(vs => vs.skill === skill)
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Verified Skills</h3>
        <div className="flex flex-wrap gap-2">
          {verifiedSkills?.map((skill, index) => (
            <VerifiedSkillsBadge key={index} skill={skill} />
          ))}
          {!verifiedSkills?.length && (
            <p className="text-gray-500">No verified skills yet</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Verify New Skills</h3>
        {unverifiedSkills.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {unverifiedSkills.map(skill => (
                <button
                  key={skill}
                  onClick={() => setSelectedSkill(skill)}
                  className="px-4 py-2 rounded-md border hover:bg-gray-50"
                >
                  {skill}
                </button>
              ))}
            </div>

            {selectedSkill && (
              <SkillVerification
                skill={selectedSkill}
                onVerificationComplete={() => setSelectedSkill(null)}
              />
            )}
          </>
        ) : (
          <p className="text-gray-500">All skills are verified!</p>
        )}
      </div>
    </div>
  );
};

export default SkillVerificationManager; 