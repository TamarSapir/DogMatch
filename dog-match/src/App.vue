<script setup lang="ts">
import { ref, computed } from "vue";

type Screen = "onboarding" | "swipe" | "favorites";

type Preferences = {
  size: "small" | "any";
  energy: "high" | "low_or_medium";
};

type DogSize = "small" | "medium" | "large";
type DogEnergy = "low" | "medium" | "high";

type Dog = {
  id: number;
  name: string;
  age: number;
  size: DogSize;
  energy: DogEnergy;
  city: string;
  story: string;
  imageUrl: string;
};

const API_URL = "https://dogmatch-api.onrender.com";

const MOCK_DOGS: Dog[] = [
  {
    id: 1,
    name: "לוקה",
    age: 2,
    size: "small",
    energy: "high",
    city: "תל אביב",
    story: "כלבה קטנה ומלאת אנרגיה, אוהבת לרוץ בגינת כלבים.",
    imageUrl: "https://place-puppy.com/300x300",
  },
  {
    id: 2,
    name: "מקס",
    age: 5,
    size: "large",
    energy: "low",
    city: "חיפה",
    story: "כלב גדול ורגוע, מתאים למשפחה עם ילדים.",
    imageUrl: "https://place-puppy.com/301x301",
  },
  {
    id: 3,
    name: "ביסלי",
    age: 1,
    size: "small",
    energy: "medium",
    city: "ירושלים",
    story: "גור סקרן ושמח, צריך הרבה משחק ותשומת לב.",
    imageUrl: "https://place-puppy.com/302x302",
  },
];

const screen = ref<Screen>("onboarding");
const preferences = ref<Preferences | null>(null);
const favorites = ref<Dog[]>([]);
const onboardingText = ref("");
const onboardingError = ref("");
const swipeIndex = ref(0);
const loadingOnboarding = ref(false);

const currentDog = computed(() => MOCK_DOGS[swipeIndex.value] ?? null);

