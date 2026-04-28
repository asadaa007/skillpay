import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              ...user,
              fullName: userData.fullName || user.displayName || '',
              avatar: userData.avatar || user.photoURL || '',
              userType: userData.userType || 'freelancer',
              ...userData
            });
          } else {
            // If user document doesn't exist, create it with default values
            const defaultUserData = {
              email: user.email,
              fullName: user.displayName || '',
              avatar: user.photoURL || '',
              createdAt: new Date().toISOString(),
              credits: 10,
              lastCreditReset: new Date().toISOString(),
              userType: 'freelancer',
              bio: '',
              skills: [],
              hourlyRate: '',
              phone: '',
              location: '',
              website: '',
              linkedin: '',
              github: '',
              twitter: '',
              company: '',
              position: '',
              experience: '',
              education: '',
              languages: [],
              availability: 'full-time',
              portfolio: [],
              certifications: [],
              paymentInfo: {
                bankName: '',
                accountNumber: '',
                routingNumber: '',
                paypalEmail: ''
              }
            };
            await setDoc(doc(db, 'users', user.uid), defaultUserData);
            setUser({ ...user, ...defaultUserData });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast.error('Failed to load user data');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, userData) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore with default values
      const defaultUserData = {
        email,
        ...userData,
        createdAt: new Date().toISOString(),
        credits: 10,
        lastCreditReset: new Date().toISOString(),
        userType: userData.userType || 'freelancer',
        bio: '',
        skills: [],
        hourlyRate: '',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        github: '',
        twitter: '',
        company: '',
        position: '',
        experience: '',
        education: '',
        languages: [],
        availability: 'full-time',
        portfolio: [],
        certifications: [],
        paymentInfo: {
          bankName: '',
          accountNumber: '',
          routingNumber: '',
          paypalEmail: ''
        }
      };

      await setDoc(doc(db, 'users', user.uid), defaultUserData);
      toast.success('Account created successfully!');
      return user;
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedUser = {
          ...user,
          fullName: userData.fullName || user.displayName || '',
          avatar: userData.avatar || user.photoURL || '',
          userType: userData.userType || 'freelancer',
          ...userData
        };
        setUser(updatedUser);
        toast.success('Logged in successfully!');
        return updatedUser;
      }
      return user;
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        // Create user document with default values
        const defaultUserData = {
          email: user.email,
          fullName: user.displayName || '',
          avatar: user.photoURL || '',
          createdAt: new Date().toISOString(),
          credits: 10,
          lastCreditReset: new Date().toISOString(),
          userType: 'freelancer',
          bio: '',
          skills: [],
          hourlyRate: '',
          phone: '',
          location: '',
          website: '',
          linkedin: '',
          github: '',
          twitter: '',
          company: '',
          position: '',
          experience: '',
          education: '',
          languages: [],
          availability: 'full-time',
          portfolio: [],
          certifications: [],
          paymentInfo: {
            bankName: '',
            accountNumber: '',
            routingNumber: '',
            paypalEmail: ''
          }
        };
        await setDoc(doc(db, 'users', user.uid), defaultUserData);
      }
      
      toast.success('Logged in with Google successfully!');
      return user;
    } catch (error) {
      console.error('Error logging in with Google:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 