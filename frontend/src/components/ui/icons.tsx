/**
 * UI ICONS COMPONENT
 * 
 * Centralized icon system using Lucide React icons.
 * This approach provides:
 * - Type safety for icon names
 * - Consistent styling across the app
 * - Easy icon replacement/customization
 */

import {
  Loader2,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Chrome,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react';

export type Icon = LucideIcon;

export const Icons = {
  // Loading states
  spinner: Loader2,
  
  // Authentication
  mail: Mail,
  phone: Phone,
  eye: Eye,
  eyeOff: EyeOff,
  google: Chrome, // Using Chrome icon for Google
  
  // Feedback
  error: AlertCircle,
  success: CheckCircle2,
  close: X,
  
  // Navigation
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  
  // User interface
  user: User,
  settings: Settings,
  logout: LogOut,
} as const;

export type IconName = keyof typeof Icons;