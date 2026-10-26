/**
 * Dashboard & Welcome Logic Pure Functions
 * Supporting Time-of-Day Nature Images & Heartfelt Shayaris
 */

export const MASTER_PASSWORDS = ["Credit@123", "Soumya@123"];

export const VALID_BRANCHES = [
    "Odagaon", "Godipada", "Digapahandi", "Aska", "Buguda", "Gania", 
    "Chhatrapur", "Indanpur", "Nayagarh", "Hinjilicut", "Surada", 
    "Khalikote", "Jagannathprasad", "Bhanjanagar", "Nayagarh Urban", 
    "kodala", "Khandapada2", "Berhampur-OD", "Jagannath Vihar", 
    "Kantilo", "Patrapur", "Purushottampur", "Polasara", "Krushnaprasad", 
    "Sheragada", "Daspalla", "Digapahandi2", "Chikiti", "Sorada2", "Beguniapada"
].map(b => b.toLowerCase());

export function authenticateUser(passwordInput: string): { success: boolean; user: string | null } {
    const trimmed = passwordInput.trim();
    if (MASTER_PASSWORDS.includes(trimmed)) {
        return { success: true, user: 'MASTER' };
    }
    const lower = trimmed.toLowerCase();
    if (VALID_BRANCHES.includes(lower)) {
        const branchName = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
        return { success: true, user: branchName };
    }
    return { success: false, user: null };
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export function getTimeOfDay(hour: number): TimeOfDay {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
}

export interface WelcomeContentItem {
    badge: string;
    badgeIcon: string;
    greeting: string;
    icon: string;
    images: string[];
    shayaris: string[];
}

export const TIMING_WISE_CONTENT: Record<TimeOfDay, WelcomeContentItem> = {
    morning: {
        badge: "Good Morning Inspiration",
        badgeIcon: "fa-solid fa-cloud-sun",
        greeting: "Good Morning & Welcome to Credit",
        icon: "fa-solid fa-sun",
        images: [
            "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80", // Sun rising over misty trees
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", // Mountain dawn glow
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80", // Golden morning meadow
            "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80", // Morning lush waterfall
            "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80", // Sunrise over green hills
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80"  // Serene morning lake
        ],
        shayaris: [
            "सूरज की पहली किरण खुशी दे आपको,<br>दूसरी किरण प्यारी सी हंसी दे आपको,<br>तीसरी किरण अच्छा स्वास्थ्य और तरक्की दे आपको।<br><strong>Suprabhat & Welcome to Credit!</strong> ☀️",
            "A new morning brings new strength and endless possibilities.<br>Har subah ek nayi shuruaat hoti hai nayi umeedon ke saath.<br>May your day be filled with vibrant health, peace, and great achievements.<br><strong>Good Morning & Welcome to Credit!</strong> 🌸",
            "खिलते फूल जैसे महके जीवन तुम्हारा,<br>मुस्कुराता रहे हर पल और हर दिन तुम्हारा।<br>Tarakki ke naye aasmaan chuwo har kadam pe.<br><strong>Suprabhat & Welcome to Credit!</strong> 🌿",
            "Subah ki sunehri dhoop aapke jeevan mein nayi umang bhar de,<br>Har mushkil aasan ho aur har sapna sakaar ho jaye.<br>Wishing you boundless energy, joy, and grand success today!<br><strong>Good Morning & Welcome to Credit!</strong> 🌄",
            "वक्त और हालात चाहे जैसे भी हों,<br>मेहनत और नेक इरादों से हर मंजिल आसान हो जाती है।<br>Aapka har pal mangalmay aur kamyabi se bhara ho.<br><strong>Suprabhat & Welcome to Credit!</strong> ✨",
            "Every sunrise is an invitation to brighten someone's day.<br>Jeevan ek nayi subah hai, ise khul kar jiyo aur har lamha muskurate raho.<br>Wishing you a joyful, healthy, and highly productive day ahead!<br><strong>Good Morning & Welcome to Credit!</strong> 🌞",
            "रोशन हो आपका हर दिन, खुशियों से भरा हो हर पल,<br>सफलता चूमे आपके कदम आज, हमेशा और कल।<br><strong>Suprabhat & Welcome to Credit!</strong> 🌷"
        ]
    },
    afternoon: {
        badge: "Good Afternoon Energy",
        badgeIcon: "fa-solid fa-sun",
        greeting: "Good Afternoon & Welcome to Credit",
        icon: "fa-solid fa-sun",
        images: [
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", // Sunlit tropical ocean & nature
            "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=80", // Sunlit mountain valley
            "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80", // Sunbeams through dense canopy
            "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80", // Bright aerial nature hills
            "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80", // Crisp mountain wilderness
            "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800&q=80"  // Sunlit forest trail
        ],
        shayaris: [
            "दोपहर की धूप सिखाती है कि चमकने के लिए तपना पड़ता है,<br>हौसलों से भरी उड़ान भरने के लिए लगातार चलना पड़ता है।<br>May your afternoon be productive, energetic, and triumphant!<br><strong>Good Afternoon & Welcome to Credit!</strong> ☀️",
            "Stay focused, stay positive, and keep moving forward.<br>Aadhi manzil tay ho chuki hai, baaki safar bhi khushnuma hoga.<br>Wishing you vibrant energy, good health, and fulfilling success today.<br><strong>Shubh Dopahar & Welcome to Credit!</strong> 🌿",
            "मेहनत की धूप में जो पसीना बहाते हैं,<br>वही इतिहास के पन्नों पर अपना नाम चमकाते हैं।<br>Keep your spirits high and make every hour count!<br><strong>Good Afternoon & Welcome to Credit!</strong> 💫",
            "No matter how busy the day gets, take a deep breath and smile.<br>Khushiyaan unhe milti hain jo har lamhe ko umang se jeete hain.<br>May joy, peace, and accomplishment follow all your efforts this afternoon.<br><strong>Good Afternoon & Welcome to Credit!</strong> 🌸",
            "थकना मना है, रुकना मना है, मंजिलों को पाना ही अपना इरादा है,<br>हर चुनौती को पार करके सफलता की नई मिसाल बनाना है।<br>Have a fantastic, result-driven, and wonderful afternoon!<br><strong>Shubh Dopahar & Welcome to Credit!</strong> 🏆",
            "Midday energy brings new clarity and strength.<br>Aapki mehnat rang layegi aur har kaam asani se poora hoga.<br>Stay inspired, joyful, and healthy throughout the rest of your day!<br><strong>Good Afternoon & Welcome to Credit!</strong> ⚡"
        ]
    },
    evening: {
        badge: "Good Evening Serenity",
        badgeIcon: "fa-solid fa-cloud-moon",
        greeting: "Good Evening & Welcome to Credit",
        icon: "fa-solid fa-mountain-sun",
        images: [
            "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&q=80", // Golden sunset glow
            "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80", // Sunset reflection over water
            "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&q=80", // Warm twilight sky and hills
            "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80", // Sunset over nature landscape
            "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80", // Evening calm cabin in nature
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80"  // Dusk coastal twilight
        ],
        shayaris: [
            "ढलती हुई शाम सुकून का संदेशा लाती है,<br>दिन भर की मेहनत के बाद चेहरों पर मुस्कान खिलाती है।<br>May your evening be peaceful, cheerful, and full of warmth.<br><strong>Shubh Sandhya & Welcome to Credit!</strong> 🌇",
            "Evenings are nature's reminder to celebrate today's efforts and smile.<br>Aapne jo mehnat ki hai, uska fal barkat aur khushi layega.<br>Wishing you relaxation, good health, and joyful moments with loved ones.<br><strong>Good Evening & Welcome to Credit!</strong> 🌆",
            "शाम की ठंडी हवाएं दिल को सुकून दे जाएं,<br>आज की हर चिंता भूलकर कल के लिए नई उम्मीद जगाएं।<br>Have a calm, refreshing, and blissful evening ahead!<br><strong>Shubh Sandhya & Welcome to Credit!</strong> 🍃",
            "As the golden sun sets, let gratitude fill your heart.<br>Har din ek seekh hai aur har shaam ek nayi umeed.<br>May your evening be blessed with peace, harmony, and happiness.<br><strong>Good Evening & Welcome to Credit!</strong> 🍁",
            "सूरज ढलने पर भी उम्मीदों की रोशनी कम न हो,<br>आपके जीवन में कभी खुशियों और कामयाबी का कोई गम न हो।<br>Wishing you a delightful, peaceful, and warm evening!<br><strong>Shubh Sandhya & Welcome to Credit!</strong> 🌟",
            "The sunset paints the sky with colors of peace and hope.<br>Aapka din chahe kaisa bhi gaya ho, shaam hamesha sukoon lati hai.<br>Enjoy every precious moment this evening with good cheer and smiles!<br><strong>Good Evening & Welcome to Credit!</strong> 🕊️"
        ]
    },
    night: {
        badge: "Good Night Peace",
        badgeIcon: "fa-solid fa-moon",
        greeting: "Good Night & Welcome to Credit",
        icon: "fa-solid fa-moon",
        images: [
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80", // Dark serene lake with stars
            "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80", // Night mountain with starry sky
            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80", // Deep cosmic night horizon
            "https://images.unsplash.com/photo-1538370965046-79c0d6907d47?w=800&q=80", // Quiet forest under night sky
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80", // Calm moonlit waters
            "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80"  // Night twilight landscape
        ],
        shayaris: [
            "तारों की चादर ओढ़ कर सो जाओ सुकून से,<br>कल की नई सुबह फिर सजेगी नए जुनून से।<br>May peaceful sleep recharge your soul for greater heights tomorrow.<br><strong>Shubh Ratri & Welcome to Credit!</strong> 🌙",
            "Leave today's worries behind, embrace peaceful dreams and deep rest.<br>Raat ki khamoshi aapko sukoon aur swasthya pradaan kare.<br>Wishing you serene rest, sweet dreams, and refreshed energy for tomorrow.<br><strong>Good Night & Welcome to Credit!</strong> ✨",
            "चांदनी रात आपके सपनों को सजाए,<br>आने वाला कल आपके जीवन में खुशियों की बहार लाए।<br>Rest well with deep gratitude and calm optimism in your heart.<br><strong>Shubh Ratri & Welcome to Credit!</strong> 🌌",
            "Sleep is the best meditation for mind and body.<br>Thakan ko alvida keh kar meethe sapno ki duniya mein kho jao.<br>May tonight bring healing, calm, and sweet rest to you.<br><strong>Good Night & Welcome to Credit!</strong> 😴",
            "सितारों की रोशनी आपको लोरी सुनाए,<br>हर नई सुबह आपके लिए अनगिनत खुशियां और तरक्की लेकर आए।<br>Rest peacefully knowing you did your best today.<br><strong>Shubh Ratri & Welcome to Credit!</strong> 🌠",
            "As the world rests under the moon's gentle glow, breathe in peace.<br>Khuda aapko tandurasti, khushiyaan aur hamesha kamyabi bakashe.<br>Wishing you a restful, tranquil night and a brilliant tomorrow!<br><strong>Good Night & Welcome to Credit!</strong> 🌃"
        ]
    }
};

/**
 * Returns dynamic content based on time of day and a random/rotational selector
 */
export function getTimedWelcomeContent(hour: number, previousIndex: number = -1): {
    timeOfDay: TimeOfDay;
    badge: string;
    badgeIcon: string;
    greeting: string;
    icon: string;
    image: string;
    shayari: string;
    index: number;
} {
    const timeOfDay = getTimeOfDay(hour);
    const category = TIMING_WISE_CONTENT[timeOfDay];
    
    // Pick an index different from previousIndex if multiple items exist
    const total = category.shayaris.length;
    let selectedIdx = Math.floor(Math.random() * total);
    if (total > 1 && selectedIdx === previousIndex) {
        selectedIdx = (selectedIdx + 1) % total;
    }
    
    const imageIdx = selectedIdx % category.images.length;
    
    return {
        timeOfDay,
        badge: category.badge,
        badgeIcon: category.badgeIcon,
        greeting: category.greeting,
        icon: category.icon,
        image: category.images[imageIdx],
        shayari: category.shayaris[selectedIdx],
        index: selectedIdx
    };
}

export function validateRating(rating: number): boolean {
    return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

export function getRatingLabel(rating: number): string {
    switch (rating) {
        case 5: return '⭐⭐⭐⭐⭐ Outstanding / बहुत बढ़िया!';
        case 4: return '⭐⭐⭐⭐ Very Good / बहुत अच्छा!';
        case 3: return '⭐⭐⭐ Good / अच्छा!';
        case 2: return '⭐⭐ Fair / ठीक-ठाक!';
        case 1: return '⭐ Needs Improvement / सुधार चाहिए';
        default: return 'Select your rating (1 to 5 stars)';
    }
}

export function calculateAverageRating(ratings: number[]): { average: number; count: number } {
    if (!ratings || ratings.length === 0) {
        return { average: 5.0, count: 1 };
    }
    const sum = ratings.reduce((acc, curr) => acc + curr, 0);
    const avg = Math.round((sum / ratings.length) * 10) / 10;
    return { average: avg, count: ratings.length };
}

export interface ClientDetailData {
    loanId: string;
    memberName: string;
    groupName: string;
    subCategory: string;
    cmRemarks: string;
}

export function formatClientModalDetails(
    loanId?: string,
    memberName?: string,
    groupName?: string,
    subCategory?: string,
    cmRemarks?: string
): ClientDetailData {
    return {
        loanId: (loanId || '-').trim(),
        memberName: (memberName || '-').trim(),
        groupName: (groupName || '-').trim(),
        subCategory: (subCategory && subCategory.trim()) ? subCategory.trim() : 'None / Not Specified',
        cmRemarks: (cmRemarks && cmRemarks.trim()) ? cmRemarks.trim() : 'No remarks recorded'
    };
}

export interface FestivalOccasionInfo {
    isFestival: boolean;
    occasionName: string;
    occasionHindi: string;
    formattedDate: string;
    wishTitle: string;
    wishMessage: string;
    wishHindi: string;
    symbol: string;
    themeColor: string;
    bgGradient: string;
    hasLightsSky: boolean;
    hasBalloons: boolean;
}

export function getFestivalAndOccasionInfo(targetDate: Date = new Date()): FestivalOccasionInfo {
    const month = targetDate.getMonth() + 1; // 1-12
    const day = targetDate.getDate(); // 1-31
    const year = targetDate.getFullYear();

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const dayName = dayNames[targetDate.getDay()];
    const monthName = monthNames[targetDate.getMonth()];
    const formattedDate = `${dayName}, ${day} ${monthName} ${year}`;

    // 1. Diwali & Dhanteras / Kali Puja festive season (Late October / Early November)
    if ((month === 10 && day >= 24) || (month === 11 && day <= 12)) {
        return {
            isFestival: true,
            occasionName: "Shubh Deepavali & Dhanteras Mahotsav",
            occasionHindi: "दीपावली व धनतेरस महापर्व की हार्दिक शुभकामनाएं",
            formattedDate,
            wishTitle: "✨ Shubh Deepavali & Festive Lights Celebration ✨",
            wishMessage: "May the celestial golden lights of Deepavali illuminate your path with infinite wealth, vibrant health, supreme peace, and joyful achievements for you and your family!",
            wishHindi: "सुख, समृद्धि, शांति और उत्तम स्वास्थ्य के मंगल दीप आपके जीवन को सदैव जगमगाते रहें। दीपावली महापर्व की अनंत शुभकामनाएं!",
            symbol: "🪔",
            themeColor: "#f59e0b",
            bgGradient: "linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #1e1b4b 100%)",
            hasLightsSky: true,
            hasBalloons: true
        };
    }

    // 2. Chhath Puja (Late October / November)
    if ((month === 10 && day >= 28) || (month === 11 && day >= 13 && day <= 18)) {
        return {
            isFestival: true,
            occasionName: "Shubh Chhath Puja Mahaparv",
            occasionHindi: "छठ पूजा महापर्व की हार्दिक शुभकामनाएं",
            formattedDate,
            wishTitle: "🌅 Shubh Chhath Puja Blessings 🌅",
            wishMessage: "May Lord Surya and Chhathi Maiya shower divine radiance, good health, longevity, and boundless prosperity upon you and your loved ones!",
            wishHindi: "सूर्यदेव और छठी मइया की असीम कृपा से आपका जीवन सदैव निरोगी, समृद्ध और खुशहाल रहे।",
            symbol: "☀️",
            themeColor: "#ea580c",
            bgGradient: "linear-gradient(135deg, #431407 0%, #7c2d12 50%, #1e1b4b 100%)",
            hasLightsSky: true,
            hasBalloons: true
        };
    }

    // 3. New Year (Dec 31 - Jan 3)
    if ((month === 12 && day >= 31) || (month === 1 && day <= 3)) {
        return {
            isFestival: true,
            occasionName: `Happy New Year ${month === 12 ? year + 1 : year}`,
            occasionHindi: "नव वर्ष की हार्दिक शुभकामनाएं",
            formattedDate,
            wishTitle: `🎉 Happy New Year ${month === 12 ? year + 1 : year} Celebration 🎉`,
            wishMessage: `Wishing you and your family 365 days of good health, magnificent milestones, joy, and grand success in ${month === 12 ? year + 1 : year}!`,
            wishHindi: "यह नया साल आपके जीवन में नई उम्मीदें, अपार खुशियां, उत्तम स्वास्थ्य और सफलता के नए कीर्तिमान लेकर आए।",
            symbol: "🎊",
            themeColor: "#ec4899",
            bgGradient: "linear-gradient(135deg, #1e1b4b 0%, #172554 50%, #3b0764 100%)",
            hasLightsSky: true,
            hasBalloons: true
        };
    }

    // 4. Makar Sankranti / Pongal / Lohri (Jan 13 - 17)
    if (month === 1 && day >= 13 && day <= 17) {
        return {
            isFestival: true,
            occasionName: "Happy Makar Sankranti & Pongal",
            occasionHindi: "मकर संक्रांति व पोंगल की हार्दिक शुभकामनाएं",
            formattedDate,
            wishTitle: "🪁 Makar Sankranti & Pongal Festive Joy 🪁",
            wishMessage: "May the golden rays of the Uttarayan sun bless your days with sweet harvested happiness, warmth, and soaring success!",
            wishHindi: "तिल-गुड़ की मिठास और पतंगों की उड़ान आपके जीवन में सुख, शांति और समृद्धि की नई ऊंचाई लाए।",
            symbol: "🪁",
            themeColor: "#f59e0b",
            bgGradient: "linear-gradient(135deg, #1c1917 0%, #451a03 50%, #1e1b4b 100%)",
            hasLightsSky: true,
            hasBalloons: true
        };
    }

    // 5. Republic Day (Jan 26)
    if (month === 1 && day === 26) {
        return {
            isFestival: true,
            occasionName: "Happy Republic Day of India",
            occasionHindi: "गणतंत्र दिवस की हार्दिक शुभकामनाएं",
            formattedDate,
            wishTitle: "🇮🇳 Proud Republic Day Greetings 🇮🇳",
            wishMessage: "Saluting the glorious constitution, rich heritage, and sovereign spirit of our nation. Wishing you a proud and inspired Republic Day!",
            wishHindi: "संविधान और संप्रभुता के पावन पर्व पर देश के अमर बलिदानियों को नमन। जय हिन्द, जय भारत!",
            symbol: "🇮🇳",
            themeColor: "#0284c7",
            bgGradient: "linear-gradient(135deg, #082f49 0%, #1e1b4b 50%, #064e3b 100%)",
            hasLightsSky: true,
            hasBalloons: true
        };
    }

    // 6. Maha Shivratri (Feb/March)
    if ((month === 2 && day >= 20) || (month === 3 && day <= 10)) {
        return {
            isFestival: true,
            occasionName: "Har Har Mahadev - Shubh Maha Shivratri",
            occasionHindi: "महाशिवरात्रि महापर्व की हार्दिक शुभकामनाएं",
            formattedDate,
            wishTitle: "🔱 Shubh Maha Shivratri Blessings 🔱",
            wishMessage: "May Lord Shiva bestow divine wisdom, profound peace, unwavering strength, and everlasting auspiciousness upon your journey!",
            wishHindi: "देवों के देव महादेव का आशीर्वाद आपके परिवार पर सदैव बना रहे। हर हर महादेव!",
            symbol: "🔱",
            themeColor: "#8b5cf6",
            bgGradient: "linear-gradient(135deg, #1e1b4b 0%, #2e1065 50%, #0f172a 100%)",
            hasLightsSky: true,
            hasBalloons: true
        };
    }

    // 7. Holi & Dola Purnima (March 15-30)
    if (month === 3 && day >= 15 && day <= 30) {
        return {
            isFestival: true,
            occasionName: "Happy Holi & Dola Purnima",
            occasionHindi: "होली व डोल पूर्णिमा की हार्दिक शुभकामनाएं",
            formattedDate,
            wishTitle: "🎨 Vibrant Holi Celebration & Colors of Joy 🎨",
            wishMessage: "May your life be painted with dazzling colors of joy, sweet affection, harmony, and grand prosperity this Holi!",
            wishHindi: "रंगों का यह पावन उत्सव आपके जीवन में प्रेम, आनंद, उत्साह और खुशहाली के अनगिनत रंग भर दे।",
            symbol: "🎨",
            themeColor: "#ec4899",
            bgGradient: "linear-gradient(135deg, #3b0764 0%, #701a75 50%, #1e1b4b 100%)",
            hasLightsSky: true,
            hasBalloons: true
        };
    }

    // 8. Odia New Year (Maha Vishuva / Pana Sankranti) & Baisakhi / Poila Boishakh (April 13 - 16)
    if (month === 4 && day >= 13 && day <= 16) {
        return {
            isFestival: true,
            occasionName: "Maha Vishuva Pana Sankranti & Odia New Year",
            occasionHindi: "महाविषुव संक्रांति, उड़िया नववर्ष व बैसाखी की शुभकामनाएं",
            formattedDate,
            wishTitle: "🌿 Subha Maha Vishuva Pana Sankranti 🌿",
            wishMessage: "ମହାବିଷୁବ ସଂକ୍ରାନ୍ତି ଓ ଓଡ଼ିଆ ନବବର୍ଷର ଅନେକ ଅନେକ ଶୁଭେଚ୍ଛା! May the refreshing Pana and divine grace bring peace, good health, and sweet prosperity to your life.",
            wishHindi: "महाविषुव संक्रांति और नववर्ष आपके जीवन में अमृतमयी ऊर्जा, सुख और अपार समृद्धि लेकर आए।",
            symbol: "🏺",
            themeColor: "#10b981",
            bgGradient: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #1e1b4b 100%)",
            hasLightsSky: true,
            hasBalloons: true
        };
    }

    // 9. Rath Yatra (June / July)
    if ((month === 6 && day >= 20) || (month === 7 && day <= 15)) {
        return {
            isFestival: true,
            occasionName: "Jai Jagannath - Holy Rath Yatra Mahotsav",
            occasionHindi: "पवित्र रथयात्रा महोत्सव की हार्दिक शुभकामनाएं",
            formattedDate,
            wishTitle: "🚩 Jai Jagannath - Grand Rath Yatra Blessings 🚩",
            wishMessage: "ଜୟ ଜଗନ୍ନାଥ! May Mahaprabhu Jagannath, Balabhadra, and Devi Subhadra bless your home with divine grace, good health, and everlasting happiness.",
            wishHindi: "महाप्रभु जगन्नाथ जी की कृपा से आपके जीवन का रथ सुख, शांति, भक्ति और सफलता की ओर अग्रसर रहे।",
            symbol: "🚩",
            themeColor: "#ea580c",
            bgGradient: "linear-gradient(135deg, #451a03 0%, #7c2d12 50%, #1e1b4b 100%)",
            hasLightsSky: true,
            hasBalloons: true
        };
    }

    // 10. Independence Day (August 15)
    if (month === 8 && day === 15) {
        return {
            isFestival: true,
            occasionName: "Happy Independence Day of India",
            occasionHindi: "स्वतंत्रता दिवस की हार्दिक शुभकामनाएं",
            formattedDate,
            wishTitle: "🇮🇳 Happy Independence Day 🇮🇳",
            wishMessage: "Saluting the valor of our freedom heroes and celebrating 79 years of independence, unity, and growth. Vande Mataram!",
            wishHindi: "आजादी के पावन पर्व पर सभी देशवासियों को हार्दिक शुभकामनाएं। विजयी विश्व तिरंगा प्यारा, झंडा ऊंचा रहे हमारा!",
            symbol: "🇮🇳",
            themeColor: "#0284c7",
            bgGradient: "linear-gradient(135deg, #082f49 0%, #1e1b4b 50%, #064e3b 100%)",
            hasLightsSky: true,
            hasBalloons: true
        };
    }

    // 11. Raksha Bandhan (August 18 - 25)
    if (month === 8 && day >= 18 && day <= 25) {
        return {
            isFestival: true,
            occasionName: "Happy Raksha Bandhan",
            occasionHindi: "रक्षाबंधन पर्व की हार्दिक शुभकामनाएं",
            formattedDate,
            wishTitle: "🧵 Happy Raksha Bandhan Celebrations 🧵",
            wishMessage: "Celebrating the sacred bond of unconditional love, lifelong care, and protection. Wishing you a blessed and joyful Raksha Bandhan!",
            wishHindi: "स्नेह और विश्वास का पावन धागा आपके जीवन में सदा खुशियां और मधुर रिश्ते बनाए रखे।",
            symbol: "🧵",
            themeColor: "#ec4899",
            bgGradient: "linear-gradient(135deg, #1e1b4b 0%, #4c0519 50%, #1e1b4b 100%)",
            hasLightsSky: true,
            hasBalloons: true
        };
    }

    // 12. Ganesh Chaturthi (August 26 - Sep 15)
    if ((month === 8 && day >= 26) || (month === 9 && day <= 15)) {
        return {
            isFestival: true,
            occasionName: "Ganpati Bappa Morya - Shubh Ganesh Chaturthi",
            occasionHindi: "गणेश चतुर्थी महापर्व की हार्दिक शुभकामनाएं",
            formattedDate,
            wishTitle: "🐘 Ganpati Bappa Morya 🐘",
            wishMessage: "May Lord Ganesha, the Vighnaharta, remove all obstacles from your journey and bestow wisdom, health, and abundant prosperity!",
            wishHindi: "विघ्नहर्ता भगवान श्री गणेश आपके जीवन के सभी संकट दूर करें और सुख-समृद्धि का वरदान दें।",
            symbol: "🐘",
            themeColor: "#f59e0b",
            bgGradient: "linear-gradient(135deg, #1e1b4b 0%, #451a03 50%, #1e1b4b 100%)",
            hasLightsSky: true,
            hasBalloons: true
        };
    }

    // 13. Gandhi Jayanti (Oct 2)
    if (month === 10 && day === 2) {
        return {
            isFestival: true,
            occasionName: "Shubh Gandhi Jayanti",
            occasionHindi: "गांधी जयंती की हार्दिक शुभकामनाएं",
            formattedDate,
            wishTitle: "🕊️ Remembering Mahatma Gandhi 🕊️",
            wishMessage: "Honoring the father of the nation and upholding eternal values of truth, harmony, non-violence, and selfless dedication.",
            wishHindi: "सत्य, अहिंसा और सादगी के अमर प्रतीक राष्ट्रपिता महात्मा गांधी को कोटि-कोटि नमन।",
            symbol: "🕊️",
            themeColor: "#0284c7",
            bgGradient: "linear-gradient(135deg, #082f49 0%, #1e1b4b 50%, #064e3b 100%)",
            hasLightsSky: true,
            hasBalloons: true
        };
    }

    // 14. Christmas (Dec 22 - 28)
    if (month === 12 && day >= 22 && day <= 28) {
        return {
            isFestival: true,
            occasionName: "Merry Christmas & Season's Greetings",
            occasionHindi: "क्रिसमस व नववर्ष की हार्दिक शुभकामनाएं",
            formattedDate,
            wishTitle: "🎄 Merry Christmas Celebrations 🎄",
            wishMessage: "May the wonder of Christmas fill your heart with divine peace, warmth, cheerful laughter, and cherished memories with loved ones!",
            wishHindi: "प्रभु ईसा मसीह की कृपा से आपका जीवन प्रेम, शांति, सद्भाव और आनंद से परिपूर्ण रहे।",
            symbol: "🎄",
            themeColor: "#10b981",
            bgGradient: "linear-gradient(135deg, #064e3b 0%, #1e1b4b 50%, #881337 100%)",
            hasLightsSky: true,
            hasBalloons: true
        };
    }

    // 15. Default: Auspicious Daily Occasion for any date of the year
    return {
        isFestival: false,
        occasionName: "Shubh Din & Auspicious Daily Greetings",
        occasionHindi: "आज का दिन आपके लिए शुभ व मंगलमय हो",
        formattedDate,
        wishTitle: "🌟 Auspicious Day Celebration & Warm Wishes 🌟",
        wishMessage: `Wishing you a vibrant, healthy, and highly prosperous day on this auspicious ${dayName}! May your efforts bring outstanding accomplishments and peace to your family.`,
        wishHindi: "आज का पावन दिन आपके जीवन में नई ऊर्जा, सकारात्मक विचार, उत्तम स्वास्थ्य और सफलता के स्वर्णिम अवसर लेकर आए।",
        symbol: "✨",
        themeColor: "#6366f1",
        bgGradient: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #0f172a 100%)",
        hasLightsSky: true,
        hasBalloons: true
    };
}

