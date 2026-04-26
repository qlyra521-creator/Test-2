import React, { useState, useMemo } from 'react';
import { Mail, Send, Clock, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Letter, UserId, USER_NAMES, PARTNER } from '../types';
import { toDateStr } from '../utils/dateUtils';

type Tab = 'inbox' | 'write';

function isDelivered(letter: Letter): boolean {
  return letter.scheduledDate <= toDateStr(new Date());
}

function LetterCard({ letter, currentUser, onRead }: {
  letter: Letter;
  currentUser: UserId;
  onRead: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const delivered = isDelivered(letter);
  const isUnread = !letter.isRead && delivered && letter.to === currentUser;

  const handleExpand = () => {
    setExpanded(!expanded);
    if (!expanded && isUnread) onRead(letter.id);
  };

  return (
    <div
      className={`glass-card p-5 cursor-pointer transition-all hover:bg-white/30 ${
        isUnread ? 'ring-1 ring-white/60' : ''
      }`}
      onClick={handleExpand}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isUnread && (
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: '#C97EA0' }}
              />
            )}
            <span className="font-medium text-primary text-sm truncate">{letter.title}</span>
          </div>
          <div className="text-xs text-secondary">
            {USER_NAMES[letter.from]} → {USER_NAMES[letter.to]}
          </div>
          <div className="text-xs text-secondary/60 mt-1 flex items-center gap-1">
            {delivered ? (
              <>
                <Mail size={10} />
                <span>已送达 · {letter.scheduledDate}</span>
              </>
            ) : (
              <>
                <Clock size={10} />
                <span>将于 {letter.scheduledDate} {letter.scheduledTime} 送达</span>
              </>
            )}
          </div>
        </div>
        <div className="text-secondary shrink-0">
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/20">
          {delivered ? (
            <div
              className="text-sm text-primary leading-relaxed"
              style={{ whiteSpace: 'pre-wrap', fontFamily: 'Cormorant Garamond, serif', fontSize: 15 }}
            >
              {letter.content}
            </div>
          ) : (
            <div className="text-secondary text-sm italic text-center py-4">
              这封信还在路上，请耐心等待 · This letter is on its way…
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ComposeView({ onSent, onCancel }: { onSent: () => void; onCancel: () => void }) {
  const { currentUser, addLetter } = useApp();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [sending, setSending] = useState(false);

  if (!currentUser) return null;
  const partner = PARTNER[currentUser];
  const today = toDateStr(new Date());

  const handleSend = () => {
    if (!title.trim()) { alert('请填写信件标题'); return; }
    if (!content.trim()) { alert('请填写信件内容'); return; }
    if (!scheduledDate) { alert('请选择送达日期'); return; }
    setSending(true);

    const letter: Letter = {
      id: `l_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      from: currentUser,
      to: partner,
      title: title.trim(),
      content: content.trim(),
      scheduledDate,
      scheduledTime,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    addLetter(letter);
    onSent();
  };

  return (
    <div className="glass-card p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-secondary text-sm">
          <Send size={13} />
          <span>写给 {USER_NAMES[partner]}</span>
        </div>
        <button onClick={onCancel} className="text-secondary hover:text-primary transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs text-secondary/60 uppercase tracking-wider mb-1.5 block">信件标题 · Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="这封信叫什么…"
          maxLength={60}
        />
      </div>

      {/* Content */}
      <div>
        <label className="text-xs text-secondary/60 uppercase tracking-wider mb-1.5 block">信件内容 · Content</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={`亲爱的 ${USER_NAMES[partner]}，\n\n`}
          rows={10}
          style={{
            resize: 'vertical',
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 15,
            lineHeight: 1.8,
          }}
        />
      </div>

      {/* Scheduled delivery */}
      <div>
        <label className="text-xs text-secondary/60 uppercase tracking-wider mb-2 block">
          <Clock size={10} className="inline mr-1" />
          定时送达 · Scheduled Delivery
        </label>
        <div className="flex gap-3">
          <input
            type="date"
            value={scheduledDate}
            min={today}
            onChange={e => setScheduledDate(e.target.value)}
          />
          <input
            type="time"
            value={scheduledTime}
            onChange={e => setScheduledTime(e.target.value)}
            style={{ width: 'auto', flex: '0 0 auto' }}
          />
        </div>
        <p className="text-xs text-secondary/50 mt-2">
          在指定日期送达对方的收件箱 选择今天则立即送达 · Delivered on the chosen date. Choose today to send immediately.
        </p>
      </div>

      <button
        onClick={handleSend}
        disabled={sending}
        className="self-end px-8 py-2.5 rounded-full text-white text-sm transition-all hover:opacity-90 disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg, #7DAFC8, #9AACAA)' }}
      >
        {sending ? '寄出中 · Sending…' : '寄出这封信 · Send →'}
      </button>
    </div>
  );
}

export default function LetterSystem() {
  const { currentUser, letters, markLetterRead, setCurrentView } = useApp();
  const [tab, setTab] = useState<Tab>('inbox');

  if (!currentUser) return null;

  const partner = PARTNER[currentUser];

  const inbox = useMemo(() =>
    letters.filter(l => l.to === currentUser),
    [letters, currentUser]
  );

  const sent = useMemo(() =>
    letters.filter(l => l.from === currentUser),
    [letters, currentUser]
  );

  const unreadCount = inbox.filter(l => !l.isRead && isDelivered(l)).length;
  const pendingInbox = inbox.filter(l => !isDelivered(l)).length;

  return (
    <div className="pt-20 pb-8 px-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-serif text-3xl font-light text-primary">信件 · Letters</h2>
        <p className="text-secondary text-sm mt-1">
          写一封信给 {USER_NAMES[partner]} · Write a letter, delivered on the chosen day
        </p>
      </div>

      {/* Tabs */}
      <div className="glass rounded-full flex mb-6 text-sm overflow-hidden">
        <button
          onClick={() => setTab('inbox')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-2 transition-all ${
            tab === 'inbox' ? 'bg-white/40 text-primary font-medium' : 'text-secondary hover:text-primary'
          }`}
        >
          <Mail size={14} />
          <span>收件箱 · Inbox</span>
          {unreadCount > 0 && (
            <span
              className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center"
              style={{ background: '#C97EA0' }}
            >
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('write')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-2 transition-all ${
            tab === 'write' ? 'bg-white/40 text-primary font-medium' : 'text-secondary hover:text-primary'
          }`}
        >
          <Plus size={14} />
          <span>写信 · Write</span>
        </button>
      </div>

      {/* Content */}
      {tab === 'inbox' ? (
        <div className="flex flex-col gap-4">
          {/* Inbox: received letters */}
          {inbox.length === 0 && sent.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <div className="text-4xl mb-3">✉️</div>
              <div className="text-secondary text-sm">还没有信件 · No letters yet</div>
              <button
                onClick={() => setTab('write')}
                className="mt-4 text-xs text-secondary/60 hover:text-primary transition-colors underline underline-offset-2"
              >
                写一封信给 {USER_NAMES[partner]} · Write a letter
              </button>
            </div>
          ) : (
            <>
              {inbox.length > 0 && (
                <div>
                  <div className="text-xs text-secondary/60 uppercase tracking-wider mb-3 flex items-center gap-1">
                    <Mail size={10} />
                    <span>来自 {USER_NAMES[partner]} · From {USER_NAMES[partner]}</span>
                    {pendingInbox > 0 && <span className="text-secondary/40">（{pendingInbox} 封待送达）</span>}
                  </div>
                  <div className="flex flex-col gap-3">
                    {inbox.map(l => (
                      <LetterCard
                        key={l.id}
                        letter={l}
                        currentUser={currentUser}
                        onRead={markLetterRead}
                      />
                    ))}
                  </div>
                </div>
              )}

              {sent.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs text-secondary/60 uppercase tracking-wider mb-3 flex items-center gap-1">
                    <Send size={10} />
                    <span>我寄出的信 · Sent</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {sent.map(l => (
                      <LetterCard
                        key={l.id}
                        letter={l}
                        currentUser={currentUser}
                        onRead={markLetterRead}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <ComposeView onSent={() => setTab('inbox')} onCancel={() => setTab('inbox')} />
      )}

      {/* Back to home */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => setCurrentView('grid')}
          className="glass rounded-full px-5 py-2 text-sm text-secondary hover:text-primary transition-colors tracking-wider"
        >
          ← 返回主页 · Home
        </button>
      </div>
    </div>
  );
}
