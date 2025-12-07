import React, { useState, useRef, useCallback } from 'react';
import { 
  Shield, 
  Save, 
  Upload, 
  Trash2, 
  ArrowRight, 
  FileJson,
  Lock,
  Eye,
  Copy,
  X as XIcon,
  Undo,
  Redo,
  Smartphone,
  Mail,
  Server,
  Globe,
  Zap
} from 'lucide-react';
import { findPhoneNumbersInText } from 'libphonenumber-js';
import { Button } from './components/Button';
import { ReplacementModal } from './components/ReplacementModal';
import { MockType, ReplacementRule } from './types';

function App() {
  // --- State ---
  const [rawText, setRawText] = useState('');
  
  // History State for Undo/Redo
  const [history, setHistory] = useState<ReplacementRule[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Derived current rules from history
  const rules = history[historyIndex];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- Handlers: History Management ---

  const updateRulesWithHistory = (newRules: ReplacementRule[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newRules);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  // --- Handlers: Text Selection ---

  const handleTextSelect = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selected = rawText.substring(start, end);
      if (selected.trim().length > 0) {
        setSelectedText(selected);
        setSelectionRange({ start, end });
      }
    }
  };

  const openReplacementModal = () => {
    if (selectedText && selectionRange) {
      setIsModalOpen(true);
    }
  };

  // --- Handlers: Rules Management ---

  const generateMockValue = (type: MockType, original: string, existingRules: ReplacementRule[], countOverride?: number): string => {
    const count = countOverride !== undefined ? countOverride : existingRules.filter(r => r.type === type).length + 1;
    
    switch (type) {
      case MockType.PERSON: return `[PERSON_${count}]`;
      case MockType.ORGANIZATION: return `[ORG_${count}]`;
      case MockType.API_KEY: return `[SECRET_KEY_${count}]`;
      case MockType.EMAIL: return `[EMAIL_${count}]`;
      case MockType.IP_ADDRESS: return `192.168.x.${count}`;
      case MockType.DATE: return `20XX-XX-XX`;
      case MockType.LOCATION: return `[LOCATION_${count}]`;
      case MockType.HOST: return `host-${count}.example.com`;
      case MockType.SYSTEM_NAME: return `[SYSTEM_${count}]`;
      case MockType.SOCIAL_HANDLE: return `[@user_${count}]`;
      case MockType.PHONE: return `+1-555-01${count.toString().padStart(2, '0')}`;
      default: return `[REDACTED]`;
    }
  };

  const addRule = (type: MockType, customValue?: string) => {
    if (!selectedText) return;

    const replacement = customValue || generateMockValue(type, selectedText, rules);
    
    const newRule: ReplacementRule = {
      id: Math.random().toString(36).substring(7),
      original: selectedText,
      replacement,
      type
    };

    // Remove any existing rule for this exact original text to update it
    const filteredRules = rules.filter(r => r.original !== selectedText);
    updateRulesWithHistory([...filteredRules, newRule]);
    
    setIsModalOpen(false);
    setSelectionRange(null);
    setSelectedText('');
  };

  const removeRule = (id: string) => {
    updateRulesWithHistory(rules.filter(r => r.id !== id));
  };

  const clearRules = () => {
    if (rules.length > 0) {
      updateRulesWithHistory([]);
    }
  };

  // --- Auto Masking Handlers ---
  
  const handleAutoMask = (type: MockType, finder: (text: string) => string[]) => {
    if (!rawText) return;

    const matches = finder(rawText);
    // Filter duplicates and matches that are already in rules
    const uniqueMatches = [...new Set(matches)].filter(
      match => !rules.some(r => r.original === match)
    );

    if (uniqueMatches.length === 0) return;

    let currentRules = [...rules];
    let typeCount = currentRules.filter(r => r.type === type).length;

    const newRules: ReplacementRule[] = uniqueMatches.map(match => {
      typeCount++;
      return {
        id: Math.random().toString(36).substring(7),
        original: match,
        replacement: generateMockValue(type, match, currentRules, typeCount),
        type: type
      };
    });

    updateRulesWithHistory([...currentRules, ...newRules]);
  };

  const autoMaskShortcuts = [
    {
      label: 'Phone',
      type: MockType.PHONE,
      icon: <Smartphone size={14} />,
      finder: (text: string) => {
        // Use 'US' as a default country to better detect formats like (555) 123-4567 
        // that are common in business docs even if not strictly international.
        // findPhoneNumbersInText handles international numbers (+...) automatically.
        const results = findPhoneNumbersInText(text, 'US');
        return results.map(result => text.substring(result.startsAt, result.endsAt));
      }
    },
    {
      label: 'Email',
      type: MockType.EMAIL,
      icon: <Mail size={14} />,
      finder: (text: string) => {
        const regex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
        return Array.from(text.matchAll(regex)).map(m => m[0]);
      }
    },
    {
      label: 'IPv4',
      type: MockType.IP_ADDRESS,
      icon: <Server size={14} />,
      finder: (text: string) => {
        const regex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
        return Array.from(text.matchAll(regex)).map(m => m[0]);
      }
    },
    {
      label: 'IPv6',
      type: MockType.IP_ADDRESS,
      icon: <Server size={14} />,
      finder: (text: string) => {
        const regex = /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/gi;
        return Array.from(text.matchAll(regex)).map(m => m[0]);
      }
    },
    {
      label: 'Host',
      type: MockType.HOST,
      icon: <Globe size={14} />,
      finder: (text: string) => {
        const regex = /\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}\b/g;
        return Array.from(text.matchAll(regex)).map(m => m[0]);
      }
    }
  ];

  const loadConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json.rules)) {
          // Merge logic: Don't duplicate if original exists
          const currentOriginals = new Set(rules.map(r => r.original));
          const newRules = (json.rules as ReplacementRule[]).filter(r => !currentOriginals.has(r.original));
          updateRulesWithHistory([...rules, ...newRules]);
        }
      } catch (err) {
        alert("Invalid configuration file");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const saveConfig = () => {
    const data = JSON.stringify({ rules, version: "1.0", createdAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'safe-analyst-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Core Logic: Sanitization (Text only for clipboard) ---

  const getSanitizedTextString = useCallback(() => {
    let text = rawText;
    const sortedRules = [...rules].sort((a, b) => b.original.length - a.original.length);

    sortedRules.forEach(rule => {
      const escapedOriginal = rule.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedOriginal, 'g');
      text = text.replace(regex, rule.replacement);
    });
    return text;
  }, [rawText, rules]);

  // --- Core Logic: Render with Highlights ---

  const renderSanitizedOutput = () => {
    if (!rawText) return <span className="text-slate-400 italic">Sanitized output will appear here...</span>;
    if (rules.length === 0) return rawText;

    const sortedRules = [...rules].sort((a, b) => b.original.length - a.original.length);
    
    // Create regex pattern that matches any of the original strings
    // We use capturing group () to include the separators in the split result
    const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const patternString = `(${sortedRules.map(r => escapeRegExp(r.original)).join('|')})`;
    const regex = new RegExp(patternString, 'g');

    // Split text by the regex. Because of capturing group, matches are included in the array.
    const parts = rawText.split(regex);

    return parts.map((part, index) => {
      // Find if this part corresponds to a rule
      const rule = sortedRules.find(r => r.original === part);
      
      if (rule) {
        return (
          <span 
            key={index} 
            className="bg-emerald-100 text-emerald-700 font-bold px-1 rounded-sm border border-emerald-200 cursor-help transition-all hover:bg-emerald-200 select-all" 
            title={`Original: ${rule.original} (${rule.type})`}
          >
            {rule.replacement}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // --- Render ---

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shadow-sm z-10 h-16 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white shadow-brand-200">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">SafeAnalyst <span className="text-brand-600">Sanitizer</span></h1>
            <p className="text-xs text-slate-500 font-medium">NDA Compliant Data Masking</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
             <button 
                onClick={handleUndo} 
                disabled={historyIndex === 0}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                title="Undo Rule Change"
             >
                <Undo size={16} />
             </button>
             <button 
                onClick={handleRedo} 
                disabled={historyIndex === history.length - 1}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                title="Redo Rule Change"
             >
                <Redo size={16} />
             </button>
          </div>
          <div className="h-6 w-px bg-slate-300 mx-1"></div>
          <div className="flex gap-2">
             <label className="cursor-pointer inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                <Upload size={16} className="mr-2" />
                Load Config
                <input type="file" accept=".json" onChange={loadConfig} className="hidden" />
             </label>
             <Button variant="secondary" size="sm" onClick={saveConfig} disabled={rules.length === 0} icon={<Save size={16}/>}>
                Save Config
             </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col md:flex-row flex-1 overflow-hidden">
        
        {/* Left Panel: Raw Input & Rules */}
        <div className="flex flex-col border-b md:border-b-0 md:border-r border-slate-200 bg-white w-full md:w-1/2 flex-1 min-h-0">
          
          <div className="px-6 py-2 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                 <Zap size={14} className="text-amber-500" /> Quick Auto-Mask
              </h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {autoMaskShortcuts.map((shortcut) => (
                <button
                  key={shortcut.label}
                  onClick={() => handleAutoMask(shortcut.type, shortcut.finder)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-colors whitespace-nowrap shadow-sm"
                  title={`Automatically find and mask ${shortcut.label}`}
                >
                  {shortcut.icon}
                  {shortcut.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between px-6 py-2 border-b border-slate-100 bg-white shrink-0">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Lock size={16} /> Raw Input
            </h2>
            {selectedText && (
              <Button size="sm" onClick={openReplacementModal} className="animate-in fade-in zoom-in">
                Anonymize Selection
              </Button>
            )}
          </div>
          
          <div className="flex-1 relative min-h-0">
            <textarea
              ref={textareaRef}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              onSelect={handleTextSelect}
              placeholder="Paste sensitive text here...&#10;Then use the Quick Buttons above or select text manually."
              className="h-full w-full resize-none p-6 text-base leading-relaxed text-slate-800 focus:outline-none font-mono"
            />
          </div>

          {/* Active Rules List */}
          <div className="h-48 shrink-0 border-t border-slate-200 bg-slate-50 flex flex-col">
            <div className="px-4 py-2 border-b border-slate-200 flex justify-between items-center bg-white h-10 shrink-0">
              <span className="text-xs font-semibold text-slate-500 uppercase">Active Replacement Rules ({rules.length})</span>
              <button onClick={clearRules} disabled={rules.length === 0} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                <Trash2 size={12}/> Clear All
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {rules.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <FileJson size={24} className="mb-2 opacity-50"/>
                  <p className="text-sm">No rules defined.</p>
                  <p className="text-xs">Use Quick Buttons or select text to start.</p>
                </div>
              ) : (
                rules.slice().reverse().map(rule => (
                  <div key={rule.id} className="flex items-center justify-between bg-white px-3 py-2 rounded border border-slate-200 shadow-sm text-sm group animate-in fade-in slide-in-from-right-4 duration-200">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="font-mono text-red-600 truncate max-w-[120px]" title={rule.original}>{rule.original}</span>
                      <ArrowRight size={14} className="text-slate-400 flex-shrink-0" />
                      <span className="font-mono text-green-600 truncate max-w-[120px]" title={rule.replacement}>{rule.replacement}</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] uppercase border border-slate-200">
                        {rule.type}
                      </span>
                    </div>
                    <button onClick={() => removeRule(rule.id)} className="text-slate-400 hover:text-red-500 p-1">
                      <XIcon size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Sanitized Output */}
        <div className="flex flex-col bg-slate-50 w-full md:w-1/2 flex-1 min-h-0">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white h-14 shrink-0">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-600 flex items-center gap-2">
              <Eye size={16} /> Sanitized Preview
            </h2>
            <div className="flex items-center gap-2">
               <button 
                 onClick={() => navigator.clipboard.writeText(getSanitizedTextString())}
                 className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors bg-slate-100 hover:bg-brand-50 px-3 py-1.5 rounded-md"
                 title="Copy Sanitized Text"
               >
                 <Copy size={14} /> Copy
               </button>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-hidden relative">
             <div className="absolute inset-0 p-6">
                <div className="h-full bg-white p-6 rounded-xl border border-slate-200 font-mono text-sm leading-relaxed whitespace-pre-wrap text-slate-700 shadow-sm overflow-auto">
                  {renderSanitizedOutput()}
                </div>
             </div>
          </div>
        </div>
      </main>

      <ReplacementModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        originalText={selectedText}
        onConfirm={addRule}
      />
    </div>
  );
}

export default App;