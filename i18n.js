/* =========================================================
   LANGUAGE TOGGLE (English / Arabic)
   - English is the default language shown on first visit.
   - Choice is remembered in localStorage across pages.
   - Translates every element with [data-i18n],
     [data-i18n-title] and [data-i18n-placeholder].
   - Also swaps the <title> and flips dir=rtl/ltr.
========================================================= */

window.KH = window.KH || {};
KH.currentLang = "en";

const KH_TITLES = {
    home:   { en: "Kareem Hesham | Cinematic Portfolio", ar: "كريم هشام | بورتفوليو سينمائي" },
    about:  { en: "Kareem Hesham | About",                ar: "كريم هشام | نبذة عني" },
    story:  { en: "Story | Kareem Hesham",                 ar: "القصة | كريم هشام" },
    skills: { en: "Skills | Kareem Hesham",                ar: "المهارات | كريم هشام" },
    works:  { en: "My Works | Kareem Hesham",              ar: "أعمالي | كريم هشام" },
    media:  { en: "Contact | Kareem Hesham",               ar: "تواصل | كريم هشام" }
};

const KH_TRANSLATIONS = {
    en: {
        "nav.home": "HOME",
        "nav.about": "ABOUT",
        "nav.story": "STORY",
        "nav.skills": "SKILLS",
        "nav.works": "MY WORKS",
        "nav.media": "MEDIA | call me",
        "cv.download": "Download CV",
        "glow.toggle": "Toggle glow intensity",
        "sound.toggle": "Toggle click sound",
        "lang.toggle": "Switch language",

        "hero.role": "Creative Front-End Developer",
        "hero.subtitle": "Building cinematic web experiences with futuristic animations and modern UI systems.",
        "hero.cta": "Explore My World",
        "journey.title": "MY JOURNEY",
        "journey.2023": "Started learning web development and UI design fundamentals.",
        "journey.2024": "Built modern websites and improved cinematic animation skills.",
        "journey.2025": "Focused on futuristic interfaces and immersive digital experiences.",
        "journey.2026": "Creating premium interactive web experiences with advanced visuals.",

        "about.title": "ABOUT ME",
        "about.role": "Creative Front-End Developer",
        "about.p1": "I am Kareem Hesham, a passionate front-end developer specialized in creating cinematic and futuristic web experiences.",
        "about.p2": "I focus on blending design, animation, and performance to build immersive digital interfaces that feel alive.",
        "about.p3": "My goal is to turn simple ideas into powerful visual experiences that leave impact.",
        "about.cta": "View My Skills",

        "story.title": "THE STORY",
        "story.heading": "From Passion To Digital Art",
        "story.p1": "Kareem Hesham started his journey with a simple curiosity about how websites were built. What began as late nights learning HTML and CSS quickly evolved into an obsession with cinematic web experiences.",
        "story.p2": "Inspired by futuristic interfaces, Batman aesthetics and interactive storytelling, Kareem focused on building websites that feel alive instead of static pages.",
        "story.p3": "Over time, he mastered front-end development, animation systems, responsive design and immersive UI experiences.",
        "story.p4": "Today, Kareem creates futuristic interfaces that combine creativity, performance and visual identity into one premium experience.",

        "skills.title": "SKILLS",
        "skills.frontend.title": "Front-End",
        "skills.frontend.desc": "HTML • CSS • JavaScript • Bootstrap",
        "skills.uiux.title": "UI / UX",
        "skills.uiux.desc": "Modern cinematic interface design and user experience.",
        "skills.anim.title": "Animations",
        "skills.anim.desc": "Creative motion effects, hover systems and interactive visuals.",

        "works.card1.title": "Portfolio",
        "works.card1.desc": "Professional personal portfolio design",
        "works.card2.title": "Landing Page",
        "works.card2.desc": "Landing Page",
        "works.card3.title": "Project 3",
        "works.card3.desc": "Caffe Firouz",
        "works.viewProject": "View Project",

        "media.title": "Contact",
        "media.subtitle": "call me",
        "media.name": "Your Name",
        "media.email": "Your Email",
        "media.subject": "Subject",
        "media.message": "Your Message",
        "media.send": "Send via WhatsApp"
    },
    ar: {
        "nav.home": "الرئيسية",
        "nav.about": "نبذة عني",
        "nav.story": "القصة",
        "nav.skills": "المهارات",
        "nav.works": "أعمالي",
        "nav.media": "تواصل | اتصل بي",
        "cv.download": "تحميل السيرة الذاتية",
        "glow.toggle": "تبديل شدة الإضاءة",
        "sound.toggle": "تبديل صوت الضغط",
        "lang.toggle": "تغيير اللغة",

        "hero.role": "مطوّر واجهات أمامية إبداعي",
        "hero.subtitle": "أبني تجارب ويب سينمائية بحركات مستقبلية وأنظمة واجهات حديثة.",
        "hero.cta": "استكشف عالمي",
        "journey.title": "رحلتي",
        "journey.2023": "بدأت تعلم تطوير الويب وأساسيات تصميم الواجهات.",
        "journey.2024": "بنيت مواقع حديثة وطوّرت مهارات الحركة السينمائية.",
        "journey.2025": "ركّزت على الواجهات المستقبلية والتجارب الرقمية الغامرة.",
        "journey.2026": "أصنع تجارب ويب تفاعلية متميزة بمرئيات متقدمة.",

        "about.title": "نبذة عني",
        "about.role": "مطوّر واجهات أمامية إبداعي",
        "about.p1": "أنا كريم هشام، مطوّر واجهات أمامية شغوف متخصص في صنع تجارب ويب سينمائية ومستقبلية.",
        "about.p2": "أركّز على الدمج بين التصميم والحركة والأداء لبناء واجهات رقمية غامرة تبدو حيّة.",
        "about.p3": "هدفي هو تحويل الأفكار البسيطة إلى تجارب بصرية قوية تترك أثرًا.",
        "about.cta": "شاهد مهاراتي",

        "story.title": "القصة",
        "story.heading": "من الشغف إلى الفن الرقمي",
        "story.p1": "بدأ كريم هشام رحلته بفضول بسيط حول كيفية بناء المواقع. وما بدأ كليالٍ طويلة لتعلم HTML وCSS تحوّل سريعًا إلى شغف بتجارب الويب السينمائية.",
        "story.p2": "مستوحيًا من الواجهات المستقبلية وجماليات باتمان والسرد التفاعلي، ركّز كريم على بناء مواقع تبدو حيّة بدلًا من صفحات ثابتة.",
        "story.p3": "بمرور الوقت، أتقن تطوير الواجهات الأمامية وأنظمة الحركة والتصميم المتجاوب وتجارب الواجهات الغامرة.",
        "story.p4": "اليوم، يصنع كريم واجهات مستقبلية تجمع بين الإبداع والأداء والهوية البصرية في تجربة واحدة متميزة.",

        "skills.title": "المهارات",
        "skills.frontend.title": "واجهات أمامية",
        "skills.frontend.desc": "HTML • CSS • JavaScript • Bootstrap",
        "skills.uiux.title": "تجربة وواجهة المستخدم",
        "skills.uiux.desc": "تصميم واجهات سينمائي حديث وتجربة مستخدم متقنة.",
        "skills.anim.title": "الحركات والتأثيرات",
        "skills.anim.desc": "تأثيرات حركة إبداعية وأنظمة تفاعل ومرئيات جذابة.",

        "works.card1.title": "بورتفوليو",
        "works.card1.desc": "تصميم بورتفوليو شخصي احترافي",
        "works.card2.title": "لاندينج بيدج",
        "works.card2.desc": "صفحة هبوط",
        "works.card3.title": "المشروع الثالث",
        "works.card3.desc": "كافيه فيروز",
        "works.viewProject": "عرض المشروع",

        "media.title": "تواصل",
        "media.subtitle": "اتصل بي",
        "media.name": "اسمك",
        "media.email": "بريدك الإلكتروني",
        "media.subject": "الموضوع",
        "media.message": "رسالتك",
        "media.send": "إرسال عبر واتساب"
    }
};

