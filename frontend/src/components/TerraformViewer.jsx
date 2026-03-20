import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Download, Copy, Check } from 'lucide-react';

const TerraformViewer = ({ files }) => {
  const [activeFile, setActiveFile] = useState('main.tf');
  const [copied, setCopied] = useState(false);

  const fileNames = Object.keys(files);

  const handleCopy = () => {
    navigator.clipboard.writeText(files[activeFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = () => {
    // Basic single file download for simplicity right now
    const blob = new Blob([files[activeFile]], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
        <div className="flex space-x-2">
          {fileNames.map(fileName => (
            <button
              key={fileName}
              onClick={() => setActiveFile(fileName)}
              className={`px-3 py-1.5 text-sm rounded-md font-mono transition-colors ${
                activeFile === fileName 
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {fileName}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={handleCopy} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors" title="Copy code">
            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
          </button>
          <button onClick={handleDownloadZip} className="flex items-center space-x-2 text-sm bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-200 transition-colors">
            <Download size={16} /> <span>Download {activeFile}</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto bg-slate-950 p-4">
        <SyntaxHighlighter
          language="hcl"
          style={vscDarkPlus}
          customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
          showLineNumbers={true}
        >
          {files[activeFile] || '# No content'}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default TerraformViewer;
