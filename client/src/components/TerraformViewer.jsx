import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileCode2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import CopyButton from './CopyButton';
import { downloadFile, downloadTerraformFiles } from '../utils/downloadFile';

const FILE_TABS = ['main.tf', 'variables.tf', 'outputs.tf'];

export default function TerraformViewer({ terraformFiles }) {
  const [activeFile, setActiveFile] = useState('main.tf');

  if (!terraformFiles) return null;

  const currentCode = terraformFiles[activeFile] || '# No content generated for this file.';
  const hasAllFiles = FILE_TABS.some((f) => terraformFiles[f]);

  return (
    <div className="space-y-4">
      {/* File tabs + download */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1 p-1 bg-navy-950/50 rounded-lg border border-white/[0.06]">
          {FILE_TABS.map((file) => (
            <button
              key={file}
              onClick={() => setActiveFile(file)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all duration-200 ${
                activeFile === file
                  ? 'bg-violet-600/20 border border-violet-500/30 text-violet-300'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <FileCode2 size={11} />
              {file}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <CopyButton text={currentCode} />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => downloadFile(currentCode, activeFile, 'text/plain')}
            className="btn-secondary flex items-center gap-1.5 text-xs"
          >
            <Download size={13} />
            Download
          </motion.button>
          {hasAllFiles && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => downloadTerraformFiles(terraformFiles)}
              className="btn-primary flex items-center gap-1.5 text-xs px-3 py-2"
            >
              <Download size={13} />
              All Files
            </motion.button>
          )}
        </div>
      </div>

      {/* Code viewer */}
      <motion.div
        key={activeFile}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="code-block rounded-xl overflow-hidden border border-white/[0.06]"
      >
        <div className="flex items-center gap-2 px-4 py-2.5 bg-navy-900/80 border-b border-white/[0.06]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-amber-500/60" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
          </div>
          <span className="text-xs text-slate-600 font-mono ml-2">{activeFile}</span>
        </div>
        <SyntaxHighlighter
          language="hcl"
          style={vscDarkPlus}
          showLineNumbers
          wrapLongLines={false}
          customStyle={{
            margin: 0,
            padding: '16px',
            background: '#020817',
            fontSize: '12px',
            maxHeight: '520px',
            overflow: 'auto',
          }}
        >
          {currentCode}
        </SyntaxHighlighter>
      </motion.div>

      <p className="text-[11px] text-slate-600">
        Review and customize these files before running <code className="font-mono text-slate-500">terraform init && terraform plan</code>
      </p>
    </div>
  );
}
