// // src/components/Navigation.js
// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';

// const Navigation = () => {
//   const location = useLocation();

//   const links = [
//     { path: '/', label: 'Upload PDF' },
//     { path: '/generate', label: 'Generate Quiz' },
//     { path: '/history', label: 'History' },
//   ];

//   return (
//     <nav className="bg-white shadow">
//       <div className="max-w-7xl mx-auto px-4">
//         <div className="flex justify-between h-16">
//           <div className="flex">
//             <div className="flex-shrink-0 flex items-center">
//               <h1 className="text-xl font-bold text-gray-800">Study Buddy</h1>
//             </div>
//             <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
//               {links.map((link) => (
//                 <Link
//                   key={link.path}
//                   to={link.path}
//                   className={`${
//                     location.pathname === link.path
//                       ? 'border-blue-500 text-gray-900'
//                       : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
//                   } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
//                 >
//                   {link.label}
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navigation;


// src/components/Navigation.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import GoogleSignIn from './GoogleSignIn'; // Import the GoogleSignIn component

const Navigation = () => {
  const location = useLocation();

  const links = [
    { path: '/', label: 'Upload PDF' },
    { path: '/generate', label: 'Generate Quiz' },
    { path: '/history', label: 'History' },
  ];

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Study Buddy</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${
                    location.pathname === link.path
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <GoogleSignIn /> {/* Add the GoogleSignIn component here */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
