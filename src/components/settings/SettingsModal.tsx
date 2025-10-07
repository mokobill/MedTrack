import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { UserSettings } from '../../types';
import { loadState, saveState } from '../../utils/localStorage';
import notificationService from '../../utils/notificationService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<UserSettings>(loadState().settings);

  useEffect(() => {
    if (isOpen) {
      setSettings(loadState().settings);
    }
  }, [isOpen]);

  const handleSave = () => {
    const state = loadState();
    state.settings = settings;
    saveState(state);
    
    // Update notification schedule
    if (settings.notifications.enabled) {
      notificationService.requestPermission().then((granted) => {
        if (granted) {
          notificationService.scheduleNotifications(settings, state.foodItems);
        }
      });
    } else {
      notificationService.clearScheduledNotifications();
    }
    
    onClose();
  };

  const handleToggleNotifications = () => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        enabled: !prev.notifications.enabled,
      },
    }));
  };


  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev) => ({
      ...prev,
      name: e.target.value,
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Settings</h2>
                <Button variant="text" onClick={onClose} aria-label="Close settings">
                  <X size={20} />
                </Button>
              </div>
              
              <div className="p-4 space-y-6">
                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={settings.name}
                      onChange={handleNameChange}
                      className="input w-full"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>
                
                {/* Notification Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notifications</h3>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Enable Notifications</span>
                    <button
                      type="button"
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        settings.notifications.enabled ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                      onClick={handleToggleNotifications}
                    >
                      <span 
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          settings.notifications.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`} 
                      />
                    </button>
                  </div>
                  
                  {settings.notifications.enabled && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-700">
                        You'll receive 3-5 random reminders daily between 8 AM and 9 PM about your Mediterranean diet goals.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;