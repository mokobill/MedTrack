import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Calendar, Mail, FileSpreadsheet, Users, Clock } from 'lucide-react';
import { format, startOfWeek, subWeeks } from 'date-fns';
import Button from '../ui/Button';
import Card from '../ui/Card';
import dataExportService from '../../utils/dataExportService';

const DataExportPanel: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [emailAddress, setEmailAddress] = useState('');
  
  const handleExportData = async () => {
    setIsExporting(true);
    
    try {
      const weekDate = new Date(selectedWeek);
      const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 });
      
      // Generate Excel file
      const excelBlob = dataExportService.exportWeeklyData(weekStart);
      const filename = dataExportService.generateFilename(weekStart);
      
      // Download the file
      dataExportService.downloadExcelFile(excelBlob, filename);
      
      // Show success message
      alert(`Data exported successfully! File: ${filename}`);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleEmailExport = () => {
    if (!emailAddress) {
      alert('Please enter an email address');
      return;
    }
    
    // Since this is a client-side app, we'll show instructions for manual email
    const weekDate = new Date(selectedWeek);
    const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 });
    const filename = dataExportService.generateFilename(weekStart);
    
    alert(`To email the report:
1. First click "Export Data" to download the Excel file
2. Manually attach the downloaded file (${filename}) to an email
3. Send to: ${emailAddress}

Note: Automatic email sending requires server-side functionality.`);
  };
  
  // Generate week options (current week + 4 previous weeks)
  const weekOptions = Array.from({ length: 5 }, (_, i) => {
    const weekDate = subWeeks(new Date(), i);
    const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 });
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    return {
      value: format(weekStart, 'yyyy-MM-dd'),
      label: `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd, yyyy')}`,
      isCurrent: i === 0
    };
  });
  
  return (
    <Card className="p-6">
      <div className="flex items-center mb-6">
        <FileSpreadsheet className="text-primary-600 mr-3" size={24} />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Data Export</h2>
          <p className="text-gray-500 text-sm">Export all users' Mediterranean diet tracking data</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Week Selection */}
        <div>
          <label htmlFor="week-select" className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline mr-2" size={16} />
            Select Week to Export
          </label>
          <select
            id="week-select"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="input w-full"
          >
            {weekOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} {option.isCurrent ? '(Current Week)' : ''}
              </option>
            ))}
          </select>
        </div>
        
        {/* Export Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Download Export</h3>
            <Button
              variant="primary"
              fullWidth
              onClick={handleExportData}
              disabled={isExporting}
              icon={isExporting ? <Clock size={16} className="animate-spin" /> : <Download size={16} />}
            >
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
            <p className="text-xs text-gray-500">
              Downloads an Excel file with all users' data for the selected week
            </p>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Email Setup</h3>
            <input
              type="email"
              placeholder="your-email@example.com"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="input w-full"
            />
            <Button
              variant="outline"
              fullWidth
              onClick={handleEmailExport}
              icon={<Mail size={16} />}
            >
              Email Instructions
            </Button>
            <p className="text-xs text-gray-500">
              Get instructions for emailing the exported data
            </p>
          </div>
        </div>
        
        {/* Export Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Users className="mr-2" size={16} />
            Export Contents
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Summary sheet with all users' compliance percentages</li>
            <li>• Individual detailed sheets for each user</li>
            <li>• Consolidated daily nutrition data</li>
            <li>• Consolidated weekly nutrition and exercise data</li>
            <li>• Daily goals: Fruits (3), Vegetables (2), Olive Oil (4), Nuts (1)</li>
            <li>• Weekly goals: Fish (3), Legumes (3), Resistance Training (2)</li>
          </ul>
        </div>
        
        {/* Manual Email Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Email Delivery Note</h3>
          <p className="text-sm text-blue-700">
            Since this is a client-side application, automatic email sending isn't available. 
            The system will generate the Excel file for download, which you can then manually 
            attach to an email and send to your desired address.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default DataExportPanel;