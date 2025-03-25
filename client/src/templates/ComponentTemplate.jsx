import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../utils/translations';

const ComponentTemplate = () => {
  // 1. הכרזה על שימוש ב-hooks בתחילת הקומפוננטה
  const { language, isRTL } = useLanguage();
  const t = useTranslation(language);
  
  return (
    <div>
      {/* 2. שימוש ב-t לכל הטקסטים בקומפוננטה */}
      <h1>{t('someTitle')}</h1>
      <p>{t('someDescription')}</p>
      
      {/* 3. שימוש ב-isRTL לפי הצורך */}
      <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
        {t('someDirectionalContent')}
      </div>
    </div>
  );
};

export default ComponentTemplate; 