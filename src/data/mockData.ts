import { Memory, Letter } from '../types';
import { dayOfJourney } from '../utils/dateUtils';

export const INITIAL_MEMORIES: Memory[] = [
  {
    id: 'm1',
    date: '2024-04-29',
    author: 'shiyun',
    type: 'anniversary',
    title: '遇见你的第一天',
    content: '2024年4月29日，就是这一天，我们相遇了。这一天，我想永远记住。',
    photos: [],
    location: undefined,
    dayOfJourney: dayOfJourney('2024-04-29'),
  },
  {
    id: 'm2',
    date: '2024-05-18',
    author: 'tim',
    type: 'daily',
    title: '第一次一起看电影',
    content: '今天一起去看了一部电影，坐在一起，感觉很好。希望以后能一起做更多这样的事情。',
    photos: [],
    dayOfJourney: dayOfJourney('2024-05-18'),
  },
  {
    id: 'm3',
    date: '2024-06-15',
    author: 'shiyun',
    type: 'travel',
    title: '上海之旅',
    content: '第一次一起旅行。上海的夏天很热，但是有你在就不一样了。外滩的夜色真漂亮。',
    photos: [],
    location: '上海',
    dayOfJourney: dayOfJourney('2024-06-15'),
  },
  {
    id: 'm4',
    date: '2024-08-07',
    author: 'shiyun',
    type: 'anniversary',
    title: '在一起第100天',
    content: '一百天了。每一天都过得那么真实，又那么梦幻。谢谢你陪着我度过这一百天。',
    photos: [],
    dayOfJourney: dayOfJourney('2024-08-07'),
  },
  {
    id: 'm5',
    date: '2024-08-07',
    author: 'tim',
    type: 'anniversary',
    title: '100天快乐',
    content: '100天了，下一个100天，和你一起继续走。',
    photos: [],
    dayOfJourney: dayOfJourney('2024-08-07'),
  },
  {
    id: 'm6',
    date: '2024-09-22',
    author: 'shiyun',
    type: 'daily',
    title: '秋天的下午',
    content: '秋天到了，叶子变黄，和你一起散步真的很治愈。',
    photos: [],
    dayOfJourney: dayOfJourney('2024-09-22'),
  },
  {
    id: 'm7',
    date: '2024-10-04',
    author: 'tim',
    type: 'travel',
    title: '国庆出游',
    content: '国庆假期，我们去了一个小城市，慢慢逛，吃当地小吃，什么都不想，只是陪着你。',
    photos: [],
    location: '苏州',
    dayOfJourney: dayOfJourney('2024-10-04'),
  },
  {
    id: 'm8',
    date: '2024-12-25',
    author: 'shiyun',
    type: 'special',
    title: '圣诞节',
    content: '第一个圣诞节一起过。你送了我一个小礼物，虽然不贵，但我很喜欢，因为是你选的。',
    photos: [],
    dayOfJourney: dayOfJourney('2024-12-25'),
  },
  {
    id: 'm9',
    date: '2025-01-01',
    author: 'tim',
    type: 'special',
    title: '新年第一天',
    content: '新年快乐！2025年，我们一起过。今年要去更多地方，一起留下更多星点。',
    photos: [],
    dayOfJourney: dayOfJourney('2025-01-01'),
  },
  {
    id: 'm10',
    date: '2025-02-14',
    author: 'shiyun',
    type: 'special',
    title: '情人节',
    content: '情人节，我们在一起。很平凡的一天，就是吃了顿好饭，但好幸福。',
    photos: [],
    dayOfJourney: dayOfJourney('2025-02-14'),
  },
  {
    id: 'm11',
    date: '2025-04-29',
    author: 'shiyun',
    type: 'anniversary',
    title: '一周年纪念日 💫',
    content: '整整365天了。这一年，我们经历了那么多，吵过嘴，笑过，一起看过夕阳。谢谢你一直在。',
    photos: [],
    dayOfJourney: dayOfJourney('2025-04-29'),
  },
  {
    id: 'm12',
    date: '2025-04-29',
    author: 'tim',
    type: 'anniversary',
    title: '一年了',
    content: '一年。很短，又很长。我很庆幸那天遇见了你。',
    photos: [],
    dayOfJourney: dayOfJourney('2025-04-29'),
  },
  {
    id: 'm13',
    date: '2025-07-08',
    author: 'shiyun',
    type: 'travel',
    title: '厦门的海',
    content: '终于来到了海边。第一次一起看海，浪很大，风也大，你拉着我的手怕我摔跤。',
    photos: [],
    location: '厦门',
    dayOfJourney: dayOfJourney('2025-07-08'),
  },
  {
    id: 'm14',
    date: '2025-09-03',
    author: 'tim',
    type: 'daily',
    title: '普通的星期三',
    content: '今天没有特别的事，就是我们一起在家，你在看书，我在旁边。这种普通的时刻，我觉得很满足。',
    photos: [],
    dayOfJourney: dayOfJourney('2025-09-03'),
  },
  {
    id: 'm15',
    date: '2025-11-21',
    author: 'tim',
    type: 'anniversary',
    title: '520天',
    content: '今天是我们在一起第520天，一个特别的数字。Love you 3000，不，love you 520。',
    photos: [],
    dayOfJourney: dayOfJourney('2025-11-21'),
  },
  {
    id: 'm16',
    date: '2025-12-31',
    author: 'shiyun',
    type: 'special',
    title: '2025年最后一天',
    content: '又一年过去了。这一年，有你真好。跨年夜，我们看着倒计时，我想，明年也要这样。',
    photos: [],
    dayOfJourney: dayOfJourney('2025-12-31'),
  },
  {
    id: 'm17',
    date: '2026-02-14',
    author: 'tim',
    type: 'special',
    title: '情人节快乐',
    content: '第二个情人节了。我给你订了一束花，希望你喜欢。感谢你让每一个普通的日子都有了意义。',
    photos: [],
    dayOfJourney: dayOfJourney('2026-02-14'),
  },
  {
    id: 'm18',
    date: '2026-04-01',
    author: 'shiyun',
    type: 'note',
    title: '愚人节',
    content: '今天想愚弄你，但是想了半天，没想出来什么好主意。反而自己先笑了。',
    photos: [],
    dayOfJourney: dayOfJourney('2026-04-01'),
  },
  {
    id: 'm19',
    date: '2026-04-25',
    author: 'shiyun',
    type: 'daily',
    title: '再过4天就是我们的两周年了',
    content: '还有4天。我想为你做一件特别的事，让你记得，让我们一起记得。每一颗星点，都是我们共享过的时刻。',
    photos: [],
    dayOfJourney: dayOfJourney('2026-04-25'),
  },
];

