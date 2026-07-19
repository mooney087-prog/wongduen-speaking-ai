
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const STORAGE_KEY = "wongduen-speaking-pwa-v1";

let currentTopic = null;
let currentIndex = 0;
let progress = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
let deferredPrompt = null;

function showPage(id) {
  $$(".page").forEach(page => page.classList.toggle("active", page.id === id));
  $$(".bottom-nav button[data-page]").forEach(btn =>
    btn.classList.toggle("active", btn.dataset.page === id)
  );
  window.scrollTo({top:0, behavior:"smooth"});
}

function topicAverage(topic) {
  const scores = progress[topic.id]?.scores || {};
  const values = Object.values(scores);
  return values.length
    ? Math.round(values.reduce((sum, value) => sum + value, 0) / topic.items.length)
    : 0;
}

function renderTopics() {
  $("#topicGrid").innerHTML = TOPICS.map(topic => `
    <button class="topic-card" data-id="${topic.id}">
      <div class="topic-icon">${topic.emoji}</div>
      <div class="topic-copy">
        <h3>${topic.title}</h3>
        <p>${topic.desc}</p>
      </div>
      <div class="topic-arrow">›</div>
    </button>
  `).join("");

  $$(".topic-card").forEach(btn => btn.onclick = () => openTopic(btn.dataset.id));

  const total = TOPICS.reduce((sum, topic) => sum + topicAverage(topic), 0);
  $("#totalScore").textContent = Math.round(total / TOPICS.length);
}

function openTopic(id) {
  currentTopic = TOPICS.find(topic => topic.id === id);
  currentIndex = 0;
  showPage("lessonPage");
  updateLesson();
}

function updateLesson() {
  const [english, thai] = currentTopic.items[currentIndex];
  $("#lessonTitle").textContent = currentTopic.title;
  $("#lessonThai").textContent = currentTopic.thai;
  $("#lessonEmoji").textContent = currentTopic.emoji;
  $("#lessonCount").textContent = `${currentIndex + 1}/${currentTopic.items.length}`;
  $("#sentence").textContent = english;
  $("#thaiSentence").textContent = thai;
  $("#heardText").textContent = "—";
  $("#score").textContent = "0%";
  $("#stars").textContent = "☆☆☆";
  $("#feedback").className = "feedback-card";
  $("#feedback").innerHTML = "<strong>พร้อมฝึกแล้ว!</strong><p>ฟังประโยคก่อน แล้วกดไมโครโฟนเพื่อพูดตาม</p>";
}

function speak(rate) {
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(currentTopic.items[currentIndex][0]);
  utterance.lang = "en-US";
  utterance.rate = rate;
  speechSynthesis.speak(utterance);
}

function normalize(text) {
  return text.toLowerCase().replace(/[.,!?'"’]/g, "").replace(/\s+/g, " ").trim();
}

function similarity(spoken, target) {
  const spokenWords = new Set(normalize(spoken).split(" "));
  const targetWords = new Set(normalize(target).split(" "));
  const overlap = [...spokenWords].filter(word => targetWords.has(word)).length;
  return Math.round(overlap / Math.max(spokenWords.size, targetWords.size) * 100);
}

function saveScore(score) {
  if (!progress[currentTopic.id]) progress[currentTopic.id] = {scores:{}, attempts:0};
  progress[currentTopic.id].scores[currentIndex] =
    Math.max(progress[currentTopic.id].scores[currentIndex] || 0, score);
  progress[currentTopic.id].attempts += 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function startMicrophone() {
  if (!SpeechRecognition) {
    alert("กรุณาเปิดเว็บไซต์ด้วย Google Chrome");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  $("#micBtn").classList.add("listening");
  $("#micStatus").textContent = "กำลังฟัง... พูดได้เลย";

  recognition.onresult = event => {
    const transcript = event.results[0][0].transcript;
    const score = similarity(transcript, currentTopic.items[currentIndex][0]);

    $("#heardText").textContent = transcript;
    $("#score").textContent = `${score}%`;
    $("#stars").textContent =
      score >= 85 ? "★★★" : score >= 65 ? "★★☆" : score >= 40 ? "★☆☆" : "☆☆☆";

    const feedback = $("#feedback");
    if (score >= 85) {
      feedback.className = "feedback-card good";
      feedback.innerHTML = "<strong>Excellent!</strong><p>พูดได้ชัดเจนมาก</p>";
    } else if (score >= 60) {
      feedback.className = "feedback-card warn";
      feedback.innerHTML = "<strong>Good job!</strong><p>ลองพูดให้ครบทุกคำอีกครั้ง</p>";
    } else {
      feedback.className = "feedback-card bad";
      feedback.innerHTML = "<strong>Try again</strong><p>ลองฟังเสียงช้าแล้วพูดตาม</p>";
    }

    saveScore(score);
    renderTopics();
    renderProgress();
  };

  recognition.onend = () => {
    $("#micBtn").classList.remove("listening");
    $("#micStatus").textContent = "แตะไมโครโฟนแล้วพูดตาม";
  };

  recognition.onerror = () => alert("กรุณาอนุญาตการใช้ไมโครโฟน แล้วลองอีกครั้ง");
  recognition.start();
}

function renderProgress() {
  $("#progressList").innerHTML = TOPICS.map(topic => `
    <div class="progress-item">
      <div class="progress-line">
        <div class="progress-emoji">${topic.emoji}</div>
        <div class="progress-copy">
          <strong>${topic.title}</strong>
          <span>ฝึกแล้ว ${progress[topic.id]?.attempts || 0} ครั้ง</span>
        </div>
        <strong>${topicAverage(topic)}%</strong>
      </div>
      <div class="progress-bar"><span style="width:${topicAverage(topic)}%"></span></div>
    </div>
  `).join("");
}

$("#listenBtn").onclick = () => speak(.9);
$("#slowBtn").onclick = () => speak(.62);
$("#micBtn").onclick = startMicrophone;
$("#backBtn").onclick = () => showPage("homePage");

$("#prevBtn").onclick = () => {
  if (currentIndex > 0) {
    currentIndex -= 1;
    updateLesson();
  }
};

$("#nextBtn").onclick = () => {
  if (currentIndex < currentTopic.items.length - 1) {
    currentIndex += 1;
    updateLesson();
  } else {
    renderProgress();
    showPage("progressPage");
  }
};

$("#quickMic").onclick = () => currentTopic ? showPage("lessonPage") : openTopic("greetings");

$$(".bottom-nav button[data-page]").forEach(btn => {
  btn.onclick = () => {
    if (btn.dataset.page === "lessonPage" && !currentTopic) {
      openTopic("greetings");
      return;
    }
    if (btn.dataset.page === "progressPage") renderProgress();
    showPage(btn.dataset.page);
  };
});

$("#resetBtn").onclick = () => {
  if (confirm("ต้องการล้างคะแนนทั้งหมดหรือไม่?")) {
    progress = {};
    localStorage.removeItem(STORAGE_KEY);
    renderTopics();
    renderProgress();
  }
};

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredPrompt = event;
  $("#installBtn").hidden = false;
});

$("#installBtn").onclick = async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  $("#installBtn").hidden = true;
};

window.addEventListener("appinstalled", () => {
  $("#installBtn").hidden = true;
});

renderTopics();
renderProgress();
