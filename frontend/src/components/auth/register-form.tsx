import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegister } from '@/hooks/queries/use-auth-mutations';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['tenant', 'manager', 'technician']),
  phone: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const roles = [
  {
    value: 'tenant' as const,
    label: 'Tenant',
    description: 'Report & track maintenance issues',
    icon: '🏠',
    color: 'border-blue-500 bg-blue-50 ring-blue-500',
    iconBg: 'bg-blue-100',
  },
  {
    value: 'manager' as const,
    label: 'Manager',
    description: 'Manage properties & assign tasks',
    icon: '📋',
    color: 'border-purple-500 bg-purple-50 ring-purple-500',
    iconBg: 'bg-purple-100',
  },
  {
    value: 'technician' as const,
    label: 'Technician',
    description: 'Resolve maintenance requests',
    icon: '🔧',
    color: 'border-green-500 bg-green-50 ring-green-500',
    iconBg: 'bg-green-100',
  },
];

export function RegisterForm() {
  const navigate = useNavigate();
  const { mutateAsync: register, isPending } = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register: registerField,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'tenant',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      await register(data);
      navigate({ to: '/dashboard' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
        <p className="text-gray-600 mt-2">Select your role and sign up</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Role Selection Cards */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">I am a...</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {roles.map((role) => {
            const isSelected = selectedRole === role.value;
            return (
              <button
                key={role.value}
                type="button"
                onClick={() => setValue('role', role.value)}
                disabled={isPending}
                className={`relative flex flex-col items-center gap-2.5 rounded-xl border-2 p-5 text-center transition-all cursor-pointer ${
                  isSelected
                    ? `${role.color} ring-2 shadow-md`
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${isSelected ? role.iconBg : 'bg-gray-100'}`}>
                  <span className="text-2xl">{role.icon}</span>
                </div>
                <div className="space-y-1">
                  <span className={`text-sm font-semibold block ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                    {role.label}
                  </span>
                  <span className="text-xs leading-tight text-gray-600 block">
                    {role.description}
                  </span>
                </div>
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {errors.role && (
          <p className="text-sm text-red-600 mt-2">{errors.role.message}</p>
        )}
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1.5 block">
            Full Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            className="h-11 text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            {...registerField('name')}
            disabled={isPending}
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1.5 block">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="h-11 text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            {...registerField('email')}
            disabled={isPending}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1.5 block">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimum 6 characters"
              className="h-11 pr-10 text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              {...registerField('password')}
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Phone (Optional) */}
        <div>
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-1.5 block">
            Phone <span className="text-gray-400 font-normal">(optional)</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1234567890"
            className="h-11 text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            {...registerField('phone')}
            disabled={isPending}
          />
          {errors.phone && (
            <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
        disabled={isPending}
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Creating account...
          </span>
        ) : (
          'Create Account'
        )}
      </Button>

      {/* Login Link */}
      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => navigate({ to: '/login' })}
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
