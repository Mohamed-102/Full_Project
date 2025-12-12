import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from '../../components/Notification';
import NavBar from '../../components/navBar/NavBar';
import Footer from '../../components/Footer';

const RecruteurLogin = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('signup'); // 'signup' or 'login'
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error'
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [ficheTechnique, setFicheTechnique] = useState(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const cities = [
    'Agadir',
    'Marrakech',
    'Casablanca',
    'Rabat',
    'Tangier'
  ];

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    const timer = setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 4000);
    return () => clearTimeout(timer);
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!firstName.trim() || !lastName.trim() || !signupEmail.trim() || !signupPassword.trim() || 
        !companyName.trim() || !companyLocation.trim() || !ficheTechnique) {
      showMessage('La fiche technique est obligatoire', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('email', signupEmail);
    formData.append('password', signupPassword);
    formData.append('companyName', companyName);
    formData.append('companyLocation', companyLocation);
    formData.append('ficheTechnique', ficheTechnique);

    console.log("Recruiter Signup Data:", { firstName, lastName, email: signupEmail, companyName, companyLocation });
    
    fetch('http://localhost:8000/api/auth/register-recruiter', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(error => {
          throw error;
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Success:', data);
      
      setFirstName('');
      setLastName('');
      setSignupEmail('');
      setSignupPassword('');
      setCompanyName('');
      setCompanyLocation('');
      setFicheTechnique(null);
      setShowPassword(false);
      
      setMode('login');
      
      setTimeout(() => {
        showMessage('Account created successfully!', 'success');
      }, 100);
    })
    .catch((error) => {
      console.error('Error:', error);
      const errorMsg = error.errors ? Object.values(error.errors).flat().join(', ') : error.message || 'Failed to create account';
      showMessage(errorMsg, 'error');
    });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    
    if (!loginEmail.trim() || !loginPassword.trim()) {
      showMessage('Please enter email and password', 'error');
      return;
    }
    fetch('http://localhost:8000/api/auth/login-recruiter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.token && data.user) {
        // Clear any previous session
        sessionStorage.clear();
        localStorage.clear();

        // Save token and user data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userId', data.user.id);
        
        const recruiterData = {
          userId: data.user.id,
          firstName: data.user.firstName || data.user.first_name || 'Recruiter',
          lastName: data.user.lastName || data.user.last_name || '',
          email: data.user.email,
          isRecruiter: true
        };
        sessionStorage.setItem('userData', JSON.stringify(recruiterData));
        
        showMessage('Login successful! Redirecting...', 'success');
        setTimeout(() => {
          navigate('/recruiter/dashboard');
        }, 1000);
      } else {
        showMessage(data.message || 'Login failed. Please try again.', 'error');
      }
     })
    .catch((error) => {
      console.error('Error:', error);
      // showMessage('Login failed. Please check your connection and try again.', 'error');
    });
  };

  return (
    <div>
      <NavBar />
      
      <Notification message={message} type={messageType} isVisible={!!message} />
      
      <div className="min-h-screen bg-gray-100">
        <div className="container 2xl:px-20 mx-auto py-10">
        
          {/* Form Card */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
              
              {/* Navigation Tabs - Purple gradient colors */}
              <div className="flex justify-center space-x-8 mb-8 border-b border-gray-200 pb-4">
                <button 
                  onClick={() => setMode('signup')}
                  className={`text-base font-medium pb-2 transition-all duration-300 ${
                    mode === 'signup' 
                      ? 'text-purple-900 border-b-2 border-purple-800 font-semibold' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  S'inscrire
                </button>
                <button 
                  onClick={() => setMode('login')}
                  className={`text-base font-medium pb-2 transition-all duration-300 ${
                    mode === 'login' 
                      ? 'text-purple-900 border-b-2 border-purple-800 font-semibold' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Se connecter
                </button>
              </div>

              {/* SIGNUP FORM */}
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${mode === 'signup' ? 'opacity-100 h-auto' : 'opacity-0 h-0 hidden'}`}>
                <>
                  {/* Info Paragraph - Hero gradient background with white text */}
                  <div className="bg-gradient-to-r from-purple-800 to-purple-950 rounded-lg p-4 mb-8 text-white">
                    <p className="text-sm leading-relaxed">
                      <span className="font-semibold">En tant que recruteur,</span> inscrivez-vous pour accéder à notre plateforme de recrutement. Publiez des offres d'emploi et gérez vos candidatures facilement.
                    </p>
                  </div>

                  <form onSubmit={handleSignupSubmit} className="space-y-6">
                    
                    {/* First Row: Prénom and Nom */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prénom
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Votre prénom"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Votre nom"
                        />
                      </div>
                    </div>

                    {/* Second Row: Email and Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Adresse mail
                        </label>
                        <input
                          type="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          placeholder="exemple@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mot de passe
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 pr-10"
                            placeholder="Minimum 8 caractères"
                          />
                          {signupPassword && (
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-600 hover:text-purple-800 transition-all duration-200 hover:scale-110"
                            >
                              {showPassword ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 5C6.48 5 2.73 8.46 1 13c1.73 4.54 5.48 8 11 8s9.27-3.46 11-8c-1.73-4.54-5.48-8-11-8zm0 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.54-6-8-11-8-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 11c1.73 4.54 6 8 11 8 1.88 0 3.69-.34 5.37-.95l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm8.04-1.8c-1.66 0-3 1.34-3 3 0 .62.22 1.19.58 1.66l1.44 1.44c1.32-1.41 2.16-3.34 2.16-5.5 0-1.52-.68-2.88-1.75-3.83z" />
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Third Row: Company Name and Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom de l'entreprise
                        </label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Votre entreprise"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Localisation
                        </label>
                        <select
                          value={companyLocation}
                          onChange={(e) => setCompanyLocation(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="">Sélectionnez une ville</option>
                          {cities.map((city) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* File Upload: Fiche Technique */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fiche Technique de l'Entreprise <span className="text-red-500">*</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => setFicheTechnique(e.target.files?.[0] || null)}
                          required
                          className="hidden"
                          id="fiche-upload"
                        />
                        <label htmlFor="fiche-upload" className="cursor-pointer">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-8-12l-8 8m0 0l-8-8m8 8v20" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-600">
                            <span className="font-semibold text-purple-600 hover:text-purple-700">Cliquez pour uploader</span> ou glissez-déposez
                          </p>
                          <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (max 10MB)</p>
                          {ficheTechnique && (
                            <p className="mt-2 text-sm text-green-600 font-medium">
                              ✓ {ficheTechnique.name}
                            </p>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-800 to-purple-950 text-white font-semibold py-3 px-4 rounded-md hover:from-purple-900 hover:to-purple-950 transition-all duration-300 mt-8"
                    >
                      Je m'inscris
                    </button>
                  </form>

                  {/* Footer Links */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                      Vous avez déjà un compte?{' '}
                      <button 
                        onClick={() => setMode('login')}
                        className="text-purple-800 hover:text-purple-900 font-semibold transition-colors"
                      >
                        Se connecter
                      </button>
                    </p>
                  </div>
                </>
              </div>

              {/* LOGIN FORM */}
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${mode === 'login' ? 'opacity-100 h-auto' : 'opacity-0 h-0 hidden'}`}>
                <>
                  {/* Info Paragraph - Hero gradient background with white text */}
                  <div className="bg-gradient-to-r from-purple-800 to-purple-950 rounded-lg p-4 mb-8 text-white">
                    <p className="text-sm leading-relaxed">
                      <span className="font-semibold">Ravi de vous retrouver!</span> Connectez-vous à votre espace recruteur pour gérer vos offres et candidatures.
                    </p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-6">
                  
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse mail
                      </label>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        placeholder="exemple@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 pr-10"
                          placeholder="Votre mot de passe"
                        />
                        {loginPassword && (
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-600 hover:text-purple-800 transition-all duration-200 hover:scale-110"
                          >
                            {showLoginPassword ? (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 5C6.48 5 2.73 8.46 1 13c1.73 4.54 5.48 8 11 8s9.27-3.46 11-8c-1.73-4.54-5.48-8-11-8zm0 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.54-6-8-11-8-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 11c1.73 4.54 6 8 11 8 1.88 0 3.69-.34 5.37-.95l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm8.04-1.8c-1.66 0-3 1.34-3 3 0 .62.22 1.19.58 1.66l1.44 1.44c1.32-1.41 2.16-3.34 2.16-5.5 0-1.52-.68-2.88-1.75-3.83z" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-800 to-purple-950 text-white font-semibold py-3 px-4 rounded-md hover:from-purple-900 hover:to-purple-950 transition-all duration-300 mt-8"
                    >
                      Se connecter
                    </button>
                  </form>

                  {/* Footer Links */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                      Vous n'avez pas de compte?{' '}
                      <button 
                        onClick={() => setMode('signup')}
                        className="text-purple-800 hover:text-purple-900 font-semibold transition-colors"
                      >
                        S'inscrire
                      </button>
                    </p>
                  </div>
                </>
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RecruteurLogin;
