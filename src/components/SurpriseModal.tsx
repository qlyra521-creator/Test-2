import React, { useState, useCallback } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { Memory, MEMORY_COLORS, MEMORY_LABELS, USER_NAMES } from '../types';

const QUOTES: { zh: string; en: string; from: string }[] = [
  {
    zh: '于千万人之中遇见你所要遇见的人，没有早一步，也没有晚一步，刚巧赶上了——噢，你也在这里吗？',
    en: 'Among thousands of people, in the endless wilderness of time, not a step too early, not a step too late — "Oh, you're here too?"',
    from: '张爱玲',
  },
  {
    zh: '我爱你，不光是因为你的样子，还因为和你在一起时，我的样子。',
    en: 'I love you not only for what you are, but for what I am when I am with you.',
    from: 'Roy Croft',
  },
  {
    zh: '你一会看我，一会看云。我觉得，你看我时很远，你看云时很近。',
    en: 'You glance at me, then at the clouds. When you look at me you seem far away; when you look at the clouds you seem near.',
    from: '顾城',
  },
  {
    zh: '世界上最遥远的距离，不是生与死，而是我站在你面前，你却不知道我爱你。',
    en: 'The farthest distance in the world is not between life and death, but when I stand before you and you don't know I love you.',
    from: '泰戈尔',
  },
  {
    zh: '见过你之后，才知道我之前所有的爱情，都只是在练习爱你。',
    en: 'After meeting you, I realized all my past loves were just practice for loving you.',
    from: '佚名',
  },
  {
    zh: '我想和你虚度时光。',
    en: 'I want to waste time with you.',
    from: '李元胜',
  },
  {
    zh: '那些消逝了的岁月，仿佛隔着一块积着灰尘的玻璃，看得到，抓不着。',
    en: 'Those bygone years, as if seen through dusty glass — visible, but beyond reach.',
    from: '《花样年华》',
  },
  {
    zh: '如果神存在，我想他就住在我们之间这小小的空隙里。',
    en: 'If there's any kind of God, it wouldn't be in any of us — but just this little space in between.',
    from: '《Before Sunrise》',
  },
  {
    zh: '喜欢你，是我做过的最好的事。',
    en: 'Liking you is the best thing I've ever done.',
    from: '佚名',
  },
  {
    zh: '你是我患得患失的梦，是我不敢回头的温柔。',
    en: 'You are the dream I both long for and fear to lose, the tenderness I dare not look back upon.',
    from: '佚名',
  },
  {
    zh: '我想用你的笑声来装满我的双手。',
    en: 'I want to fill my hands with your laughter.',
    from: '聂鲁达',
  },
  {
    zh: '生命里没有你的那些岁月，我是怎么过的呢？',
    en: 'How did I ever live those years without you in them?',
    from: '佚名',
  },
  {
    zh: '余生很长，你别害怕。',
    en: 'There's so much life left ahead — don't be afraid.',
    from: '佚名',
  },
  {
    zh: '陪你去看流星雨落在这地球上，让你的泪落在我肩膀。',
    en: 'I'll take you to watch the meteor shower fall upon this earth, and let your tears fall on my shoulder.',
    from: '《流星雨》',
  },
  {
    zh: '我们都是孤独的星球，某一天，轨道交叉，便是一生。',
    en: 'We are all lonely planets. One day our orbits cross — and that crossing becomes a lifetime.',
    from: '佚名',
  },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface Props {
  memories: Memory[];
  onClose: () => void;
}

export default function SurpriseModal({ memories, onClose }: Props) {
  const getNew = useCallback(() => ({
    memory: memories.length > 0 ? pick(memories) : null,
    quote: pick(QUOTES),
  }), [memories]);

  const [{ memory, quote }, setSurprise] = useState(getNew);

  const shuffle = () => setSurprise(getNew());

  return (
    <div className="modal-overlay" style={{ zIndex: 300 }} onClick={onClose}>
      <div
        className="w-full max-w-sm animate-slide-up flex flex-col overflow-hidden"
        style={{
          background: 'rgba(255, 251, 247, 0.96)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 20,
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 8px 40px rgba(80, 60, 100, 0.15)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(200, 190, 210, 0.2)' }}>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 16 }}>🎁</span>
            <span className="font-serif text-lg font-light text-primary">惊喜 · Surprise</span>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-primary transition-colors p-1">
            <X size={15} />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4">
          {/* Memory card */}
          {memory ? (
            <div
              className="rounded-2xl p-4"
              style={{ background: `${MEMORY_COLORS[memory.type]}22`, border: `1px solid ${MEMORY_COLORS[memory.type]}44` }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                  style={{ background: MEMORY_COLORS[memory.type] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-primary">{memory.title}</div>
                  <div className="text-xs text-secondary mt-0.5">
                    {memory.date} · {USER_NAMES[memory.author]} · {MEMORY_LABELS[memory.type]}
                    {memory.location && <span className="ml-1.5">📍 {memory.location}</span>}
                  </div>
                  {memory.content && (
                    <div
                      className="text-xs text-secondary/70 mt-2 leading-relaxed"
                      style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: 13,
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {memory.content}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-4 text-center text-secondary text-sm" style={{ background: 'rgba(210, 195, 225, 0.2)' }}>
              还没有记忆 · No memories yet
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(200, 190, 210, 0.3)' }} />
            <span className="text-xs text-secondary/40">✦</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(200, 190, 210, 0.3)' }} />
          </div>

          {/* Quote */}
          <div className="text-center px-2">
            <p
              className="text-primary leading-relaxed mb-2"
              style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15 }}
            >
              {quote.zh}
            </p>
            <p className="text-secondary/60 text-xs leading-relaxed italic">
              {quote.en}
            </p>
            <p className="text-secondary/40 text-xs mt-2 tracking-wider">— {quote.from}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex justify-center">
          <button
            onClick={shuffle}
            className="flex items-center gap-2 px-6 py-2 rounded-full text-sm text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #C97EA0, #7DAFC8)' }}
          >
            <RefreshCw size={13} />
            再来一次 · Surprise Me Again
          </button>
        </div>
      </div>
    </div>
  );
}
