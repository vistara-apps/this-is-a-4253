import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, Loader2, Chrome } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginForm = ({ mode = 'signin', onModeChange }) => {
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm();

  const watchedEmail = watch('email');

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      if (isResetMode) {
        await resetPassword(data.email);
        toast.success('Password reset email sent! Check your inbox.');
        setIsResetMode(false);
        reset();
      } else if (mode === 'signin') {
        await signIn(data.email, data.password);
        toast.success('Welcome back!');
      } else {
        await signUp(data.email, data.password, {
          full_name: data.fullName
        });
        toast.success('Account created! Please check your email to verify your account.');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error('Failed to sign in with Google. Please try again.');
    }
  };

  const toggleMode = () => {
    setIsResetMode(false);
    reset();
    onModeChange?.(mode === 'signin' ? 'signup' : 'signin');
  };

  const handleResetMode = () => {
    setIsResetMode(true);
    reset();
  };

  const handleBackToLogin = () => {
    setIsResetMode(false);
    reset();
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            {isResetMode ? 'Reset Password' : mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-gray-400">
            {isResetMode 
              ? 'Enter your email to receive a password reset link'
              : mode === 'signin' 
                ? 'Sign in to your AdSpark account' 
                : 'Start generating amazing ad variations'
            }
          </p>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name - Only for signup */}
            {mode === 'signup' && !isResetMode && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  {...register('fullName', { 
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                  type="text"
                  className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-400">{errors.fullName.message}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className="w-full pl-10 pr-3 py-2 bg-dark border border-dark-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password - Not for reset mode */}
            {!isResetMode && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-10 py-2 bg-dark border border-dark-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors font-medium"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              <span>
                {isLoading 
                  ? 'Please wait...' 
                  : isResetMode 
                    ? 'Send Reset Link'
                    : mode === 'signin' 
                      ? 'Sign In' 
                      : 'Create Account'
                }
              </span>
            </button>
          </form>

          {/* Google Sign In - Not for reset mode */}
          {!isResetMode && (
            <>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dark-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-dark-surface text-gray-400">Or continue with</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                type="button"
                className="mt-4 w-full flex items-center justify-center space-x-2 bg-white hover:bg-gray-100 text-gray-900 px-4 py-3 rounded-lg transition-colors font-medium"
              >
                <Chrome className="w-5 h-5" />
                <span>Continue with Google</span>
              </button>
            </>
          )}

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            {isResetMode ? (
              <button
                onClick={handleBackToLogin}
                className="text-primary hover:text-primary/80 text-sm"
              >
                Back to sign in
              </button>
            ) : (
              <>
                {mode === 'signin' && (
                  <button
                    onClick={handleResetMode}
                    className="text-primary hover:text-primary/80 text-sm block w-full"
                  >
                    Forgot your password?
                  </button>
                )}
                <p className="text-gray-400 text-sm">
                  {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={toggleMode}
                    className="text-primary hover:text-primary/80"
                  >
                    {mode === 'signin' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Terms and Privacy */}
        {mode === 'signup' && !isResetMode && (
          <p className="text-center text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <a href="/terms" className="text-primary hover:text-primary/80">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-primary hover:text-primary/80">Privacy Policy</a>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
