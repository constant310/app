'use client';

import { useEffect, useMemo, useState } from 'react';

const API = 'https://wsxszbdvvtowmrnxdsrp.supabase.co/functions/v1/exam-challenge-api';

export default function ChallengeClient({ questionId = '' }) {
  const [challenge, setChallenge] = useState(null);
  const [error, setError] = useState('');
  const [picked, setPicked] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setError('');
        const url = questionId ? `${API}?q=${encodeURIComponent(questionId)}` : API;
        const response = await fetch(url, { headers: { accept: 'application/json' } });
        const json = await response.json();
        if (!response.ok || !json?.ok) throw new Error(json?.error || 'Challenge unavailable');
        if (active) setChallenge(json.challenge);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Challenge unavailable');
      }
    })();
    return () => { active = false; };
  }, [questionId]);

  const correct = challenge?.correct || '';
  const answered = Boolean(picked);
  const pageTitle = useMemo(() => challenge ? `${challenge.subject} Challenge — ${challenge.topic}` : 'Exam Bank Daily Challenge', [challenge]);

  useEffect(() => { if (challenge) document.title = pageTitle; }, [challenge, pageTitle]);

  async function share() {
    if (!challenge) return;
    const text = `🔥 ${challenge.subject} Challenge — ${challenge.topic}\n\n${challenge.text}\n\nAnswer here and get instant feedback:\n${window.location.href}`;
    if (navigator.share) {
      try { await navigator.share({ title: pageTitle, text, url: window.location.href }); return; } catch {}
    }
    window.location.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt('Copy this link:', window.location.href);
    }
  }

  return (
    <main className="wrap">
      <div className="brand"><span className="dot" />Exam Bank Daily Challenge</div>
      <section className="card">
        {!challenge && !error && <div className="loading"><div className="spinner" />Loading challenge…</div>}
        {error && <div className="error"><h1>Challenge unavailable</h1><p>{error}</p><a className="action primary" href="/">Open latest challenge</a></div>}
        {challenge && <>
          <div className="eyebrow">JAMB-style challenge</div>
          <div className="meta"><span className="pill">{challenge.subject}</span><span className="pill">{challenge.topic}</span>{challenge.year ? <span className="pill">{challenge.year}</span> : null}</div>
          <h1 className="question">{challenge.text}</h1>
          <div className="options">{challenge.choices.map((choice) => {
            const isCorrect = answered && choice.label === correct;
            const isWrong = answered && picked === choice.label && picked !== correct;
            return <button key={choice.label} className={`option ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`} disabled={answered} onClick={() => setPicked(choice.label)}><span>{choice.label}</span><b>{choice.text}</b></button>;
          })}</div>
          {answered && <div className="feedback"><h2>{picked === correct ? '✅ Correct!' : `❌ Not quite. Correct answer: ${correct}`}</h2><p>{challenge.explanation}</p><div className="hint">Need it explained another way? Open this exact question in the AI tutor below.</div></div>}
          <div className="actions"><a className="action primary full" href={challenge.bot_url}>🎯 Practise this exact question in the bot</a><a className="action" href={challenge.channel_url}>📢 Daily Challenge Channel</a><a className="action" href={challenge.group_url}>💬 Discussion Group</a></div>
          <div className="shareRow"><button className="shareBtn" onClick={share}>📤 Share Challenge</button><button className="copyBtn" onClick={copyLink}>{copied ? '✅ Link copied' : '🔗 Copy Link'}</button></div>
          <div className="note">Answer here, understand why, then continue drilling in the Telegram bot.</div>
        </>}
      </section>
    </main>
  );
}
