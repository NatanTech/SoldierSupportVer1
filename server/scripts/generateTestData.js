require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Card = require('../models/Card');
const fs = require('fs');
const path = require('path');

// Sample data arrays
const firstNames = ['משה', 'יעל', 'אורי', 'רונית', 'יובל', 'שירה', 'אלון', 'תמר', 'אסף', 'מיכל', 'עמית', 'דנה', 'נועם', 'ליאור', 'איתן', 'גילה', 'רועי', 'הדר', 'ניר', 'אביגיל'];
const lastNames = ['כהן', 'לוי', 'מזרחי', 'אברהם', 'פרץ', 'ביטון', 'דהן', 'אוחיון', 'חדד', 'עמר', 'גבאי', 'קדוש', 'יוסף', 'שלום', 'בן דוד', 'מלכה', 'אזולאי', 'מור', 'שמעוני', 'אלפסי'];

// Donation items
const donationItems = [
  'חבילות ציוד אישי', 'אוכל ביתי מבושל', 'ציוד חורף', 'ממתקים וחטיפים', 'גרביים חמות', 
  'צעיפים', 'כפפות', 'תחתונים ומגבות', 'ערכות היגיינה', 'ספרים', 'מטענים לטלפון ניידים', 
  'ערכות עזרה ראשונה', 'פנסים ובטריות', 'שמיכות', 'אוזניות', 'תרומות לחיילים בודדים',
  'שקיות שינה', 'מזרונים', 'שמפו ומרכך', 'קרם הגנה', 'דאודורנט'
];

// Request items
const requestItems = [
  'ציוד טקטי', 'פנסים', 'ביגוד תרמי', 'תחתונים וגרביים', 'מטליות לניקוי נשק',
  'מזון באריזות אישיות', 'מגבונים', 'סוללות', 'שמפו יבש', 'ציוד ראשוני לחיילים חדשים',
  'תיקי גב קטנים', 'ערכות גילוח', 'ספרים וחומר קריאה', 'כרטיסי SIM', 'מגבות מיקרופייבר',
  'תרופות ללא מרשם', 'מטענים ניידים', 'משחקי קלפים', 'סיגריות', 'ממתקים ונשנושים'
];

// Descriptions for donations
const donationDescriptions = [
  'יש לי כמות גדולה של ציוד שקיבלתי במסגרת תרומה מארגון. אשמח להעביר לחיילים שצריכים.',
  'הכנתי אוכל ביתי טרי, אשמח שחיילים בבסיס יקבלו קצת טעם של בית.',
  'יש ברשותי ציוד חורף איכותי שמתאים לשימוש בשטח. זמין למסירה מיידית.',
  'קניתי הרבה חטיפים וממתקים במבצע, אשמח להעביר לחיילים בקו.',
  'יש לי כמה זוגות גרביים חמות שמתאימות לפעילות מבצעית ממושכת.',
  'ארגנתי מספר ערכות היגיינה אישית מלאות, כולל שמפו, סבון, משחת שיניים ומברשת.',
  'קיבלתי תרומה של ציוד חורף חדש, אשמח להעביר למי שזקוק.',
  'הכנתי עוגות ועוגיות ביתיות טריות, אפשר לקחת היום או מחר.',
  'יש ברשותי מספר פריטי ציוד שימושיים שנותרו מתקופת המילואים שלי, אשמח להעביר.',
  'רכשתי ספרים חדשים שיכולים להנעים את הזמן בבסיס או בשמירות.'
];

// Descriptions for requests
const requestDescriptions = [
  'אנחנו יחידה בדרום, מחפשים ציוד טקטי בסיסי כמו פנסים, כפפות טקטיות ואביזרים משלימים לציוד האישי.',
  'חיילים בבסיס מבקשים ציוד לשמירות החורף הקרות, במיוחד ביגוד תרמי וגרביים חמות.',
  'יחידה בצפון זקוקה דחוף לתחתונים, גרביים ומוצרי היגיינה בסיסיים.',
  'אנחנו בקו כבר שבועיים וממש צריכים רענון של מוצרי מזון ארוזים ושתייה.',
  'חיילים חדשים ביחידה זקוקים לציוד אישי משלים שלא מקבלים בצה״ל.',
  'המלאי שלנו נגמר ואנחנו מחפשים מגבונים לחים, מטליות לניקוי נשק וציוד היגיינה.',
  'אנחנו בפעילות מבצעית ממושכת ומחפשים ציוד שטח שיכול לסייע בתנאים הקשים.',
  'יחידה קטנה מחפשת מספר פריטים קטנים לשיפור החיים בבסיס מרוחק.',
  'חיילים בודדים ביחידה צריכים עזרה עם ציוד אישי בסיסי שחסר להם.',
  'פלוגה שלמה זקוקה למשלוח מרוכז של פריטים שונים עקב מחסור בבסיס.'
];