function khApplyLanguage(lang) {

    KH.currentLang = lang;

    const dict = KH_TRANSLATIONS[lang] || KH_TRANSLATIONS.en;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (dict[key] !== undefined) el.textContent = dict[key];
    });

    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
        const key = el.getAttribute("data-i18n-title");
        if (dict[key] !== undefined) el.setAttribute("title", dict[key]);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (dict[key] !== undefined) el.setAttribute("placeholder", dict[key]);
    });

    const langBtn = document.getElementById("langToggle");
    const langLabel = document.getElementById("langLabel");
    if (langLabel) langLabel.textContent = lang === "ar" ? "AR" : "EN";
    if (langBtn) {
        langBtn.setAttribute("title", dict["lang.toggle"] || "Switch language");
        langBtn.setAttribute("aria-label", dict["lang.toggle"] || "Switch language");
    }

    document.documentElement.setAttribute("lang", lang === "ar" ? "ar" : "en");
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.body.classList.toggle("lang-ar", lang === "ar");

    if (window.KH_PAGE && KH_TITLES[window.KH_PAGE]) {
        document.title = KH_TITLES[window.KH_PAGE][lang] || KH_TITLES[window.KH_PAGE].en;
    }
}

function initLangToggle() {

    // English is the default the very first time a visitor lands on the
    // site — we only honor a previously saved choice after that.
    const saved = localStorage.getItem("kh_lang");
    const initial = saved === "ar" ? "ar" : "en";

    khApplyLanguage(initial);

    const btn = document.getElementById("langToggle");
    if (!btn) return;

    btn.addEventListener("click", () => {
        const next = KH.currentLang === "ar" ? "en" : "ar";
        localStorage.setItem("kh_lang", next);
        khApplyLanguage(next);
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLangToggle);
} else {
    initLangToggle();
}
