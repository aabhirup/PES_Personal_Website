import React, { useState } from 'react';
import {
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  FileJson,
  X,
  HardDrive,
  Cloud,
} from 'lucide-react';
import {
  exportAllDataAsJSON,
  importAllDataFromJSON,
} from '../utils/storage';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
  stats: {
    tasksCount: number;
    clubsCount: number;
    habitsCount: number;
    projectsCount: number;
    notesCount: number;
  };
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
  stats,
}) => {
  const [importJsonText, setImportJsonText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [hasCopied, setHasCopied] = useState(false);

  if (!isOpen) return null;

  // Handle Download JSON
  const handleDownloadBackup = () => {
    const jsonString = exportAllDataAsJSON();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_hub_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMessage({ type: 'success', text: 'Backup downloaded successfully!' });
  };

  // Handle Copy JSON to Clipboard
  const handleCopyBackup = async () => {
    try {
      const jsonString = exportAllDataAsJSON();
      await navigator.clipboard.writeText(jsonString);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
      setStatusMessage({ type: 'success', text: 'Data copied to clipboard!' });
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to copy to clipboard.' });
    }
  };

  // Handle Import JSON
  const handleImportBackup = () => {
    if (!importJsonText.trim()) {
      setStatusMessage({ type: 'error', text: 'Please paste valid JSON data to restore.' });
      return;
    }

    const success = importAllDataFromJSON(importJsonText);
    if (success) {
      setStatusMessage({ type: 'success', text: 'All data restored successfully!' });
      setImportJsonText('');
      setTimeout(() => {
        onDataRestored();
        onClose();
      }, 800);
    } else {
      setStatusMessage({
        type: 'error',
        text: 'Invalid backup format. Please verify the JSON string and try again.',
      });
    }
  };

  // Handle File Input Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setImportJsonText(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Data Storage & Backup</h3>
              <p className="text-xs text-zinc-400">Export or restore your local storage database</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Local Storage Summary */}
        <div className="grid grid-cols-5 gap-2 p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-center">
          <div>
            <span className="block text-[10px] text-zinc-500 font-medium">Tasks</span>
            <span className="text-sm font-bold text-white">{stats.tasksCount}</span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-500 font-medium">Clubs</span>
            <span className="text-sm font-bold text-white">{stats.clubsCount}</span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-500 font-medium">Habits</span>
            <span className="text-sm font-bold text-white">{stats.habitsCount}</span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-500 font-medium">Goals</span>
            <span className="text-sm font-bold text-white">{stats.projectsCount}</span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-500 font-medium">Notes</span>
            <span className="text-sm font-bold text-white">{stats.notesCount}</span>
          </div>
        </div>

        {/* Feedback message */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Export section */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Export Local Data
          </h4>
          <p className="text-xs text-zinc-500">
            Save a full snapshot of your tasks, habits, clubs, projects, and notes to your computer or cloud drive.
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadBackup}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON Backup</span>
            </button>

            <button
              onClick={handleCopyBackup}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {hasCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{hasCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Import section */}
        <div className="space-y-2 pt-3 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Restore / Import Backup
            </h4>
            <label className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer">
              Upload .json file
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            rows={3}
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            placeholder="Paste your backup JSON here..."
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
          />

          <button
            onClick={handleImportBackup}
            disabled={!importJsonText.trim()}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-750 disabled:opacity-40 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Restore Data to Browser</span>
          </button>
        </div>
      </div>
    </div>
  );
};
