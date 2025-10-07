import React, { useState, useEffect } from 'react';
import { loadState, saveState, clearState } from '../utils/localStorage';
import { getCurrentUser } from '../utils/authService';
import DataExportPanel from '../components/admin/DataExportPanel';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Trash2, Save, AlertTriangle } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [appState, setAppState] = useState(loadState());
  const [confirmReset, setConfirmReset] = useState(false);
  const currentUser = getCurrentUser();
  const isAdmin = currentUser === 'admin';
  
  const handleReset = () => {
    if (confirmReset) {
      clearState();
      window.location.reload();
    } else {
      setConfirmReset(true);
      // Auto-reset confirmation after 5 seconds
      setTimeout(() => {
        setConfirmReset(false);
      }, 5000);
    }
  };
  
  return (
    <div className="pb-12 max-w-3xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your preferences and account</p>
      </header>
      
      <Card className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Preferences</h2>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={currentUser || ''}
              className="input w-full bg-gray-50"
              disabled
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={appState.settings.name}
              onChange={(e) => {
                const newState = { ...appState };
                newState.settings.name = e.target.value;
                setAppState(newState);
                saveState(newState);
              }}
              className="input w-full"
              placeholder="Enter your name"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="notifications" className="block text-sm font-medium text-gray-700">
                Enable Notifications
              </label>
              <button
                type="button"
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  appState.settings.notifications.enabled ? 'bg-primary-600' : 'bg-gray-200'
                }`}
                onClick={() => {
                  const newState = { ...appState };
                  newState.settings.notifications.enabled = !newState.settings.notifications.enabled;
                  setAppState(newState);
                  saveState(newState);
                }}
              >
                <span 
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    appState.settings.notifications.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} 
                />
              </button>
            </div>
            {appState.settings.notifications.enabled ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                <p className="text-sm text-blue-700">
                  You'll receive 3-5 random reminders daily between 8 AM and 9 PM about your Mediterranean diet goals.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Receive random reminders about your Mediterranean diet and exercise goals
              </p>
            )}
          </div>
        </div>
      </Card>
      
      <Card className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Data Management</h2>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Your data is stored locally on your device. No information is sent to any server.
          </p>
          
          {confirmReset ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="text-red-500 mt-0.5 mr-3" size={20} />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Are you sure?</h3>
                  <p className="mt-1 text-sm text-red-700">
                    This will permanently delete all YOUR tracking data and settings. This action cannot be undone.
                  </p>
                  <div className="mt-3 flex space-x-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setConfirmReset(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                      onClick={handleReset}
                    >
                      Yes, Reset My Data
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Button 
              variant="outline" 
              icon={<Trash2 size={16} className="text-red-500" />}
              onClick={handleReset}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              Reset My Data
            </Button>
          )}
        </div>
      </Card>
      
      {isAdmin && (
        <>
          <DataExportPanel />
        </>
      )}
      
      <Card>
        <h2 className="text-lg font-medium text-gray-900 mb-4">About</h2>
        
        <div className="space-y-3 text-sm text-gray-500">
          <p>
            MedTrack - Mediterranean Diet & Fitness Tracker
          </p>
          <p>
            Based on the PREDIMED study guidelines for Mediterranean diet adherence.
          </p>
          <p>
            Version: 1.0.0
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;