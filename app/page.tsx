'use client';
import { useState } from 'react';

interface DiffPart {
  type: 'deletion' | 'addition' | 'unchanged';
  text: string;
}

export default function Home() {
  const [originalText, setOriginalText] = useState<string>('');
  const [newText, setNewText] = useState<string>('');
  const [diffResult, setDiffResult] = useState<DiffPart[]>([]);

  const findInlineDifferences = () => {
    const originalWords = originalText.split(/\s+/);
    const newWords = newText.split(/\s+/);
    
    let i = 0;
    let j = 0;
    const result: DiffPart[] = [];
    let currentDeletion: string[] = [];
    let currentAddition: string[] = [];
    
    const flushChanges = () => {
      if (currentDeletion.length > 0) {
        result.push({ type: 'deletion', text: currentDeletion.join(' ') + ' ' });
        currentDeletion = [];
      }
      if (currentAddition.length > 0) {
        result.push({ type: 'addition', text: currentAddition.join(' ') + ' ' });
        currentAddition = [];
      }
    };

    while (i < originalWords.length || j < newWords.length) {
      if (i >= originalWords.length) {
        currentAddition.push(newWords[j]);
        j++;
      } else if (j >= newWords.length) {
        currentDeletion.push(originalWords[i]);
        i++;
      } else if (originalWords[i] === newWords[j]) {
        flushChanges();
        result.push({ type: 'unchanged', text: originalWords[i] + ' ' });
        i++;
        j++;
      } else {
        let foundMatch = false;
        let lookAheadLimit = Math.min(5, Math.max(originalWords.length - i, newWords.length - j));
        
        for (let lookAhead = 1; lookAhead < lookAheadLimit; lookAhead++) {
          if (i + lookAhead < originalWords.length && originalWords[i + lookAhead] === newWords[j]) {
            for (let k = 0; k < lookAhead; k++) {
              currentDeletion.push(originalWords[i + k]);
            }
            i += lookAhead;
            foundMatch = true;
            break;
          }
          if (j + lookAhead < newWords.length && originalWords[i] === newWords[j + lookAhead]) {
            for (let k = 0; k < lookAhead; k++) {
              currentAddition.push(newWords[j + k]);
            }
            j += lookAhead;
            foundMatch = true;
            break;
          }
        }
        
        if (!foundMatch) {
          currentDeletion.push(originalWords[i]);
          currentAddition.push(newWords[j]);
          i++;
          j++;
        }
      }
    }
    
    flushChanges();
    setDiffResult(result);
  };

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Text Difference Comparison</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Original Version:</label>
          <textarea
            className="w-full h-32 p-2 border rounded shadow-sm"
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Paste original text here..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">New Version:</label>
          <textarea
            className="w-full h-32 p-2 border rounded shadow-sm"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Paste new text here..."
          />
        </div>
      </div>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={findInlineDifferences}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Compare Texts
        </button>
      </div>

      {diffResult.length > 0 && (
        <div className="border rounded p-4 bg-white shadow-sm">
          <h2 className="font-medium mb-2">Differences:</h2>
          <div className="whitespace-pre-wrap">
            {diffResult.map((part, index) => (
              <span
                key={index}
                className={
                  part.type === 'addition'
                    ? 'bg-green-100 text-green-800'
                    : part.type === 'deletion'
                    ? 'bg-red-100 text-red-800 line-through'
                    : ''
                }
              >
                {part.text}
              </span>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}