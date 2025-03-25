import { translations } from '../utils/translations.js';

/**
 * בודק שכל המפתחות קיימים בכל השפות
 */
function checkTranslations() {
  // מיצוי מפתחות לפי שפה
  const heKeys = extractKeys(translations.he);
  const enKeys = extractKeys(translations.en);
  const arKeys = extractKeys(translations.ar);

  const missingKeys = {
    en: [],
    he: [],
    ar: []
  };

  // בדיקה לכל שפה
  heKeys.forEach(key => {
    if (!enKeys.includes(key)) {
      missingKeys.en.push(key);
    }
    if (!arKeys.includes(key)) {
      missingKeys.ar.push(key);
    }
  });

  enKeys.forEach(key => {
    if (!heKeys.includes(key)) {
      missingKeys.he.push(key);
    }
    if (!arKeys.includes(key)) {
      missingKeys.ar.push(key);
    }
  });

  arKeys.forEach(key => {
    if (!heKeys.includes(key)) {
      missingKeys.he.push(key);
    }
    if (!enKeys.includes(key)) {
      missingKeys.en.push(key);
    }
  });
  
  console.log('Missing keys in English:', missingKeys.en);
  console.log('Missing keys in Hebrew:', missingKeys.he);
  console.log('Missing keys in Arabic:', missingKeys.ar);

  // בדיקה אם יש מפתחות חסרים
  const hasIssues = Object.values(missingKeys).some(arr => arr.length > 0);
  if (!hasIssues) {
    console.log('✅ כל המפתחות קיימים בכל השפות');
  } else {
    console.log('❌ יש מפתחות חסרים. נא להוסיף אותם לכל השפות.');
  }

  return hasIssues ? missingKeys : null;
}

function extractKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = [...keys, ...extractKeys(obj[key], newKey)];
    } else {
      keys.push(newKey);
    }
  }
  return keys;
}

// כלי עזר להוספת מפתחות חדשים לכל השפות
function addMissingTranslationKeys() {
  const missingKeys = checkTranslations();
  
  if (!missingKeys) {
    return; // אין מפתחות חסרים
  }

  const updatedTranslations = { ...translations };
  
  // הוסף מפתחות חסרים לעברית
  for (const key of missingKeys.he) {
    addKeyToTranslation(updatedTranslations.he, key, `[חסר תרגום: ${key}]`);
  }
  
  // הוסף מפתחות חסרים לאנגלית
  for (const key of missingKeys.en) {
    addKeyToTranslation(updatedTranslations.en, key, `[Missing translation: ${key}]`);
  }
  
  // הוסף מפתחות חסרים לערבית
  for (const key of missingKeys.ar) {
    addKeyToTranslation(updatedTranslations.ar, key, `[ترجمة مفقودة: ${key}]`);
  }
  
  // הדפס את התוצאה - אופציונלי להוסיף שמירה לקובץ
  console.log('Updated Translations:');
  console.log(JSON.stringify(updatedTranslations, null, 2));
}

// פונקציה להוספת מפתח מקונן לאובייקט
function addKeyToTranslation(obj, nestedKey, value) {
  const keys = nestedKey.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

// הרצת הבדיקה
checkTranslations();

// ייצוא פונקציות
export { 
  checkTranslations, 
  extractKeys, 
  addMissingTranslationKeys 
}; 