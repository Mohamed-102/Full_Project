import React from 'react';

const Notification = ({ message, type, isVisible }) => {
  return (
    <>
      {isVisible && (
        <div className={`fixed top-20 left-0 right-0 mx-auto max-w-md z-50 transform transition-all duration-500 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-96 opacity-0'}`}>
          <div className={`${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-4 rounded-lg shadow-lg flex items-center justify-center gap-3 m-4`}>
            {type === 'success' && (
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <p className="font-semibold text-sm text-center">{message}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Notification;
