import React, { useState } from 'react';
import { X, User, Building, Key, Mail, Globe, Calendar, MapPin, Edit3, Server, AtSign, Box, Phone } from 'lucide-react';
import { MockType } from '../types';
import { Button } from './Button';

interface ReplacementModalProps {
  originalText: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: MockType, customValue?: string) => void;
}

export const ReplacementModal: React.FC<ReplacementModalProps> = ({
  originalText,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [customValue, setCustomValue] = useState('');

  if (!isOpen) return null;

  const options = [
    { type: MockType.PERSON, icon: <User size={18} />, label: 'Person Name', example: '[PERSON_1]' },
    { type: MockType.ORGANIZATION, icon: <Building size={18} />, label: 'Organization', example: '[ORG_A]' },
    { type: MockType.HOST, icon: <Globe size={18} />, label: 'Host/Domain', example: 'example.com' },
    { type: MockType.SYSTEM_NAME, icon: <Box size={18} />, label: 'System/Module', example: '[PAYMENT_SVC]' },
    { type: MockType.SOCIAL_HANDLE, icon: <AtSign size={18} />, label: 'Social Handle', example: '@username' },
    { type: MockType.PHONE, icon: <Phone size={18} />, label: 'Phone', example: '+1-555-0199' },
    { type: MockType.API_KEY, icon: <Key size={18} />, label: 'Secret/Key', example: '[SECRET_KEY]' },
    { type: MockType.EMAIL, icon: <Mail size={18} />, label: 'Email', example: 'user@example.com' },
    { type: MockType.IP_ADDRESS, icon: <Server size={18} />, label: 'IP Address', example: '192.168.X.X' },
    { type: MockType.DATE, icon: <Calendar size={18} />, label: 'Date', example: '20XX-XX-XX' },
    { type: MockType.LOCATION, icon: <MapPin size={18} />, label: 'Location', example: '[LOCATION_1]' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Anonymize Data</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select how to mask: <span className="font-mono bg-amber-100 text-amber-800 px-1 rounded">{originalText}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {options.map((opt) => (
              <button
                key={opt.type}
                onClick={() => onConfirm(opt.type)}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50 transition-all group h-24"
              >
                <div className="text-slate-500 group-hover:text-brand-600 mb-2">{opt.icon}</div>
                <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                <span className="text-[10px] text-slate-400 mt-1 truncate w-full text-center">{opt.example}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100">
             <div className="flex items-center gap-2 mb-2">
                <Edit3 size={16} className="text-slate-500"/>
                <span className="text-sm font-medium text-slate-700">Custom Replacement</span>
             </div>
             <div className="flex gap-2">
               <input 
                 type="text" 
                 value={customValue}
                 onChange={(e) => setCustomValue(e.target.value)}
                 placeholder="e.g., [MY_CUSTOM_MOCK]"
                 className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
               />
               <Button 
                 onClick={() => onConfirm(MockType.CUSTOM, customValue)}
                 disabled={!customValue.trim()}
                 size="sm"
               >
                 Apply
               </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};