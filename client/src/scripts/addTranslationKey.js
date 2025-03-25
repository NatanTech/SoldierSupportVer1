/**
 * כלי עזר להוספת מפתח תרגום חדש לכל השפות בפרויקט
 * לשימוש: 
 * node addTranslationKey.js [מפתח חדש] [תרגום עברית] [תרגום אנגלית] [תרגום ערבית]
 */
const fs = require('fs');
const path = require('path');

// נתיב לקובץ התרגומים
const translationsPath = path.join(__dirname, '../utils/translations.js');

// פונקציה להוספת מפתח חדש
function addNewTranslationKey(key, heValue, enValue, arValue) {
  if (!key) {
    console.error('❌ חובה להזין מפתח');
    return;
  }
  
  // קרא את הקובץ הנוכחי
  let content = fs.readFileSync(translationsPath, 'utf8');
  
  // הטיפול יהיה שונה לכל מפתח מקונן
  const keyParts = key.split('.');
  
  // מצא את המיקום של כל אחד מהאובייקטים של שפה
  const heMatch = content.match(/he\s*:\s*\{/);
  const enMatch = content.match(/en\s*:\s*\{/);
  const arMatch = content.match(/ar\s*:\s*\{/);
  
  if (!heMatch || !enMatch || !arMatch) {
    console.error('❌ לא ניתן למצוא את האובייקטים של השפות בקובץ');
    return;
  }
  
  // אם המפתח מקונן, נצטרך למצוא את הנתיב הנכון
  if (keyParts.length > 1) {
    console.log('⚠️ מפתח מקונן. מנסה למצוא את המיקום המתאים...');
    // הטיפול במפתחות מקוננים הוא מורכב יותר ויצריך ניתוח מעמיק של המבנה
    console.log('ℹ️ הטיפול במפתחות מקוננים נמצא בפיתוח');
    
    // כאן יש להוסיף את הלוגיקה לטיפול במפתחות מקוננים
    // זה יכול לכלול חיפוש רקורסיבי של המבנה ומציאת המיקום הנכון להוספה
  } else {
    // מפתח פשוט - הוספה בקלות יחסית
    const heIndex = findInsertionIndex(content, 'he');
    const enIndex = findInsertionIndex(content, 'en');
    const arIndex = findInsertionIndex(content, 'ar');
    
    if (heIndex && enIndex && arIndex) {
      // יוצר את השורות החדשות
      const heNewLine = `    ${key}: '${heValue || "חסר תרגום"}',\n`;
      const enNewLine = `    ${key}: '${enValue || "Missing translation"}',\n`;
      const arNewLine = `    ${key}: '${arValue || "ترجمة مفقودة"}',\n`;
      
      // מבצע את ההוספה
      content = insertAt(content, heIndex, heNewLine);
      content = insertAt(content, enIndex + heNewLine.length, enNewLine);
      content = insertAt(content, arIndex + heNewLine.length + enNewLine.length, arNewLine);
      
      // שומר את הקובץ המעודכן
      fs.writeFileSync(translationsPath, content, 'utf8');
      console.log(`✅ המפתח "${key}" נוסף בהצלחה לכל השפות`);
    } else {
      console.error('❌ לא ניתן למצוא את נקודת ההוספה המתאימה');
    }
  }
}

// פונקציה למציאת האינדקס המתאים להוספה עבור שפה מסוימת
function findInsertionIndex(content, lang) {
  const langMatch = content.match(new RegExp(`${lang}\\s*:\\s*\\{`));
  if (!langMatch) return null;
  
  const startIndex = langMatch.index + langMatch[0].length;
  
  // מוצא את המיקום הראשון אחרי תחילת האובייקט
  return startIndex;
}

// פונקציה להוספת טקסט במיקום מסוים
function insertAt(str, index, text) {
  return str.slice(0, index) + text + str.slice(index);
}

// הרצת הסקריפט
const [,, key, heValue, enValue, arValue] = process.argv;
if (key) {
  addNewTranslationKey(key, heValue, enValue, arValue);
} else {
  console.log(`
שימוש:
  node addTranslationKey.js [מפתח] [תרגום-עברית] [תרגום-אנגלית] [תרגום-ערבית]

דוגמה:
  node addTranslationKey.js welcomeMessage "ברוכים הבאים" "Welcome" "مرحبا بكم"
  `);
}

module.exports = { addNewTranslationKey }; 