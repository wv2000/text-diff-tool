import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownUp } from 'lucide-react';

const InlineTextDiff = () => {
  const [originalText, setOriginalText] = useState('');
  const [newText, setNewText] = useState('');
  const [diffResult, setDiffResult] = useState(null);

  const findInlineDifferences = () => {
    const originalWords = originalText.split(/\s+/);
    const newWords = newText.split(/\s+/);
    
    let i = 0;
    let j = 0;
    const result = [];
    let currentDeletion = [];
    let currentAddition = [];
    
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
        // Rest are additions
        currentAddition.push(newWords[j]);
        j++;
      } else if (j >= newWords.length) {
        // Rest are deletions
        currentDeletion.push(originalWords[i]);
        i++;
      } else if (originalWords[i] === newWords[j]) {
        // Words match - flush any pending changes and add unchanged word
        flushChanges();
        result.push({ type: 'unchanged', text: originalWords[i] + ' ' });
        i++;
        j++;
      } else {
        // Look ahead to find next match
        let foundMatch = false;
        let lookAheadLimit = Math.min(5, Math.max(originalWords.length - i, newWords.length - j));
        
        for (let lookAhead = 1; lookAhead < lookAheadLimit; lookAhead++) {
          // Check if we find a match in new text
          if (i + lookAhead < originalWords.length && originalWords[i + lookAhead] === newWords[j]) {
            // Found a match after some deletions
            for (let k = 0; k < lookAhead; k++) {
              currentDeletion.push(originalWords[i + k]);
            }
            i += lookAhead;
            foundMatch = true;
            break;
          }
          // Check if we find a match in original text
          if (j + lookAhead < newWords.length && originalWords[i] === newWords[j + lookAhead]) {
            // Found a match after some additions
            for (let k = 0; k < lookAhead; k++) {
              currentAddition.push(newWords[j + k]);
            }
            j += lookAhead;
            foundMatch = true;
            break;
          }
        }
        
        if (!foundMatch) {
          // No match found - treat as substitution
          currentDeletion.push(originalWords[i]);
          currentAddition.push(newWords[j]);
          i++;
          j++;
        }
      }
    }
    
    // Flush any remaining changes
    flushChanges();
    setDiffResult(result);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Inline Text Difference Viewer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-medium">Original Version:</label>
              <textarea
                className="w-full h-32 p-2 border rounded"
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="Paste original text here..."
              />
            </div>
            <div className="space-y-2">
              <label className="block font-medium">New Version:</label>
              <textarea
                className="w-full h-32 p-2 border rounded"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Paste new text here..."
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button 
              onClick={findInlineDifferences}
              className="flex items-center gap-2"
            >
              <ArrowDownUp size={16} />
              Compare Texts
            </Button>
          </div>

          {diffResult && (
            <div className="mt-6">
              <h3 className="font-medium mb-2">Differences:</h3>
              <div className="border rounded p-4">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InlineTextDiff;