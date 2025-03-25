/**
 * סקריפט לבדיקת שימוש עקבי ב-hooks לתרגום בכל הקומפוננטות
 * לשימוש בכלי פיתוח בלבד, לא לשימוש בסביבת הייצור
 */
const fs = require('fs');
const path = require('path');

// הנתיבים שבהם נחפש קבצי React
const componentPaths = [
  path.join(__dirname, '../../src/components'),
  path.join(__dirname, '../../src/pages')
];

// דפוס החיפוש לייבוא של hooks
const importPattern = /import\s+\{\s*(useLanguage|useTranslation)\s*\}/g;
// דפוס החיפוש לשימוש ב-hooks
const hookUsagePattern = /const\s+\{\s*language\s*,?\s*(isRTL)?\s*\}\s*=\s*useLanguage\(\);?\s*const\s+t\s*=\s*useTranslation\(language\)/;

// פונקציה לסריקה רקורסיבית של תיקיות
function scanDirectory(directory) {
  const files = fs.readdirSync(directory);
  let issues = [];

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      // אם זו תיקייה, סרוק אותה רקורסיבית
      issues = [...issues, ...scanDirectory(fullPath)];
    } else if (file.match(/\.(jsx|js)$/) && !file.includes('.test.') && !file.includes('.spec.')) {
      // בדוק רק קבצי React (jsx או js)
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // בדוק אם יש ייבוא של hooks תרגום
      const hasLanguageImport = content.includes('useLanguage');
      const hasTranslationImport = content.includes('useTranslation');
      
      if (hasLanguageImport || hasTranslationImport) {
        // בדוק אם השימוש נעשה בצורה עקבית
        const isConsistent = hookUsagePattern.test(content);
        
        if (!isConsistent) {
          issues.push({
            file: fullPath.replace(__dirname + '../../../', ''),
            hasLanguageImport,
            hasTranslationImport,
            isConsistent
          });
        }
      }
    }
  }

  return issues;
}

// הפעלת הסריקה
function checkHooksConsistency() {
  let allIssues = [];
  
  for (const dir of componentPaths) {
    if (fs.existsSync(dir)) {
      const issues = scanDirectory(dir);
      allIssues = [...allIssues, ...issues];
    }
  }

  if (allIssues.length === 0) {
    console.log('✅ כל הקומפוננטות משתמשות ב-hooks באופן עקבי');
    return true;
  } else {
    console.log(`❌ נמצאו ${allIssues.length} קומפוננטות עם שימוש לא עקבי ב-hooks:`);
    allIssues.forEach(issue => {
      console.log(`   - ${issue.file}`);
    });
    return false;
  }
}

// הפעלת הבדיקה
checkHooksConsistency();

module.exports = { checkHooksConsistency }; 