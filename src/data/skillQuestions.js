export const skillQuestions = {
  JavaScript: {
    beginner: [
      {
        id: 'js_b_1',
        question: 'What is the difference between let and const?',
        options: [
          'let can be reassigned, const cannot',
          'const can be reassigned, let cannot',
          'They are exactly the same',
          'let is not a valid keyword'
        ],
        correctAnswer: 0,
        explanation: 'let allows reassignment while const creates a read-only reference.'
      },
      {
        id: 'js_b_2',
        question: 'What is the output of: typeof []?',
        options: ['array', 'object', 'undefined', 'null'],
        correctAnswer: 1,
        explanation: 'Arrays are objects in JavaScript.'
      }
    ],
    intermediate: [
      {
        id: 'js_i_1',
        question: 'What is closure in JavaScript?',
        options: [
          'A way to close browser windows',
          'A function that has access to variables in its outer scope',
          'A method to end loops',
          'A type of variable declaration'
        ],
        correctAnswer: 1,
        explanation: 'Closure allows a function to access variables from its outer scope even after the outer function has returned.'
      }
    ],
    advanced: [
      {
        id: 'js_a_1',
        question: 'Explain event loop and call stack.',
        options: [
          'They are the same thing',
          'Event loop handles UI updates only',
          'Call stack executes asynchronous code directly',
          'Event loop monitors call stack and callback queue'
        ],
        correctAnswer: 3,
        explanation: 'The event loop continuously monitors the call stack and callback queue to handle asynchronous operations.'
      }
    ]
  },
  React: {
    beginner: [
      {
        id: 'react_b_1',
        question: 'What is JSX?',
        options: [
          'A JavaScript XML syntax for writing UI components',
          'A new programming language',
          'A database system',
          'A testing framework'
        ],
        correctAnswer: 0,
        explanation: 'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.'
      }
    ],
    intermediate: [
      {
        id: 'react_i_1',
        question: 'What is the purpose of useEffect?',
        options: [
          'To create visual effects',
          'To handle side effects in functional components',
          'To affect CSS styles',
          'To create animations'
        ],
        correctAnswer: 1,
        explanation: 'useEffect is used for handling side effects like data fetching, subscriptions, or DOM mutations.'
      }
    ]
  }
  // Add more skills and questions
};

export const difficultyLevels = ['beginner', 'intermediate', 'advanced'];

export const timeLimit = {
  beginner: 30, // seconds per question
  intermediate: 45,
  advanced: 60
}; 