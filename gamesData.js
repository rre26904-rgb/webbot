// gamesData.js
const allGames = [
    {
        name: 'حروف 🔠', command: 'حروف',
        items: ["مستشفى", "سيارة", "ديسكورد", "ميكانيكي", "رياضيات", "فيزياء", "عسير"],
        generate: (item) => ({ question: `عدد حروف كلمة: [ ${item} ] ؟`, answer: item.length.toString() })
    },
    {
        name: 'فكك 🧩', command: 'فكك',
        items: ["برمجة", "سيرفر", "سعودية", "مستقبل", "ميكانيكا"],
        generate: (item) => ({ question: `فكك الكلمة: [ ${item} ] (مسافة بين كل حرف)`, answer: item.split('').join(' ') })
    },
    {
        name: 'عواصم 🌍', command: 'عواصم',
        items: ["السعودية:الرياض", "مصر:القاهرة", "اليابان:طوكيو", "فرنسا:باريس", "الكويت:الكويت"],
        generate: (item) => {
            let [country, city] = item.split(':');
            return { question: `وش عاصمة دولة: [ ${country} ] ؟`, answer: city };
        }
    }
];

module.exports = allGames;