export const INITIAL_LETTERS: Letter[] = [
  {
    id: 'l1',
    from: 'tim',
    to: 'shiyun',
    title: '给世芸的两周年纪念信',
    content: `亲爱的世芸，

当你读到这封信的时候，我们已经在一起整整两年了。

这两年，我无数次庆幸那天遇见了你。你笑起来的样子，你认真做一件事的样子，你睡着了的样子——每一个样子，我都想一直看。

我不擅长说甜言蜜语，但我想让你知道，你对我来说有多重要。你出现之前，我没想过日子可以过得这么踏实，这么有温度。

这两年，我们一起去了很多地方，一起度过了很多平凡的日子。我最喜欢的，反而是那些最普通的时刻——你在看书，我在旁边；或者就只是一起走在街上，什么都不说。

谢谢你选择了我。谢谢你一直陪着我。

接下来的每一天，我也想和你一起，继续在这里留下我们的星点。

爱你，Tim
2026年4月29日`,
    scheduledDate: '2026-04-29',
    scheduledTime: '00:00',
    createdAt: '2026-04-20T10:00:00.000Z',
    isRead: false,
  },
  {
    id: 'l2',
    from: 'shiyun',
    to: 'tim',
    title: '写给未来的你',
    content: `Tim，

我不知道你什么时候会看到这封信，但我在写的这一刻，很想对你说——

谢谢你。谢谢你每次都耐心地等我，谢谢你记得我说过的小细节，谢谢你在我不开心的时候，就静静地陪在旁边。

和你在一起，我学会了很多事。比如，慢下来也没关系；比如，可以依赖别人；比如，平凡的日子里也有很多值得珍惜的东西。

我希望我们能一直这样走下去，走过很多城市，经历很多季节，然后在老了的时候，翻开这个网站，一起看我们留下的那些星点。

爱你，世芸`,
    scheduledDate: '2026-02-14',
    scheduledTime: '08:00',
    createdAt: '2026-01-28T20:00:00.000Z',
    isRead: false,
  },
];
