import React, { useMemo, useState } from 'react';
import { FiX, FiCopy, FiEdit3 } from 'react-icons/fi';
import { rewriteResumeBullets } from '../api';
import '../styles/ResumeBulletRewriter.css';

function ResumeBulletRewriter({ onClose, jobDescriptionText = '' }) {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const bullets = useMemo(() => {
    return inputText
      .split('\n')
      .map((line) => line.replace(/^[-*•\s]+/, '').trim())
      .filter(Boolean);
  }, [inputText]);

  const handleRewrite = async () => {
    if (!bullets.length) {
      alert('Please add at least one bullet point.');
      return;
    }

    setIsLoading(true);
    setResult(null);
    try {
      const data = await rewriteResumeBullets(bullets.slice(0, 10), jobDescriptionText);
      if (data.success) {
        setResult(data.result || null);
      } else {
        alert('Failed to rewrite bullets.');
      }
    } catch (error) {
      alert(error.error || 'Failed to rewrite bullets.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAll = async () => {
    if (!result?.rewrites?.length) return;
    const text = result.rewrites.map((item) => `- ${item.rewritten}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      alert('Rewritten bullets copied.');
    } catch {
      alert('Copy failed.');
    }
  };

  return (
    <div className="rewriter-overlay" onClick={onClose}>
      <div className="rewriter-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rewriter-header">
          <div>
            <h2><FiEdit3 /> Resume Bullet Rewriter</h2>
            <p>Paste your current bullets. Get stronger quantified rewrites.</p>
          </div>
          <button className="rewriter-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="rewriter-content">
          <label htmlFor="bullets-input">Experience Bullet Points (one per line)</label>
          <textarea
            id="bullets-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="- Built dashboard for admin users\n- Improved API performance\n- Worked with cross-functional teams"
            rows={8}
          />
          <p className="rewriter-note">Detected bullets: {bullets.length} (max 10 sent to AI)</p>

          <div className="rewriter-actions">
            <button onClick={handleRewrite} disabled={isLoading || !bullets.length}>
              {isLoading ? 'Rewriting...' : 'Rewrite Bullets'}
            </button>
            {result?.rewrites?.length > 0 && (
              <button className="copy-btn" onClick={handleCopyAll}>
                <FiCopy /> Copy Rewrites
              </button>
            )}
          </div>

          {result?.rewrites?.length > 0 && (
            <div className="rewriter-results">
              {result.rewrites.map((item, index) => (
                <div className="rewrite-card" key={index}>
                  <p><strong>Original:</strong> {item.original}</p>
                  <p><strong>Rewritten:</strong> {item.rewritten}</p>
                  <p><strong>Why better:</strong> {item.improvement_reason}</p>
                </div>
              ))}
            </div>
          )}

          {(result?.ats_keywords_added?.length > 0 || result?.overall_tips?.length > 0) && (
            <div className="rewriter-meta">
              {result?.ats_keywords_added?.length > 0 && (
                <div>
                  <h4>ATS Keywords Added</h4>
                  <div className="keywords-row">
                    {result.ats_keywords_added.map((kw, index) => (
                      <span key={index}>{kw}</span>
                    ))}
                  </div>
                </div>
              )}
              {result?.overall_tips?.length > 0 && (
                <div>
                  <h4>Overall Tips</h4>
                  <ul>
                    {result.overall_tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResumeBulletRewriter;
