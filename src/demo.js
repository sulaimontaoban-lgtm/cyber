// Frontend-only demo data. Used when the backend is unreachable,
// so the UI can be shown and clicked through without any server.
const t = Date.now();
const H = 36e5;
export const DEMO = {
  me: {
    phone: "+2348011111111",
    handles: { TikTok: [{ h: "@cyber_ada", personal: true }], GitHub: [{ h: "ada-dev", personal: true }] },
    banned: false, posts: 1, postsLeft: 3, isAdmin: true,
  },
  users: [
    { phone: "+2348011111111", handles: { TikTok: [{ h: "@cyber_ada", personal: true }], GitHub: [{ h: "ada-dev", personal: true }] }, banned: false, posts: 1, postsLeft: 3, isAdmin: true },
    { phone: "+2348022222222", handles: { YouTube: [{ h: "@tutors", personal: true }] }, banned: false, posts: 0, postsLeft: 4, isAdmin: false },
    { phone: "+2348033333333", handles: { Instagram: [{ h: "@design_kay", personal: true }], TikTok: [{ h: "@kay Clips", personal: false }] }, banned: false, posts: 2, postsLeft: 2, isAdmin: false },
  ],
  feed: [
    { t: "+2348011111111 posted a TikTok project", when: t - 2 * H },
    { t: "+2348033333333 copied a GitHub link", when: t - 5 * H },
    { t: "Admin posted to Cybersecurity class", when: t - 8 * H },
    { t: "+2348022222222 submitted exam", when: t - 11 * H },
  ],
  projects: [
    { id: "p1", owner: "+2348011111111", desc: "Follow + like the TikTok launch video and comment DONE.", links: [{ url: "https://tiktok.com/@cyber/video/7263", plat: "TikTok" }], copies: ["+2348022222222"], copiesN: 124, shares: 3, status: "Active", created: t - 2 * H },
    { id: "p2", owner: "+2348022222222", desc: "Star the GitHub repo and subscribe on YouTube.", links: [{ url: "https://github.com/taoban/cyber-restart", plat: "GitHub" }, { url: "https://youtube.com/watch?v=abc123", plat: "YouTube" }], copies: [], copiesN: 37, shares: 1, status: "Pending", created: t - 26 * H },
    { id: "p3", owner: "+2348033333333", desc: "Like + repost the Instagram launch carousel.", links: [{ url: "https://instagram.com/p/launch123", plat: "Instagram" }], copies: [], copiesN: 12, shares: 0, status: "Active", created: t - 30 * H },
  ],
  logs: [
    { t: "p1 copied by +2348022222222", when: t - 1 * H },
    { t: "+2348022222222 reported p9 done → moved to next", when: t - 20 * H },
  ],
  classPosts: [
    { id: "c9", cls: "cyber", author: "Admin", text: "Midterm exam: secure a login form against SQL injection, then submit your recording.", video: "", likes: 5, shares: 0, comments: [], isExam: true, hint: "Revisit lesson 2 — parameterized queries.", created: t - 3 * H },
    { id: "c1", cls: "cyber", author: "Admin", text: "Welcome to Cybersecurity 101 — watch the intro and comment your goal.", video: "https://www.youtube.com/embed/dQw4w9WgXcQ", likes: 12, shares: 2, comments: ["+2348022222222: Goal — become analyst!"], isExam: false, hint: "", created: t - 9 * H },
    { id: "c2", cls: "prog", author: "Admin", text: "Programmers: JS basics thread. Post your first function below.", video: "", likes: 8, shares: 1, comments: ["+2348033333333: function hi(){ return 'hi' }"], isExam: false, hint: "", created: t - 7 * H },
  ],
  examOn: true,
  subs: [
    { id: "sub_demo1", examId: "c9", userId: "+2348022222222", fileUrl: "https://example.com/demo-exam.mp4", fileType: "video", when: t - 11 * H },
  ],
};

export function seedDemo() { return DEMO; }
export function demoClass(cls) { return DEMO.classPosts.filter(p => p.cls === cls); }