async function handleOnboardingSubmit() {
  if (!onboardingText.value.trim()) {
    onboardingError.value = "ספרי קצת עלייך ועל הכלב שאת מחפשת 🐶";
    return;
  }
  onboardingError.value = "";
  loadingOnboarding.value = true;

  try {
    console.log("API_URL IS:", API_URL);
    const res = await fetch(`${API_URL}/api/onboarding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: onboardingText.value }),
    });

    if (!res.ok) {
      throw new Error("Server error");
    }

    const data = await res.json();
    preferences.value = data.preferences;
    // אפשר בעתיד להשתמש גם ב-data.message להצגת טקסט מהשרת
    screen.value = "swipe";
  } catch (err) {
    console.error(err);
    onboardingError.value =
      "הייתה בעיה בחיבור לשרת, נסי שוב מאוחר יותר 🙏";
  } finally {
    loadingOnboarding.value = false;
  }
}

function skipDog() {
  swipeIndex.value++;
}

function likeDog() {
  if (currentDog.value) {
    const already = favorites.value.some((d) => d.id === currentDog.value?.id);
    if (!already) {
      favorites.value.push(currentDog.value);
    }
  }
  swipeIndex.value++;
}
</script>


<template>
  <div class="app">
    <header class="header">
      <nav class="nav">
        <button
          class="nav-btn"
          :class="{ active: screen === 'onboarding' }"
          @click="screen = 'onboarding'"
        >
          שאלון
        </button>
        <button
          class="nav-btn"
          :class="{ active: screen === 'swipe' }"
          @click="screen = 'swipe'"
        >
          התאמות
        </button>
        <button
          class="nav-btn"
          :class="{ active: screen === 'favorites' }"
          @click="screen = 'favorites'"
        >
          מועדפים
        </button>
      </nav>
    </header>

    <main class="main">
      <!-- מסך שאלון -->
      <section v-if="screen === 'onboarding'" class="card">
        <h2 class="title">בואי נכיר 😊</h2>
        <p class="text">
          תכתבי בכמה משפטים: איפה את גרה, כמה זמן את בבית, איזה כלב את מחפשת
          (רגוע/אנרגטי, קטן/גדול וכו').
        </p>
        <form @submit.prevent="handleOnboardingSubmit">
          <textarea
            v-model="onboardingText"
            rows="5"
            class="textarea"
          />
          <p v-if="onboardingError" class="error">
            {{ onboardingError }}
          </p>
         <button type="submit" class="btn btn-primary" :disabled="loadingOnboarding">
          {{ loadingOnboarding ? "מחפשת לך כלבים..." : "מצאי לי כלבים מתאימים" }}
        </button>
        </form>
      </section>

      <!-- מסך התאמות -->
      <section v-else-if="screen === 'swipe'">
        <div v-if="!currentDog" class="empty">
          <h2>נגמרו הכלבים 😅</h2>
          <p>תנסי לעדכן את ההעדפות שלך או לחזור מאוחר יותר.</p>
        </div>
        <div v-else>
          <div class="card dog-card">
            <img
              :src="currentDog.imageUrl"
              :alt="currentDog.name"
              class="dog-img"
            />
            <div class="dog-content">
              <h2 class="title">
                {{ currentDog.name }} · {{ currentDog.age }} שנים
              </h2>
              <p class="meta">
                {{ currentDog.size === "small"
                  ? "קטן"
                  : currentDog.size === "large"
                  ? "גדול"
                  : "בינוני" }}
                ·
                {{
                  currentDog.energy === "high"
                    ? "אנרגטי"
                    : currentDog.energy === "low"
                    ? "רגוע"
                    : "בינוני"
                }}
                ·
                {{ currentDog.city }}
              </p>
              <p class="text">
                {{ currentDog.story }}
              </p>

              <p v-if="preferences" class="hint">
                💡 מבוסס על מה שכתבת, נראה שהוא
                {{
                  preferences.size === "any" ||
                  currentDog.size === preferences.size
                    ? "מתאים לגודל שחיפשת"
                    : "קצת שונה בגודל ממה שחיפשת"
                }}
                .
              </p>
            </div>
          </div>

          <div class="actions">
            <button class="btn btn-secondary" @click="skipDog">
              ❌ לא מתאים
            </button>
            <button class="btn btn-like" @click="likeDog">
              ❤️ מועדף
            </button>
          </div>
        </div>
      </section>

      <!-- מסך מועדפים -->
      <section v-else class="card">
        <h2 class="title">המועדפים שלך ❤️</h2>
        <p v-if="favorites.length === 0" class="text">
          עדיין אין לך כלבים במועדפים 😊
        </p>
        <div v-else class="favorites-list">
          <article
            v-for="dog in favorites"
            :key="dog.id"
            class="favorite-item"
          >
            <strong>{{ dog.name }}</strong> · {{ dog.city }}
            <p class="text small-text">
              {{ dog.story }}
            </p>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: #f3f4f6;
  direction: rtl;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

.header {
  background: white;
  padding: 0.75rem 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
}

.nav {
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
}

.nav-btn {
  flex: 1;
  padding: 0.4rem 0.5rem;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
}

.nav-btn.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.main {
  max-width: 480px;
  margin: 0 auto;
  padding: 1rem;
}

.card {
  background: white;
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
  margin-top: 1rem;
}

.title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}

.text {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
}

.small-text {
  font-size: 0.8rem;
}

.textarea {
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  margin-bottom: 0.5rem;
  resize: vertical;
}

.error {
  color: red;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.btn {
  padding: 0.6rem;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary {
  width: 100%;
  background: #2563eb;
  color: white;
}

.dog-card {
  padding: 0;
  overflow: hidden;
}

.dog-img {
  width: 100%;
  height: 260px;
  object-fit: cover;
}

.dog-content {
  padding: 0.75rem;
}

.meta {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.hint {
  font-size: 0.8rem;
  color: #4b5563;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-secondary {
  flex: 1;
  background: white;
  border: 1px solid #e5e7eb;
}

.btn-like {
  flex: 1;
  background: #16a34a;
  color: white;
}

.empty {
  text-align: center;
  margin-top: 2rem;
}

.favorites-list {
  display: grid;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.favorite-item {
  background: #f9fafb;
  padding: 0.6rem;
  border-radius: 0.6rem;
}
</style>
