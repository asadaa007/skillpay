import React, { useState, useEffect, useRef } from 'react';
import { FiCheckCircle, FiClock, FiAward } from 'react-icons/fi';
import { db } from '../../config/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { skillQuestions, difficultyLevels, timeLimit } from '../../data/skillQuestions';

const SkillVerification = ({ skill, onVerificationComplete }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [difficulty, setDifficulty] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const timerRef = useRef(null);

  const questions = difficulty ? skillQuestions[skill][difficulty] : [];

  useEffect(() => {
    if (testStarted && timeRemaining !== null) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [testStarted, timeRemaining]);

  const handleTimeUp = () => {
    const score = answers.reduce((acc, answer, index) => {
      return acc + (answer === questions[index].correctAnswer ? 1 : 0);
    }, 0);
    submitResults(score);
  };

  const startTest = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setTimeRemaining(timeLimit[selectedDifficulty] * skillQuestions[skill][selectedDifficulty].length);
    setTestStarted(true);
  };

  const handleAnswerSubmit = async (selectedAnswer) => {
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      clearInterval(timerRef.current);
      const score = newAnswers.reduce((acc, answer, index) => {
        return acc + (answer === questions[index].correctAnswer ? 1 : 0);
      }, 0);
      submitResults(score);
    }
  };

  const submitResults = async (score) => {
    const passed = (score / questions.length) >= 0.7;
    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        verifiedSkills: arrayUnion({
          skill,
          difficulty,
          verifiedAt: new Date().toISOString(),
          score: score,
          totalQuestions: questions.length,
          passed
        })
      });

      toast.success(passed ? 'Skill verification successful!' : 'Please try again');
      onVerificationComplete?.();
    } catch (error) {
      console.error('Error updating verified skills:', error);
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (!testStarted) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Choose Difficulty Level</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {difficultyLevels.map(level => (
            <button
              key={level}
              onClick={() => startTest(level)}
              className="p-4 border rounded-lg hover:bg-gray-50 capitalize"
            >
              {level}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Verify Your {skill} Skills</h3>
        <div className="text-sm font-medium">
          Time Remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <p className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {questions.length}
            </p>
            <p className="text-gray-700 mt-2">{questions[currentQuestion].question}</p>
          </div>

          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSubmit(index)}
                className="w-full text-left px-4 py-3 rounded-md border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get skill-specific questions
function getSkillQuestion(skill) {
  const questions = {
    'JavaScript': 'What is the difference between let and const?',
    'React': 'Explain the purpose of useEffect',
    'Python': 'What are list comprehensions?',
    // Add more skill-specific questions
  };
  return questions[skill] || 'Demonstrate your knowledge in this area';
}

export default SkillVerification; 