// Cities in Israel
const cities = [
  { name: 'תל אביב', lat: 32.0853, lng: 34.7818 },
  { name: 'ירושלים', lat: 31.7683, lng: 35.2137 },
  { name: 'חיפה', lat: 32.7940, lng: 34.9896 },
  { name: 'באר שבע', lat: 31.2530, lng: 34.7915 },
  { name: 'אשדוד', lat: 31.8040, lng: 34.6500 },
  { name: 'נתניה', lat: 32.3215, lng: 34.8532 },
  { name: 'ראשון לציון', lat: 31.9642, lng: 34.8048 },
  { name: 'פתח תקווה', lat: 32.0889, lng: 34.8870 },
  { name: 'אשקלון', lat: 31.6716, lng: 34.5719 },
  { name: 'רמת גן', lat: 32.0832, lng: 34.8112 },
  { name: 'בני ברק', lat: 32.0848, lng: 34.8446 },
  { name: 'בת ים', lat: 32.0158, lng: 34.7517 },
  { name: 'חולון', lat: 32.0159, lng: 34.7795 },
  { name: 'כפר סבא', lat: 32.1750, lng: 34.9070 },
  { name: 'הרצליה', lat: 32.1642, lng: 34.8472 }
];

// Add some randomization to coordinates
function randomizeCoordinates(lat, lng) {
  const latOffset = (Math.random() - 0.5) * 0.05; // About ±2.5km
  const lngOffset = (Math.random() - 0.5) * 0.05;
  return {
    lat: lat + latOffset,
    lng: lng + lngOffset
  };
}

// Generate a random phone number
function generatePhoneNumber() {
  const prefixes = ['050', '052', '053', '054', '055', '058'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  let number = '';
  for (let i = 0; i < 7; i++) {
    number += Math.floor(Math.random() * 10);
  }
  return `${prefix}-${number}`;
}

// Function to create a random date within the last 30 days
function randomDate() {
  const now = new Date();
  const days = Math.floor(Math.random() * 30);
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 60);
  now.setDate(now.getDate() - days);
  now.setHours(now.getHours() - hours);
  now.setMinutes(now.getMinutes() - minutes);
  return now;
}

// Main function to generate test data
async function generateTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing test data (optional)
    const usersDeleted = await User.deleteMany({ email: /test\d+@example\.com/ });
    console.log(`✅ Deleted ${usersDeleted.deletedCount} existing test users`);
    
    const cardsDeleted = await Card.deleteMany({ user: { $in: (await User.find({ email: /test\d+@example\.com/ })).map(u => u._id) } });
    console.log(`✅ Deleted ${cardsDeleted.deletedCount} existing test cards`);

    // Create 20 users with matching cards
    const createdUsers = [];
    
    for (let i = 1; i <= 20; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const username = `${firstName}${lastName}${Math.floor(Math.random() * 1000)}`;
      
      // Create user
      const hashedPassword = await bcrypt.hash('Test123!', 10);
      const user = new User({
        username,
        email: `test${i}@example.com`,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber: generatePhoneNumber(),
        role: i === 1 ? 'admin' : 'user' // Make first user an admin
      });
      
      await user.save();
      createdUsers.push(user);
      
      console.log(`✅ Created user: ${username} (${user.email})`);
      
      // Create 1-3 cards for each user
      const cardCount = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < cardCount; j++) {
        // Decide if it's a donation or request (random)
        const isRequest = Math.random() > 0.5;
        const cardType = isRequest ? 'request' : 'donation';
        
        // Select a random city
        const city = cities[Math.floor(Math.random() * cities.length)];
        const coords = randomizeCoordinates(city.lat, city.lng);
        
        // Choose appropriate item name and description based on type
        const itemName = isRequest 
          ? requestItems[Math.floor(Math.random() * requestItems.length)]
          : donationItems[Math.floor(Math.random() * donationItems.length)];
        
        const description = isRequest
          ? requestDescriptions[Math.floor(Math.random() * requestDescriptions.length)]
          : donationDescriptions[Math.floor(Math.random() * donationDescriptions.length)];
        
        // Create the card
        const card = new Card({
          user: user._id,
          itemName,
          description,
          cardType,
          category: Math.random() > 0.5 ? 'equipment' : 'food',
          location: {
            address: `${city.name}, ישראל`,
            coordinates: [coords.lng, coords.lat] // Note: MongoDB uses [longitude, latitude]
          },
          phoneNumber: user.phoneNumber,
          createdAt: randomDate()
        });
        
        await card.save();
        console.log(`  ➕ Created ${cardType} card: ${itemName}`);
      }
    }
    
    console.log(`🎉 Successfully created ${createdUsers.length} users with multiple cards!`);
    console.log(`👤 Admin user: test1@example.com / Test123!`);
    
    mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error generating test data:', error);
    mongoose.disconnect();
  }
}

generateTestData();
