import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Settings, Menu, LogOut } from 'lucide-react';
import Button from '../ui/Button';
import { logout } from '../../utils/authService';

interface HeaderProps {
  title: string;
  onToggleMenu: () => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onToggleMenu, onOpenSettings }) => {
  const handleLogout = () => {
    if (confirm('Are you sure you want to sign out?')) {
      logout();
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="text" 
            className="md:hidden mr-2" 
            onClick={onToggleMenu}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </Button>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-xl font-semibold text-primary-900">{title}</h1>
          </motion.div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="text" 
            aria-label="Notifications"
            icon={<Bell size={20} />}
          />
          <Button 
            variant="text" 
            aria-label="Settings"
            icon={<Settings size={20} />}
            onClick={onOpenSettings}
          />
          <Button 
            variant="text" 
            aria-label="Sign Out"
            icon={<LogOut size={20} />}
            onClick={handleLogout}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;