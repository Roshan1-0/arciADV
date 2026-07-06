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
    <div className="flex flex-col h-full bg-space-indigo-300 rounded-xl overflow-hidden border border-dusty-grape-400">
      {/* Tab Bar */}
      <div className="flex items-center justify-between border-b border-dusty-grape-400 bg-space-indigo-500 px-4 py-2">
        <div className="flex space-x-2">
          {fileNames.map(fileName => (
            <button
              key={fileName}
              onClick={() => setActiveFile(fileName)}
              className={`px-3 py-1.5 text-sm rounded-md font-mono transition-colors ${
                activeFile === fileName
                  ? 'bg-almond-silk-100/30 text-almond-silk border border-almond-silk-300/30'
                  : 'text-lilac-ash-500 hover:text-parchment hover:bg-dusty-grape-300/50'
              }`}
            >
              {fileName}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-dusty-grape-300/50 rounded-lg text-lilac-ash-500 hover:text-parchment transition-colors"
            title="Copy code"
          >
            {copied
              ? <Check size={16} className="text-almond-silk" />
              : <Copy size={16} />
            }
          </button>
          <button
            onClick={handleDownloadZip}
            className="flex items-center space-x-2 text-sm bg-dusty-grape-400 hover:bg-dusty-grape-500 px-3 py-1.5 rounded-lg text-parchment transition-colors"
          >
            <Download size={16} /> <span>Download {activeFile}</span>
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="flex-1 overflow-auto bg-space-indigo-300 p-4">
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
