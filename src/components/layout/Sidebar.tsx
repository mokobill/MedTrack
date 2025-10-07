import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const sidebarVariants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: { x: 0, opacity: 1 },
  };
  
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 z-20 md:hidden"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar for mobile (hidden by default, shown when open) */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-30 md:hidden"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sidebarVariants}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-primary-900">MedTrack</h2>
              <Button variant="text" onClick={onClose} aria-label="Close menu">
                <X size={20} />
              </Button>
            </div>
            <nav className="p-4">
              <SidebarLinks onLinkClick={onClose} />
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
      
      {/* Desktop Sidebar (always visible) */}
      <aside className="hidden md:block w-64 min-h-screen border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-primary-900">MedTrack</h2>
        </div>
        <nav className="p-4">
          <SidebarLinks />
        </nav>
      </aside>
    </>
  );
};

interface SidebarLinksProps {
  onLinkClick?: () => void;
}

const SidebarLinks: React.FC<SidebarLinksProps> = ({ onLinkClick }) => {
  const links = [
    { to: '/', label: 'Today' },
    { to: '/exercise', label: 'Exercise' },
    { to: '/progress', label: 'Progress' },
    { to: '/settings', label: 'Settings' },
  ];
  
  return (
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.to}>
          <NavLink
            to={link.to}
            className={({ isActive }) => 
              `block px-4 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
            onClick={onLinkClick}
          >
            {link.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

export default Sidebar;