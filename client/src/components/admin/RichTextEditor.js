import React, { useRef, useState, useEffect } from 'react';
import {
  FiBold, FiItalic, FiUnderline, FiList, FiLink, FiCode,
  FiAlignLeft, FiAlignCenter, FiAlignRight, FiAlignJustify,
  FiRotateCcw, FiRotateCw, FiTrash2, FiEye, FiEdit3, FiSliders,
  FiCheck, FiExternalLink, FiHelpCircle
} from 'react-icons/fi';

export default function RichTextEditor({ value, onChange, placeholder = 'Write your article content here...' }) {
  const editorRef = useRef(null);
  const [mode, setMode] = useState('visual'); // 'visual' | 'html' | 'preview'
  const [htmlContent, setHtmlContent] = useState(value || '');
  const [linkModal, setLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [selectedRange, setSelectedRange] = useState(null);

  // Sync external value changes
  useEffect(() => {
    if (value !== htmlContent) {
      setHtmlContent(value || '');
      if (editorRef.current && mode === 'visual' && editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  // Handle visual editor input
  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setHtmlContent(html);
      onChange(html);
    }
  };

  // Execute formatting command
  const execCmd = (command, val = null) => {
    if (mode !== 'visual') return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, val);
    handleEditorInput();
  };

  const setHeading = (tag) => {
    execCmd('formatBlock', `<${tag}>`);
  };

  // Link dialog
  const openLinkDialog = () => {
    if (window.getSelection) {
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        setSelectedRange(sel.getRangeAt(0));
        setLinkText(sel.toString());
      }
    }
    setLinkUrl('');
    setLinkModal(true);
  };

  const applyLink = () => {
    if (!linkUrl) return;
    if (selectedRange && window.getSelection) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(selectedRange);
    }
    execCmd('createLink', linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`);
    setLinkModal(false);
  };

  // Switch modes
  const handleModeChange = (newMode) => {
    if (mode === 'visual' && editorRef.current) {
      const html = editorRef.current.innerHTML;
      setHtmlContent(html);
      onChange(html);
    }
    setMode(newMode);
  };

  // Text stats
  const plainText = (htmlContent || '').replace(/<[^>]+>/g, ' ').trim();
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;
  const charCount = plainText.length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-sm focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
      {/* Editor Header / Toolbar */}
      <div className="bg-slate-100/80 border-b border-slate-200 p-2 flex flex-wrap items-center justify-between gap-2">
        {/* Formatting Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings Dropdown */}
          <select
            onChange={(e) => {
              if (e.target.value) setHeading(e.target.value);
              e.target.value = '';
            }}
            disabled={mode !== 'visual'}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            defaultValue=""
          >
            <option value="" disabled>Style / Heading</option>
            <option value="p">Normal Paragraph</option>
            <option value="h1">Heading 1 (Large)</option>
            <option value="h2">Heading 2 (Medium)</option>
            <option value="h3">Heading 3 (Small)</option>
            <option value="blockquote">Blockquote</option>
            <option value="pre">Code Block</option>
          </select>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          {/* Inline styles */}
          <button
            type="button"
            title="Bold (Ctrl+B)"
            onClick={() => execCmd('bold')}
            disabled={mode !== 'visual'}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 active:bg-slate-300 disabled:opacity-40 transition-colors"
          >
            <FiBold size={14} />
          </button>
          <button
            type="button"
            title="Italic (Ctrl+I)"
            onClick={() => execCmd('italic')}
            disabled={mode !== 'visual'}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 active:bg-slate-300 disabled:opacity-40 transition-colors"
          >
            <FiItalic size={14} />
          </button>
          <button
            type="button"
            title="Underline (Ctrl+U)"
            onClick={() => execCmd('underline')}
            disabled={mode !== 'visual'}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 active:bg-slate-300 disabled:opacity-40 transition-colors"
          >
            <FiUnderline size={14} />
          </button>
          <button
            type="button"
            title="Strikethrough"
            onClick={() => execCmd('strikeThrough')}
            disabled={mode !== 'visual'}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 active:bg-slate-300 disabled:opacity-40 text-xs font-bold transition-colors"
          >
            <s>S</s>
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            title="Align Left"
            onClick={() => execCmd('justifyLeft')}
            disabled={mode !== 'visual'}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 active:bg-slate-300 disabled:opacity-40 transition-colors"
          >
            <FiAlignLeft size={14} />
          </button>
          <button
            type="button"
            title="Align Center"
            onClick={() => execCmd('justifyCenter')}
            disabled={mode !== 'visual'}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 active:bg-slate-300 disabled:opacity-40 transition-colors"
          >
            <FiAlignCenter size={14} />
          </button>
          <button
            type="button"
            title="Align Right"
            onClick={() => execCmd('justifyRight')}
            disabled={mode !== 'visual'}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 active:bg-slate-300 disabled:opacity-40 transition-colors"
          >
            <FiAlignRight size={14} />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          {/* Lists */}
          <button
            type="button"
            title="Bulleted List"
            onClick={() => execCmd('insertUnorderedList')}
            disabled={mode !== 'visual'}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 active:bg-slate-300 disabled:opacity-40 transition-colors"
          >
            <FiList size={14} />
          </button>
          <button
            type="button"
            title="Numbered List"
            onClick={() => execCmd('insertOrderedList')}
            disabled={mode !== 'visual'}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 active:bg-slate-300 disabled:opacity-40 text-xs font-bold transition-colors"
          >
            1.
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          {/* Insert Link / HR */}
          <button
            type="button"
            title="Insert Link"
            onClick={openLinkDialog}
            disabled={mode !== 'visual'}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-primary-600 active:bg-slate-300 disabled:opacity-40 transition-colors"
          >
            <FiLink size={14} />
          </button>
          <button
            type="button"
            title="Insert Divider Line"
            onClick={() => execCmd('insertHorizontalRule')}
            disabled={mode !== 'visual'}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 active:bg-slate-300 disabled:opacity-40 text-xs font-bold transition-colors"
          >
            ―
          </button>

          {/* Undo / Redo */}
          <div className="h-4 w-px bg-slate-300 mx-1" />
          <button
            type="button"
            title="Undo (Ctrl+Z)"
            onClick={() => execCmd('undo')}
            disabled={mode !== 'visual'}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
          >
            <FiRotateCcw size={13} />
          </button>
          <button
            type="button"
            title="Redo (Ctrl+Y)"
            onClick={() => execCmd('redo')}
            disabled={mode !== 'visual'}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
          >
            <FiRotateCw size={13} />
          </button>
          <button
            type="button"
            title="Clear Formatting"
            onClick={() => execCmd('removeFormat')}
            disabled={mode !== 'visual'}
            className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 disabled:opacity-40 transition-colors"
          >
            <FiTrash2 size={13} />
          </button>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-xl border border-slate-300">
          <button
            type="button"
            onClick={() => handleModeChange('visual')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              mode === 'visual'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FiEdit3 size={12} /> Visual (CKEditor)
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('html')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              mode === 'html'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FiCode size={12} /> HTML Source
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('preview')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              mode === 'preview'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FiEye size={12} /> Preview
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative">
        {mode === 'visual' && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            onBlur={handleEditorInput}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            className="min-h-[260px] max-h-[420px] overflow-y-auto p-4 text-slate-800 text-sm leading-relaxed outline-none focus:outline-none prose prose-sm max-w-none prose-slate"
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          />
        )}

        {mode === 'html' && (
          <textarea
            value={htmlContent}
            onChange={(e) => {
              setHtmlContent(e.target.value);
              onChange(e.target.value);
            }}
            rows={12}
            className="w-full p-4 font-mono text-xs text-slate-900 bg-slate-900/5 leading-relaxed outline-none resize-y min-h-[260px] border-none"
            placeholder="Edit raw HTML source code here..."
          />
        )}

        {mode === 'preview' && (
          <div className="p-5 min-h-[260px] max-h-[420px] overflow-y-auto bg-slate-50 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <FiEye size={13} /> Reader Live Preview:
            </div>
            <div
              className="prose prose-slate max-w-none text-slate-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: htmlContent || '<p class="text-slate-400 italic">No content yet. Type in Visual or HTML mode.</p>' }}
            />
          </div>
        )}
      </div>

      {/* Footer Stats Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <div className="flex items-center gap-4">
          <span>Words: <strong className="text-slate-700">{wordCount}</strong></span>
          <span>Characters: <strong className="text-slate-700">{charCount}</strong></span>
          <span>Read Time: <strong className="text-slate-700">~{readTime} min</strong></span>
        </div>
        <span className="text-[10px] text-slate-400">
          CKEditor / Rich Text Supported • Switch to HTML anytime
        </span>
      </div>

      {/* Link Dialog Modal */}
      {linkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FiLink className="text-primary-600" /> Insert Web Link
              </h3>
              <button
                type="button"
                onClick={() => setLinkModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Link URL (Website Address)</label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLinkModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyLink}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
