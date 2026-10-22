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
