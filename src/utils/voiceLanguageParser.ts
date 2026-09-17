import { INDIAN_STATES_DATA } from '../data/locationData';
import { Language } from '../components/farmer-app/types';

export interface VarietyEntry {
  id: string;
  name: string;
  names: {
    en: string;
    hi: string;
    mr: string;
  };
  keywords: string[];
  spotPriceBenchmark?: number;
  isDefault?: boolean;
}

export interface MasterCropEntry {
  id: string;
  canonicalName: string;
  names: {
    en: string;
    hi: string;
    mr: string;
  };
  category: 'Grains' | 'Oilseeds' | 'Cash Crops' | 'Pulses' | 'Vegetables' | 'Fruits';
  defaultVariety: string;
  varieties: VarietyEntry[];
  keywords: string[];
  defaultMandi: {
    name: string;
    district: string;
    state: string;
  };
  spotPriceBenchmark: number;
  expectedPriceBenchmark: number;
  defaultAction: 'HOLD' | 'SELL';
  daysToWait: number;
  gainPerQtl: number;
  reasons: {
    en: string[];
    hi: string[];
    mr: string[];
  };
}

export interface ParsedVoiceQuery {
  rawTranscript: string;
  detectedLanguage: Language;
  crop?: string;
  cropId?: string;
  variety?: string;
  varietyId?: string;
  cropDisplayName?: {
    en: string;
    hi: string;
    mr: string;
  };
  varietyDisplayName?: {
    en: string;
    hi: string;
    mr: string;
  };
  quantity?: number;
  state?: string;
  district?: string;
  intent: 'advice' | 'markets' | 'buyers' | 'my-crops' | 'general';
  confidence: number;
  isAmbiguous: boolean;
  clarificationPrompt?: {
    en: string;
    hi: string;
    mr: string;
  };
  marketBenchmark?: {
    spotPrice: number;
    expectedPrice: number;
    action: 'HOLD' | 'SELL';
    daysToWait: number;
    mandi: string;
    district: string;
    state: string;
  };
}

// Master Crop and Variety Registry covering all crops across AgriDirect Pulse
export const MASTER_CROP_REGISTRY: MasterCropEntry[] = [
  {
    id: 'wheat',
    canonicalName: 'Wheat',
    names: { en: 'Wheat', hi: 'गेहूं', mr: 'गहू' },
    category: 'Grains',
    defaultVariety: 'Sharbati Grade A',
    varieties: [
      {
        id: 'sharbati',
        name: 'Sharbati Grade A',
        names: { en: 'Sharbati (Grade A)', hi: 'शरबती (ग्रेड A)', mr: 'शरबती (दर्जा A)' },
        keywords: ['sharbati', 'c-306', 'c306', 'शरबती', 'सी ३०६', 'सी-३०६', 'सी 306', 'सी-306'],
        spotPriceBenchmark: 2860,
        isDefault: true,
      },
      {
        id: 'lokwan',
        name: 'Lokwan Milling Benchmark',
        names: { en: 'Lokwan', hi: 'लोकवन', mr: 'लोकवन' },
        keywords: ['lokwan', 'lokone', 'lok-1', 'लोकवन', 'लोकवान'],
        spotPriceBenchmark: 2640,
      },
      {
        id: 'durum',
        name: 'Durum / Kathia Wheat',
        names: { en: 'Durum / Kathia', hi: 'कठिया / ड्यूरम गेहूं', mr: 'कठिया / ड्युरम गहू' },
        keywords: ['durum', 'kathia', 'malavshree', 'कठिया', 'ड्यूरम', 'ड्युरम'],
        spotPriceBenchmark: 2720,
      },
    ],
    keywords: [
      'wheat', 'gehun', 'gehu', 'gahu', 'gahuve', 'kanak', 'gehun ki fasal',
      'गेहूं', 'गेहू', 'गहू', 'गव्हाचे', 'कनक', 'गव्हा', 'गेहूं की फसल',
    ],
    defaultMandi: { name: 'Sehore APMC Yard', district: 'Sehore', state: 'Madhya Pradesh' },
    spotPriceBenchmark: 2860,
    expectedPriceBenchmark: 2950,
    defaultAction: 'HOLD',
    daysToWait: 3,
    gainPerQtl: 90,
    reasons: {
      en: [
        'Weekly milling demand is rising (+3.1% momentum) with high flour mill inquiries.',
        'Sehore & Khanna regional arrivals are decreasing slightly, creating favorable supply conditions.',
        'Expected gain of +₹90/quintal over the next 3 to 5 days.',
      ],
      hi: [
        'गेहूं के भाव में पिछले सप्ताह से +3.1% की तेजी का रुख है।',
        'आटा मिलों और थोक खरीदारों की मांग मजबूत है और आवक नियंत्रित है।',
        'अगले 3 से 5 दिनों में प्रति क्विंटल लगभग ₹90 का अतिरिक्त लाभ मिल सकता है।',
      ],
      mr: [
        'गेल्या आठवड्यापासून गव्हाच्या दरात +३.१% वाढीचा कल सुरू आहे.',
        'पीठ गिरण्या आणि खरेदीदारांची मागणी वाढली असून आवक कमी आहे.',
        'पुढील ३ ते ५ दिवसांत प्रति क्विंटल साधारण ₹९० पर्यंत नफा शक्य आहे.',
      ],
    },
  },
  {
    id: 'soybean',
    canonicalName: 'Soybean',
    names: { en: 'Soybean', hi: 'सोयाबीन', mr: 'सोयाबीन' },
    category: 'Oilseeds',
    defaultVariety: 'Yellow Seed JS-9560',
    varieties: [
      {
        id: 'yellow_seed',
        name: 'Yellow Seed JS-9560',
        names: { en: 'Yellow Seed (JS 9560)', hi: 'पीला दाना (JS 9560)', mr: 'पिवळे सोयाबीन (JS 9560)' },
        keywords: ['yellow seed', 'js 9560', 'js9560', 'js 335', 'js335', 'पीला दाना', 'पिवळे सोयाबीन'],
        spotPriceBenchmark: 4680,
        isDefault: true,
      },
      {
        id: 'black_soya',
        name: 'Black Soybean (Kalitur)',
        names: { en: 'Black Soybean', hi: 'काला सोयाबीन', mr: 'काळे सोयाबीन' },
        keywords: ['black soybean', 'kalitur', 'काला सोयाबीन', 'काळे सोयाबीन'],
        spotPriceBenchmark: 4420,
      },
    ],
    keywords: [
      'soybean', 'soyabean', 'soya', 'soya bean', 'soya seed', 'yellow soybean',
      'सोयाबीन', 'सोया', 'सोया बीन', 'सोया दाना', 'सोयाबीनचे',
    ],
    defaultMandi: { name: 'Dewas Krishi Mandi', district: 'Dewas', state: 'Madhya Pradesh' },
    spotPriceBenchmark: 4680,
    expectedPriceBenchmark: 4680,
    defaultAction: 'SELL',
    daysToWait: 0,
    gainPerQtl: 0,
    reasons: {
      en: [
        'Spot rates at Dewas & Indore are at their optimal monthly peak.',
        'Solvent extraction plants are offering instant spot settlement today.',
        'Heavy port imports of edible oil may limit further upside this week.',
      ],
      hi: [
        'देवास और इंदौर मंडी में वर्तमान भाव इस महीने के शीर्ष स्तर पर हैं।',
        'सॉल्वेंट प्लांट तत्काल नकद व डिजिटल भुगतान के साथ प्रीमियम भाव दे रहे हैं।',
        'आगामी दिनों में आयातित खाद्य तेल के दबाव से भाव स्थिर रह सकते हैं, अतः आज बेचना उत्तम है।',
      ],
      mr: [
        'देवास व इंदूर बाजारपेठेत सध्याचे दर या महिन्यातील उच्च पातळीवर आहेत.',
        'तेल कारखाने थेट तत्काळ पेमेंटसह उत्तम दर देत आहेत.',
        'येत्या काही दिवसांत दरात मोठी वाढ अपेक्षित नसल्याने आजच विक्री करणे फायद्याचे ठरेल.',
      ],
    },
  },
  {
    id: 'cotton',
    canonicalName: 'Cotton',
    names: { en: 'Cotton', hi: 'कपास', mr: 'कापूस' },
    category: 'Cash Crops',
    defaultVariety: 'Shankar-6 Long Staple',
    varieties: [
      {
        id: 'shankar_6',
        name: 'Shankar-6 Long Staple',
        names: { en: 'Shankar-6 Staple', hi: 'शंकर-6 रेशा', mr: 'शंकर-६ लांब धागा' },
        keywords: ['shankar-6', 'shankar 6', 'shankar-६', 'shankar ६', 's-6', 's6', 'शंकर 6', 'शंकर-6', 'शंकर ६', 'शंकर-६'],
        spotPriceBenchmark: 7240,
        isDefault: true,
      },
      {
        id: 'bt_cotton',
        name: 'Medium Staple Desi / BT',
        names: { en: 'Medium Staple', hi: 'मध्यम रेशा कपास', mr: 'मध्यम धागा कापूस' },
        keywords: ['medium staple', 'bt cotton', 'देशी कपास', 'मध्यम रेशा'],
        spotPriceBenchmark: 6980,
      },
    ],
    keywords: [
      'cotton', 'kapas', 'kapus', 'rui', 'kapas ki fasal', 'shankar-6 cotton',
      'कपास', 'कापूस', 'रुई', 'कापसाचे', 'कपास की फसल', 'कापूस भाव',
    ],
    defaultMandi: { name: 'Rajkot APMC Market', district: 'Rajkot', state: 'Gujarat' },
    spotPriceBenchmark: 7240,
    expectedPriceBenchmark: 7420,
    defaultAction: 'HOLD',
    daysToWait: 4,
    gainPerQtl: 180,
    reasons: {
      en: [
        'Textile spinning mills report active export contracts for Shankar-6 fiber.',
        'Arrivals in Rajkot and Akola yards are stable with solid competitive bidding.',
        'Holding for 4 days indicates an expected realization gain of +₹180/quintal.',
      ],
      hi: [
        'टेक्सटाइल मिलों में शंकर-6 रेशे की निर्यात मांग काफी मजबूत है।',
        'राजकोट और अकोला मंडियों में आवक सीमित होने से बोली तेज चल रही है।',
        '4 दिन रुकने पर प्रति क्विंटल ₹180 तक का अतिरिक्त लाभ संभावित है।',
      ],
      mr: [
        'कापूस जिनिंग व सूत गिरण्यांकडून शंकर-६ वाणाला मोठी मागणी आहे.',
        'राजकोट व अकोला बाजारपेठेत दर्जेदार कापसाची आवक मर्यादित आहे.',
        '४ दिवस थांबल्यास प्रति क्विंटल ₹१८० पर्यंत अधिक दर मिळण्याची शक्यता आहे.',
      ],
    },
  },
  {
    id: 'basmati',
    canonicalName: 'Basmati Rice',
    names: { en: 'Basmati Rice', hi: 'बासमती धान', mr: 'बासमती तांदूळ' },
    category: 'Grains',
    defaultVariety: 'Pusa 1121 Extra Long',
    varieties: [
      {
        id: 'pusa_1121',
        name: 'Pusa 1121 Extra Long',
        names: { en: 'Pusa 1121', hi: 'पूसा 1121', mr: 'पुसा ११२१' },
        keywords: ['1121', 'pusa 1121', 'pusa-1121', '११२१', 'पूसा 1121', 'पूसा-1121', 'पुसा ११२१'],
        spotPriceBenchmark: 4320,
        isDefault: true,
      },
      {
        id: 'pusa_1509',
        name: 'Pusa 1509 Slender',
        names: { en: 'Pusa 1509', hi: 'पूसा 1509', mr: 'पुसा १५०९' },
        keywords: ['1509', 'pusa 1509', 'pusa-1509', '१५०९', 'पूसा 1509', 'पुसा १५०९'],
        spotPriceBenchmark: 3880,
      },
      {
        id: 'sharbati_rice',
        name: 'Sharbati Non-Basmati Aromatic',
        names: { en: 'Sharbati Rice', hi: 'शरबती चावल/धान', mr: 'शरबती तांदूळ' },
        keywords: ['sharbati rice', 'sharbati paddy', 'शरबती धान'],
        spotPriceBenchmark: 2950,
      },
    ],
    keywords: [
      'basmati', 'rice', 'paddy', 'dhan', 'chawal', 'bhaat', 'tandul', 'basmati rice', 'basmati paddy',
      'बासमती', 'धान', 'चावल', 'बासमती धान', 'तांदूळ', 'भात', 'बासमती तांदूळ', 'धान्य',
    ],
    defaultMandi: { name: 'Karnal Basmati Hub', district: 'Karnal', state: 'Haryana' },
    spotPriceBenchmark: 4320,
    expectedPriceBenchmark: 4460,
    defaultAction: 'HOLD',
    daysToWait: 3,
    gainPerQtl: 140,
    reasons: {
      en: [
        'Port export demand for Middle East shipments is surging (+22% year-on-year).',
        'Karnal & Kurukshetra millers are actively bidding for high grain-length lots.',
        'Holding for 3 days offers a projected gain of +₹140/quintal.',
      ],
      hi: [
        'खाड़ी देशों के लिए बासमती चावल के निर्यात ऑर्डर में भारी वृद्धि है।',
        'करनाल और कैथल के मिलर्स उच्च गुणवत्ता वाले पूसा 1121 धान के लिए अच्छी बोली लगा रहे हैं।',
        '3 दिन इंतजार करने पर प्रति क्विंटल ₹140 का अतिरिक्त मुनाफा मिल सकता है।',
      ],
      mr: [
        'मध्यपूर्वेतील देशांना बासमती तांदूळ निर्यातीची मागणी मोठ्या प्रमाणावर वाढली आहे.',
        'करनाल केंद्रात लांब दाण्याच्या पुसा ११२१ धानाला विशेष पसंती मिळत आहे.',
        '३ दिवस थांबल्यास प्रति क्विंटल ₹१४० पर्यंत जास्तीचा दर मिळण्याचा अंदाज आहे.',
      ],
    },
  },
  {
    id: 'mustard',
    canonicalName: 'Mustard Seed',
    names: { en: 'Mustard Seed', hi: 'सरसों', mr: 'मोहरी' },
    category: 'Oilseeds',
    defaultVariety: 'Pusa Bold 42% Oil',
    varieties: [
      {
        id: 'pusa_bold',
        name: 'Pusa Bold 42% Oil',
        names: { en: 'Pusa Bold', hi: 'पूसा बोल्ड', mr: 'पुसा बोल्ड' },
        keywords: ['pusa bold', 'bold seed', 'पूसा बोल्ड', 'पुसा बोल्ड'],
        spotPriceBenchmark: 5480,
        isDefault: true,
      },
      {
        id: 'black_mustard',
        name: 'Rai / Black Mustard',
        names: { en: 'Rai / Black Mustard', hi: 'राई / काली सरसों', mr: 'काळी मोहरी / राई' },
        keywords: ['rai', 'black mustard', 'काली सरसों', 'राई', 'काळी मोहरी'],
        spotPriceBenchmark: 5260,
      },
    ],
    keywords: [
      'mustard', 'sarson', 'rai', 'mohari', 'tori', 'mustard seed', 'rapeseed',
      'सरसों', 'राई', 'मोहरी', 'तोरी', 'सरसो', 'मोहरीचे',
    ],
    defaultMandi: { name: 'Bharatpur Mandi', district: 'Bharatpur', state: 'Rajasthan' },
    spotPriceBenchmark: 5480,
    expectedPriceBenchmark: 5590,
    defaultAction: 'HOLD',
    daysToWait: 3,
    gainPerQtl: 110,
    reasons: {
      en: [
        'Mustard oil crushing units in Rajasthan & Haryana are aggressively refilling stock.',
        'High oil-percentage lots (>41.5%) receive immediate cash premiums.',
        'Expected upside of +₹110/quintal in the coming 3-5 days.',
      ],
      hi: [
        'राजस्थान और हरियाणा के तेल मिलों द्वारा सरसों की तेज खरीद की जा रही है।',
        '41.5% से अधिक तेल वाले माल पर व्यापारी अतिरिक्त प्रीमियम दे रहे हैं।',
        'अगले 3-5 दिनों में ₹110 प्रति क्विंटल की तेजी आने की पूरी संभावना है।',
      ],
      mr: [
        'राजस्थान व हरियाणातील तेल गिरण्यांकडून मोहरीला सतत मागणी आहे.',
        '४१.५% पेक्षा जास्त तेल असलेल्या मालाला अधिक दर मिळत आहे.',
        'पुढील ३ ते ५ दिवसांत प्रति क्विंटल ₹११० वाढीची शक्यता आहे.',
      ],
    },
  },
  {
    id: 'chana',
    canonicalName: 'Chana (Desi Chickpea)',
    names: { en: 'Chana', hi: 'चना', mr: 'हरभरा' },
    category: 'Pulses',
    defaultVariety: 'Desi Bold Grade 1',
    varieties: [
      {
        id: 'desi_bold',
        name: 'Desi Bold Grade 1',
        names: { en: 'Desi Bold', hi: 'देसी चना बोल्ड', mr: 'देशी हरभरा' },
        keywords: ['desi bold', 'desi chana', 'देसी चना', 'देशी हरभरा', 'चना दाल'],
        spotPriceBenchmark: 5920,
        isDefault: true,
      },
      {
        id: 'kabuli_chana',
        name: 'Dollar / Kabuli Chana',
        names: { en: 'Kabuli / Dollar Chana', hi: 'काबुली / डॉलर चना', mr: 'काबुली / डॉलर हरभरा' },
        keywords: ['kabuli', 'dollar chana', 'dollar', 'काबुली', 'डॉलर चना', 'काबुली हरभरा'],
        spotPriceBenchmark: 9400,
      },
    ],
    keywords: [
      'chana', 'gram', 'chickpea', 'harbhara', 'bengal gram', 'channa', 'desi chana',
      'चना', 'चणा', 'हरभरा', 'छोला', 'काबुली चना', 'हरभऱ्याचे', 'चना भाव',
    ],
    defaultMandi: { name: 'Latur APMC', district: 'Latur', state: 'Maharashtra' },
    spotPriceBenchmark: 5920,
    expectedPriceBenchmark: 6040,
    defaultAction: 'HOLD',
    daysToWait: 3,
    gainPerQtl: 120,
    reasons: {
      en: [
        'Pulse dal mills in Latur and Akola are experiencing low depot inventory.',
        'Govt procurement floor price provides solid downside protection.',
        'Projected improvement of +₹120/quintal over the 3-day holding window.',
      ],
      hi: [
        'लातूर और अकोला की दाल मिलों में चने का स्टॉक कम होने से मांग तेज है।',
        'सरकारी समर्थन मूल्य के कारण बाजार में गिरावट का जोखिम नगण्य है।',
        '3 दिन रुकने पर प्रति क्विंटल ₹120 का फायदा होने की उम्मीद है।',
      ],
      mr: [
        'लातूर व अकोला डाळ मिलमध्ये हरभऱ्याचा साठा कमी असल्याने मागणी टिकून आहे.',
        'हमीभावाचे भक्कम संरक्षण असल्याने दरात घट होण्याची शक्यता नाही.',
        '३ दिवस थांबल्यास प्रति क्विंटल ₹१२० चा फायदा होऊ शकतो.',
      ],
    },
  },
  {
    id: 'red_chili',
    canonicalName: 'Red Chili',
    names: { en: 'Red Chili', hi: 'लाल मिर्च', mr: 'लाल मिरची' },
    category: 'Cash Crops',
    defaultVariety: 'Teja S17 / G-4',
    varieties: [
      {
        id: 'teja',
        name: 'Teja S17 Premium',
        names: { en: 'Teja S17', hi: 'तेजा S17', mr: 'तेजा एस१७' },
        keywords: ['teja', 'teja s17', 's17', 'तेजा', 'तेजा एस१७'],
        spotPriceBenchmark: 18650,
        isDefault: true,
      },
      {
        id: 'g4',
        name: 'Dry G-4 / Byadagi',
        names: { en: 'G-4 / Byadgi', hi: 'G-4 / ब्याडगी', mr: 'जी-४ / ब्याडगी' },
        keywords: ['g-4', 'g4', 'byadgi', 'byadagi', 'ब्याडगी', 'जी-४', 'जी 4'],
        spotPriceBenchmark: 16800,
      },
    ],
    keywords: [
      'red chili', 'chili', 'chilli', 'mirch', 'mirchi', 'lal mirch', 'dry chili', 'guntur chili',
      'लाल मिर्च', 'मिर्च', 'लाल मिरची', 'मिरची', 'गुंटूर मिर्च', 'मिरचीचे',
    ],
    defaultMandi: { name: 'Guntur Spices Yard', district: 'Guntur', state: 'Andhra Pradesh' },
    spotPriceBenchmark: 18650,
    expectedPriceBenchmark: 19200,
    defaultAction: 'HOLD',
    daysToWait: 4,
    gainPerQtl: 550,
    reasons: {
      en: [
        'Spice extraction exporters and oleoresin units in Guntur are procuring heavily.',
        'Pungency index tests show export-grade quality across current arrivals.',
        'Expected price gain of +₹550/quintal over the next 4 days.',
      ],
      hi: [
        'गुंटूर मसाला मंडी में मसाला निर्यातकों और तेल निष्कर्षण कंपनियों की भारी मांग है।',
        'तीखापन और लाल रंग की गुणवत्ता उत्कृष्ट होने से निर्यातकों की ऊंची बोली लग रही है।',
        'अगले 4 दिनों में ₹550 प्रति क्विंटल तक भाव बढ़ने की उम्मीद है।',
      ],
      mr: [
        'गुंतूर मार्केटमध्ये मसाला निर्यातदार व कंपन्यांकडून लाल मिरचीला प्रचंड मागणी आहे.',
        'मिरचीचा तिखटपणा आणि रंग चांगला असल्याने अधिक दर मिळत आहे.',
        'येत्या ४ दिवसांत प्रति क्विंटल ₹५५० पर्यंत भाव वाढू शकतात.',
      ],
    },
  },
  {
    id: 'tomato',
    canonicalName: 'Tomato',
    names: { en: 'Tomato', hi: 'टमाटर', mr: 'टोमॅटो' },
    category: 'Vegetables',
    defaultVariety: 'Abhinav Hybrid F1',
    varieties: [
      {
        id: 'abhinav',
        name: 'Abhinav Hybrid F1',
        names: { en: 'Abhinav Hybrid F1', hi: 'अभिनव हाइब्रिड', mr: 'अभिनव हायब्रिड' },
        keywords: ['abhinav', 'hybrid', 'अभिनव', 'हायब्रिड', 'हाइब्रिड'],
        spotPriceBenchmark: 1680,
        isDefault: true,
      },
    ],
    keywords: [
      'tomato', 'tamatar', 'tomato crate', 'red tomato',
      'टमाटर', 'टोमॅटो', 'लाल टमाटर', 'टोमॅटोचे',
    ],
    defaultMandi: { name: 'Kolar Mandi', district: 'Kolar', state: 'Karnataka' },
    spotPriceBenchmark: 1680,
    expectedPriceBenchmark: 1680,
    defaultAction: 'SELL',
    daysToWait: 0,
    gainPerQtl: 0,
    reasons: {
      en: [
        'Perishable vegetable dynamic: Current spot price in Kolar is at an attractive weekly high.',
        'Daily crate arrivals from southern belts are expected to surge tomorrow.',
        'Sell immediately today to prevent field transit spoilage and capture peak rates.',
      ],
      hi: [
        'टमाटर एक शीघ्र खराब होने वाली फसल है और वर्तमान कोलार भाव अच्छे स्तर पर है।',
        'कल मंडियों में अन्य क्षेत्रों से भारी आवक होने का अनुमान है।',
        'खराब होने के नुकसान से बचने के लिए आज ही प्रमाणित मंडी में बेचना सर्वोत्तम है।',
      ],
      mr: [
        'टोमॅटो हे नाशवंत पीक असून सध्या कोलार बाजारातील दर चांगल्या पातळीवर आहेत.',
        'उद्या इतर भागातून आवक वाढण्याची शक्यता आहे.',
        'नुकसान टाळण्यासाठी आजच विक्री करणे सर्वात योग्य राहील.',
      ],
    },
  },
  {
    id: 'onion',
    canonicalName: 'Onion',
    names: { en: 'Onion', hi: 'प्याज', mr: 'कांदा' },
    category: 'Vegetables',
    defaultVariety: 'Nashik Red / Garwa',
    varieties: [
      {
        id: 'garwa',
        name: 'Nashik Red / Garwa',
        names: { en: 'Nashik Red (Garwa)', hi: 'नासिक लाल (गरवा)', mr: 'नाशिक लाल (गरवा)' },
        keywords: ['garwa', 'nashik red', 'summer onion', 'गरवा', 'नाशिक लाल', 'उन्हाळी कांदा'],
        spotPriceBenchmark: 2180,
        isDefault: true,
      },
      {
        id: 'pol',
        name: 'Pol / Kharif Onion',
        names: { en: 'Pol / Kharif Red', hi: 'पोल / खरीफ प्याज', mr: 'पोळ / खरीप कांदा' },
        keywords: ['pol', 'kharif onion', 'पोळ', 'खरीफ प्याज'],
        spotPriceBenchmark: 1940,
      },
    ],
    keywords: [
      'onion', 'pyaz', 'kanda', 'nashik onion', 'lasalgaon onion',
      'प्याज', 'कांदा', 'कांदे', 'नाशिक कांदा', 'लासलगाव कांदा', 'कांद्याचे',
    ],
    defaultMandi: { name: 'Lasalgaon Mandi', district: 'Nashik', state: 'Maharashtra' },
    spotPriceBenchmark: 2180,
    expectedPriceBenchmark: 2180,
    defaultAction: 'SELL',
    daysToWait: 0,
    gainPerQtl: 0,
    reasons: {
      en: [
        'Lasalgaon & Pimpalgaon arrivals are high and steady.',
        'Retail interstate dispatchers are buying spot lots actively today.',
        'Selling today avoids storage dehydration loss and locks in solid realization.',
      ],
      hi: [
        'लासलगांव और पिंपलगांव मंडियों में आवक पर्याप्त और स्थिर है।',
        'थोक व्यापारी और अंतरराज्यीय ट्रांसपोर्टर आज सक्रिय रूप से खरीद कर रहे हैं।',
        'आज ही बिक्री करने से भंडारण में वजन घटने का जोखिम समाप्त हो जाएगा।',
      ],
      mr: [
        'लासलगाव व पिंपळगाव बाजारपेठेत कांद्याची आवक सुरळीत सुरू आहे.',
        'परराज्यातील व्यापारी आज सक्रियपणे खरेदी करत आहेत.',
        'आजच विक्री केल्याने कांदा वजनात घट न होता चांगला नफा हातात येतो.',
      ],
    },
  },
  {
    id: 'maize',
    canonicalName: 'Maize (Yellow Corn)',
    names: { en: 'Maize', hi: 'मक्का', mr: 'मका' },
    category: 'Grains',
    defaultVariety: 'Pioneer 30R77 Feed Grade',
    varieties: [
      {
        id: 'feed_grade',
        name: 'Pioneer 30R77 Feed Grade',
        names: { en: 'Pioneer 30R77', hi: 'पायनियर 30R77', mr: 'पायनियर ३०R७७' },
        keywords: ['pioneer', '30r77', 'feed grade', 'पायनियर'],
        spotPriceBenchmark: 2190,
        isDefault: true,
      },
    ],
    keywords: [
      'maize', 'corn', 'makka', 'maka', 'bhutta', 'yellow corn', 'poultry corn',
      'मक्का', 'मका', 'भुट्टा', 'पॉपकॉर्न', 'मक्याचे',
    ],
    defaultMandi: { name: 'Gulabbagh Mandi', district: 'Purnia', state: 'Bihar' },
    spotPriceBenchmark: 2190,
    expectedPriceBenchmark: 2260,
    defaultAction: 'HOLD',
    daysToWait: 3,
    gainPerQtl: 70,
    reasons: {
      en: [
        'Poultry feed and starch processing plants are placing bulk forward purchase orders.',
        'Low aflatoxin grain lots are getting quick trade clearances at Gulabbagh and Davangere.',
        'Projected improvement of +₹70/quintal in 3 days.',
      ],
      hi: [
        'पोल्ट्री फीड और स्टार्च उद्योगों से मक्के की मजबूत मांग आ रही है।',
        'गुलाबबाग और दावणगेरे में सूखे और साफ मक्के की तेज खरीद हो रही है।',
        '3 दिन रुकने पर प्रति क्विंटल ₹70 तक का अतिरिक्त लाभ संभव है।',
      ],
      mr: [
        'कुक्कुटपालन खाद्य व स्टार्च कारखान्यांकडून मक्याला चांगली मागणी आहे.',
        'चांगल्या प्रतीच्या वाळलेल्या मक्याला चांगला भाव मिळत आहे.',
        '३ दिवसांत प्रति क्विंटल ₹७० पर्यंत वाढ संभवते.',
      ],
    },
  },
  {
    id: 'turmeric',
    canonicalName: 'Turmeric',
    names: { en: 'Turmeric', hi: 'हल्दी', mr: 'हळद' },
    category: 'Cash Crops',
    defaultVariety: 'Salem High Curcumin (4.5%)',
    varieties: [
      {
        id: 'salem',
        name: 'Salem High Curcumin (4.5%)',
        names: { en: 'Salem Curcumin', hi: 'सेलम उच्च करक्यूमिन', mr: 'सेलम उच्च करक्युमिन' },
        keywords: ['salem', 'curcumin', 'finger', 'सेलम', 'करक्यूमिन', 'करक्युमिन'],
        spotPriceBenchmark: 14450,
        isDefault: true,
      },
      {
        id: 'rajapore',
        name: 'Rajapore / Sangli Finger',
        names: { en: 'Rajapore / Sangli', hi: 'राजापुर / सांगली फिंगर', mr: 'राजापूर / सांगली हळद' },
        keywords: ['rajapore', 'sangli', 'nizamabad', 'राजापुर', 'सांगली', 'राजापूर'],
        spotPriceBenchmark: 13800,
      },
    ],
    keywords: [
      'turmeric', 'haldi', 'halad', 'pasupu', 'salem turmeric', 'finger turmeric',
      'हल्दी', 'हळद', 'पसुपु', 'हळदीचे', 'हल्दी भाव',
    ],
    defaultMandi: { name: 'Erode Spices Market', district: 'Erode', state: 'Tamil Nadu' },
    spotPriceBenchmark: 14450,
    expectedPriceBenchmark: 15100,
    defaultAction: 'HOLD',
    daysToWait: 5,
    gainPerQtl: 650,
    reasons: {
      en: [
        'Pharma and functional food manufacturers are competing for high curcumin Salem lots.',
        'Global export supply constraints are keeping spot terminals tight.',
        'Projected 5-day holding gain of +₹650/quintal.',
      ],
      hi: [
        'दवा और खाद्य कंपनियों द्वारा उच्च करक्यूमिन वाली सेलम हल्दी की भारी खरीदारी हो रही है।',
        'ईरोड और निजामाबाद मंडियों में आवक कम होने से दाम बढ़ रहे हैं।',
        '5 दिन रुकने पर प्रति क्विंटल ₹650 तक का शानदार मुनाफा मिलने की संभावना है।',
      ],
      mr: [
        'औषध निर्माण व खाद्य कंपन्यांकडून उच्च करक्युमिन हळदीला मोठी पसंती आहे.',
        'ईरोड व सांगली बाजारपेठेत आवक मर्यादित असल्याने भाव वाढत आहेत.',
        '५ दिवस थांबल्यास प्रति क्विंटल ₹६५० पर्यंत मोठा नफा अपेक्षित आहे.',
      ],
    },
  },
  {
    id: 'potato',
    canonicalName: 'Potato',
    names: { en: 'Potato', hi: 'आलू', mr: 'बटाटा' },
    category: 'Vegetables',
    defaultVariety: 'Kufri Pukhraj',
    varieties: [
      {
        id: 'pukhraj',
        name: 'Kufri Pukhraj',
        names: { en: 'Kufri Pukhraj', hi: 'कुफरी पुखराज', mr: 'कुफरी पुखराज' },
        keywords: ['pukhraj', 'kufri pukhraj', 'पुखराज', 'कुफरी पुखराज'],
        spotPriceBenchmark: 1420,
        isDefault: true,
      },
      {
        id: 'jyoti',
        name: 'Kufri Jyoti / Chipsona',
        names: { en: 'Kufri Jyoti / Chipsona', hi: 'चिपसोना / ज्योति', mr: 'चिपसोना / ज्योती' },
        keywords: ['chipsona', 'jyoti', 'चिपसोना', 'ज्योति', 'ज्योती'],
        spotPriceBenchmark: 1560,
      },
    ],
    keywords: [
      'potato', 'aloo', 'batata', 'alu', 'agra potato',
      'आलू', 'बटाटा', 'आलू भाव', 'बटाट्याचे', 'आलू की फसल',
    ],
    defaultMandi: { name: 'Agra Potato Yard', district: 'Agra', state: 'Uttar Pradesh' },
    spotPriceBenchmark: 1420,
    expectedPriceBenchmark: 1420,
    defaultAction: 'SELL',
    daysToWait: 0,
    gainPerQtl: 0,
    reasons: {
      en: [
        'Agra & Farrukhabad cold store arrivals are smooth and fully matching daily demand.',
        'Institutional wafer chip processors are buying today with on-the-spot quality inspection.',
        'Immediate sale today locks in full harvest realization without cold store rent overhead.',
      ],
      hi: [
        'आगरा मंडी में आलू की दैनिक मांग और आपूर्ति का संतुलन बहुत अच्छा है।',
        'चिप्स और नमकीन निर्माता आज मौके पर ही जांच करके पूरा माल खरीद रहे हैं।',
        'आज ही बेचने से कोल्ड स्टोरेज के अतिरिक्त किराए और वजन में कमी से बचा जा सकता है।',
      ],
      mr: [
        'आग्रा बाजारात बटाट्याची मागणी व आवक योग्य प्रमाणात सुरू आहे.',
        'चिप्स बनवणाऱ्या कंपन्या आज थेट जागेवर चांगला दर देत आहेत.',
        'आजच विक्री केल्यास कोल्ड स्टोरेजचे भाडे वाचून चांगला नफा मिळतो.',
      ],
    },
  },
  {
    id: 'apple',
    canonicalName: 'Apple',
    names: { en: 'Apple', hi: 'सेब', mr: 'सफरचंद' },
    category: 'Fruits',
    defaultVariety: 'Royal Delicious Extra Fancy',
    varieties: [
      {
        id: 'royal_delicious',
        name: 'Royal Delicious Extra Fancy',
        names: { en: 'Royal Delicious', hi: 'रॉयल डिलीशियस', mr: 'रॉयल डिलिशिअस' },
        keywords: ['royal', 'royal delicious', 'shimla apple', 'रॉयल', 'रॉयल डिलीशियस'],
        spotPriceBenchmark: 11200,
        isDefault: true,
      },
    ],
    keywords: [
      'apple', 'seb', 'safarchand', 'shimla apple', 'kashmir apple',
      'सेब', 'सफरचंद', 'सफरचंदाचे', 'सेब का भाव',
    ],
    defaultMandi: { name: 'Azadpur Fruit Mandi', district: 'North Delhi', state: 'Delhi (NCR)' },
    spotPriceBenchmark: 11200,
    expectedPriceBenchmark: 11600,
    defaultAction: 'HOLD',
    daysToWait: 3,
    gainPerQtl: 400,
    reasons: {
      en: [
        'High consumer demand in metro markets for premium color grade Royal Delicious.',
        'Azadpur fruit terminal inventory is clearing rapidly.',
        'Expected gain of +₹400/quintal over the 3-day holding window.',
      ],
      hi: [
        'मेट्रो शहरों में प्रीमियम लाल रंग वाले सेब की जबर्दस्त मांग है।',
        'आजादपुर फल मंडी में अच्छी गुणवत्ता वाली पेटियों की तुरंत बिक्री हो रही है।',
        '3 दिन रुकने पर प्रति क्विंटल ₹400 तक अधिक दर मिल सकता है।',
      ],
      mr: [
        'मोठ्या शहरांमध्ये दर्जेदार सफरचंदाला मोठी मागणी आहे.',
        'आझादपूर फळ बाजारात चांगल्या मालाचा उठाव वेगाने होत आहे.',
        '३ दिवस थांबल्यास प्रति क्विंटल ₹४०० जास्त दर मिळण्याची शक्यता आहे.',
      ],
    },
  },
];

// Map Devanagari numerals to Arabic digits
const DEVANAGARI_DIGITS_MAP: Record<string, string> = {
  '०': '0',
  '१': '1',
  '२': '2',
  '३': '3',
  '४': '4',
  '५': '5',
  '६': '6',
  '७': '7',
  '८': '8',
  '९': '9',
};

// Word numbers in Hindi, Marathi, and English
const NUMBER_WORDS_MAP: Record<string, number> = {
  'दस': 10,
  'दहा': 10,
  'पंद्रह': 15,
  'पंधरा': 15,
  'बीस': 20,
  'वीस': 20,
  'पच्चीस': 25,
  'पंचवीस': 25,
  'तीस': 30,
  'पैंतीस': 35,
  'पस्तीस': 35,
  'चालीस': 40,
  'चाळीस': 40,
  'पचास': 50,
  'पन्नास': 50,
  'साठ': 60,
  'सत्तर': 70,
  'अस्सी': 80,
  'ऐंशी': 80,
  'नब्बे': 90,
  'नव्वद': 90,
  'सौ': 100,
  'शंभर': 100,
  'एक': 1,
  'दो': 2,
  'दोन': 2,
  'तीन': 3,
  'चार': 4,
  'पांच': 5,
  'पाच': 5,
  'छह': 6,
  'सहा': 6,
  'सात': 7,
  'आठ': 8,
  'नौ': 9,
  'ten': 10,
  'fifteen': 15,
  'twenty': 20,
  'twenty-five': 25,
  'thirty': 30,
  'thirty-five': 35,
  'forty': 40,
  'fifty': 50,
  'sixty': 60,
  'seventy': 70,
  'eighty': 80,
  'ninety': 90,
  'hundred': 100,
};

/**
 * Normalizes Devanagari numerals to standard digits
 */
export function normalizeNumerals(text: string): string {
  let normalized = text;
  for (const [devanagari, arabic] of Object.entries(DEVANAGARI_DIGITS_MAP)) {
    normalized = normalized.replaceAll(devanagari, arabic);
  }
  return normalized;
}

/**
 * Detect language of the query based on script and vocabulary
 */
export function detectQueryLanguage(text: string, defaultLang: Language = 'en'): Language {
  const marathiMarkers = [
    'आहे', 'नाही', 'सांगा', 'दाखवा', 'विका', 'विकू', 'कधी', 'कुठे', 'काय', 'दर', 'भाव', 'बाजारपेठ',
    'गहू', 'कापूस', 'तांदूळ', 'भात', 'हरभरा', 'कांदा', 'बटाटा', 'मोहरी', 'मका', 'हळद',
    'क्विंटलसाठी', 'पिकासाठी', 'च्या', 'चा', 'चे', 'ची', 'ला', 'मध्ये', 'थेट', 'खरेदीदार', 'सल्ला', 'ऐका', 'करा'
  ];
  const hindiMarkers = [
    'है', 'नहीं', 'बताओ', 'दिखाओ', 'बेचें', 'बेचना', 'कब', 'कहाँ', 'कहा', 'क्या', 'रेट',
    'गेहूं', 'कपास', 'चावल', 'चना', 'प्याज', 'आलू', 'सरसों', 'मक्का', 'हल्दी', 'फसल',
    'के', 'का', 'की', 'को', 'में', 'सलाह', 'सुनो', 'खरीदार', 'चाहिए'
  ];

  const lower = text.toLowerCase();
  const hasDevanagari = /[\u0900-\u097F]/.test(text);

  if (hasDevanagari) {
    const mrScore = marathiMarkers.reduce((acc, m) => acc + (lower.includes(m) ? 1 : 0), 0);
    const hiScore = hindiMarkers.reduce((acc, h) => acc + (lower.includes(h) ? 1 : 0), 0);

    if (mrScore > hiScore) return 'mr';
    if (hiScore > 0) return 'hi';
    // If Devanagari but ambiguous, use default if it's hi or mr, otherwise default to hi
    return defaultLang === 'mr' ? 'mr' : 'hi';
  }

  // Check English keywords or transliterations
  if (lower.includes('gahu') || lower.includes('kapus') || lower.includes('harbhara') || lower.includes('kanda') || lower.includes('sang')) {
    return 'mr';
  }
  if (lower.includes('gehun') || lower.includes('kapas') || lower.includes('chana') || lower.includes('batao') || lower.includes('kaha')) {
    return 'hi';
  }

  return defaultLang || 'en';
}

/**
 * Finds crop and specific variety from transcript using Master Crop Registry
 */
export function findCropAndVarietyInTranscript(transcript: string): {
  cropEntry?: MasterCropEntry;
  varietyEntry?: VarietyEntry;
} {
  const normalized = normalizeNumerals(transcript.trim().toLowerCase());

  // 1. Search for specific varieties first across all crops
  for (const crop of MASTER_CROP_REGISTRY) {
    for (const variety of crop.varieties) {
      for (const kw of variety.keywords) {
        if (normalized.includes(kw.toLowerCase())) {
          return {
            cropEntry: crop,
            varietyEntry: variety,
          };
        }
      }
    }
  }

  // 2. Search for general crops if no variety matched
  for (const crop of MASTER_CROP_REGISTRY) {
    for (const kw of crop.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        // Fallback to default variety for this crop
        const defaultVar = crop.varieties.find((v) => v.isDefault) || crop.varieties[0];
        return {
          cropEntry: crop,
          varietyEntry: defaultVar,
        };
      }
    }
  }

  return {};
}

/**
 * Helper to get Crop Profile from Canonical Name or ID
 */
export function getCropRegistryEntry(cropNameOrId: string): MasterCropEntry | undefined {
  const lower = cropNameOrId.toLowerCase().trim();
  return MASTER_CROP_REGISTRY.find(
    (c) =>
      c.id.toLowerCase() === lower ||
      c.canonicalName.toLowerCase() === lower ||
      c.names.en.toLowerCase() === lower ||
      c.names.hi.toLowerCase() === lower ||
      c.names.mr.toLowerCase() === lower ||
      c.keywords.some((k) => lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower))
  );
}

/**
 * Universal Multilingual Voice Query Parser
 * Extracts crop, variety, quantity, geography, intent, and language
 */
export function parseFarmerVoiceQuery(
  transcript: string,
  currentLang: Language = 'en'
): ParsedVoiceQuery {
  const normalizedText = normalizeNumerals(transcript.trim());
  const lower = normalizedText.toLowerCase();
  const detectedLanguage = detectQueryLanguage(normalizedText, currentLang);

  let detectedCrop: string | undefined;
  let detectedCropId: string | undefined;
  let detectedVariety: string | undefined;
  let detectedVarietyId: string | undefined;
  let cropDisplayName: { en: string; hi: string; mr: string } | undefined;
  let varietyDisplayName: { en: string; hi: string; mr: string } | undefined;
  let detectedQuantity: number | undefined;
  let detectedState: string | undefined;
  let detectedDistrict: string | undefined;
  let intent: 'advice' | 'markets' | 'buyers' | 'my-crops' | 'general' = 'general';
  let confidence = 0.5;
  let isAmbiguous = false;
  let marketBenchmark: ParsedVoiceQuery['marketBenchmark'];

  // 1. Detect Crop & Variety
  const { cropEntry, varietyEntry } = findCropAndVarietyInTranscript(normalizedText);

  if (cropEntry) {
    detectedCrop = cropEntry.canonicalName;
    detectedCropId = cropEntry.id;
    cropDisplayName = cropEntry.names;
    confidence += 0.3;

    if (varietyEntry) {
      detectedVariety = varietyEntry.name;
      detectedVarietyId = varietyEntry.id;
      varietyDisplayName = varietyEntry.names;
      confidence += 0.1;
    }

    marketBenchmark = {
      spotPrice: varietyEntry?.spotPriceBenchmark || cropEntry.spotPriceBenchmark,
      expectedPrice: cropEntry.expectedPriceBenchmark,
      action: cropEntry.defaultAction,
      daysToWait: cropEntry.daysToWait,
      mandi: cropEntry.defaultMandi.name,
      district: cropEntry.defaultMandi.district,
      state: cropEntry.defaultMandi.state,
    };
  }

  // 2. Detect Quantity (digits or written word numbers)
  const digitsMatch = normalizedText.match(
    /(\d+(\.\d+)?)\s*(क्विंटल|quintal|quintals|qtl|qtls|ton|tonne|tonnes|टन|पोते|बोरी|बोरिया|पोती|बॅग)?/i
  );
  if (digitsMatch && digitsMatch[1]) {
    const val = parseFloat(digitsMatch[1]);
    if (!isNaN(val) && val > 0) {
      detectedQuantity = val;
      confidence += 0.2;
    }
  }

  if (!detectedQuantity) {
    const words = lower.split(/[\s,]+/);
    for (const word of words) {
      if (NUMBER_WORDS_MAP[word]) {
        detectedQuantity = NUMBER_WORDS_MAP[word];
        confidence += 0.2;
        break;
      }
    }
  }

  // 3. Detect District & State from Indian Geography Dataset
  for (const stateObj of INDIAN_STATES_DATA) {
    const stateNameLower = stateObj.state.toLowerCase();
    if (lower.includes(stateNameLower)) {
      detectedState = stateObj.state;
      confidence += 0.1;
    }

    for (const dist of stateObj.districts) {
      const distLower = dist.toLowerCase();
      if (lower.includes(distLower)) {
        detectedState = stateObj.state;
        detectedDistrict = dist;
        confidence += 0.2;
        break;
      }
    }
    if (detectedDistrict) break;
  }

  // 4. Intent Classification
  const adviceKeywords = [
    'कहाँ बेचना', 'कहा बेचना', 'कब बेचना', 'बेचना चाहिए', 'सलाह', 'सलाह बताओ', 'सलाह पढ़ो', 'सलाह सुनो', 'बेचूँ', 'बेचूं', 'रुकूं',
    'कुठे विकावा', 'कुठे विकू', 'कधी विकावा', 'कधी विकू', 'सल्ला', 'सल्ला सांगा', 'सल्ला ऐका', 'थांबू', 'विकायचं',
    'where should i sell', 'when should i sell', 'should i sell', 'hold or sell', 'read advice', 'selling advice', 'recommendation', 'advice', 'tell me about',
  ];

  const marketKeywords = [
    'मंडी भाव', 'बाजार भाव', 'मंडी रेट', 'मंडी', 'भाव क्या है', 'आज का भाव', 'रेट बताओ', 'भाव बताओ',
    'मंडीचे दर', 'बाजारपेठ', 'दर काय आहे', 'आजचा दर', 'भाव काय आहे', 'दर सांगा',
    'market price', 'mandi rate', 'market intelligence', 'compare mandis', 'mandi prices', 'price of', 'rate of', 'market rates',
  ];

  const buyerKeywords = [
    'खरीदार', 'व्यापारी', 'मिलर', 'क्रेता', 'खरीदार दिखाओ', 'व्यापारी से संपर्क', 'थोक खरीदार',
    'खरेदीदार', 'व्यापारी', 'मिलर्स', 'खरेदीदार दाखवा', 'थेट खरेदीदार',
    'buyer', 'buyers', 'verified buyer', 'procurement', 'miller', 'tenders', 'find buyers', 'show buyers',
  ];

  const cropKeywords = [
    'मेरी फसल', 'फसल जोड़ें', 'फसल बदलो', 'मेरी फसल गेहूं', 'फसल चुनो',
    'माझे पीक', 'पीक जोडा', 'पीक बदला', 'माझे पीक गहू', 'पीक निवडा',
    'my crop', 'add crop', 'change crop', 'crop portfolio', 'set crop',
  ];

  if (adviceKeywords.some((k) => lower.includes(k))) {
    intent = 'advice';
  } else if (marketKeywords.some((k) => lower.includes(k))) {
    intent = 'markets';
  } else if (buyerKeywords.some((k) => lower.includes(k))) {
    intent = 'buyers';
  } else if (cropKeywords.some((k) => lower.includes(k))) {
    intent = 'my-crops';
  } else if (detectedCrop) {
    intent = 'advice';
  }

  // 5. Ambiguity Check: If user asks for price or advice with no crop detected
  if (!detectedCrop && (intent === 'markets' || intent === 'advice')) {
    isAmbiguous = true;
  }

  const clarificationPrompt = {
    en: 'Which crop and variety would you like advice or prices for?',
    hi: 'आप किस फसल और किस्म (जैसे शरबती गेहूं या कपास) के बारे में जानना चाहते हैं?',
    mr: 'तुम्हाला कोणत्या पिकाचा आणि वाणाचा (उदा. शरबती गहू किंवा कापूस) सल्ला हवा आहे?',
  };

  return {
    rawTranscript: transcript,
    detectedLanguage,
    crop: detectedCrop,
    cropId: detectedCropId,
    variety: detectedVariety,
    varietyId: detectedVarietyId,
    cropDisplayName,
    varietyDisplayName,
    quantity: detectedQuantity,
    state: detectedState,
    district: detectedDistrict,
    intent,
    confidence: Math.min(1.0, confidence),
    isAmbiguous,
    clarificationPrompt,
    marketBenchmark,
  };
}

/**
 * Generates natural audio response spoken back to farmer in the target/detected language
 */
export function generateVoiceFeedbackResponse(
  parsed: ParsedVoiceQuery,
  lang: Language = 'en',
  customSpotPrice?: number,
  customAction?: 'HOLD' | 'SELL'
): string {
  // Respect query language unless specified
  const targetLang = lang;

  if (parsed.isAmbiguous) {
    return (
      parsed.clarificationPrompt?.[targetLang] ||
      (targetLang === 'hi'
        ? 'कृपया अपनी फसल का नाम बताएं (जैसे गेहूं, सोयाबीन, कपास या बासमती)।'
        : targetLang === 'mr'
        ? 'कृपया तुमच्या पिकाचे नाव सांगा (उदा. गहू, सोयाबीन, कापूस किंवा बासमती).'
        : 'Please specify your crop (such as Wheat, Soybean, Cotton, or Basmati Rice).')
    );
  }

  const cropName = parsed.cropDisplayName
    ? parsed.cropDisplayName[targetLang]
    : parsed.crop || (targetLang === 'hi' ? 'आपकी फसल' : targetLang === 'mr' ? 'तुमचे पीक' : 'Your crop');

  const varietyName = parsed.varietyDisplayName ? parsed.varietyDisplayName[targetLang] : parsed.variety || '';
  const fullCropTitle = varietyName ? `${cropName} (${varietyName})` : cropName;
  const qty = parsed.quantity || 25;
  const location = parsed.district ? parsed.district : '';

  const spot = customSpotPrice || parsed.marketBenchmark?.spotPrice || 2860;
  const action = customAction || parsed.marketBenchmark?.action || 'HOLD';
  const expectedPrice = parsed.marketBenchmark?.expectedPrice || spot + 90;
  const daysToWait = parsed.marketBenchmark?.daysToWait || 3;
  const defaultMandi = parsed.marketBenchmark?.mandi || `${location || 'नजदीकी'} मंडी`;

  // 1. Hindi Spoken Response
  if (targetLang === 'hi') {
    if (parsed.intent === 'advice' || (parsed.crop && parsed.quantity)) {
      if (action === 'HOLD') {
        return `${fullCropTitle} के ${qty} क्विंटल के लिए AI सलाह है कि ${daysToWait} दिन रुकें। ${defaultMandi} में ₹${expectedPrice} प्रति क्विंटल तक भाव बढ़ने का अनुमान है।`;
      }
      return `${fullCropTitle} के ${qty} क्विंटल के लिए: वर्तमान भाव ₹${spot} प्रति क्विंटल उच्चतम स्तर पर है। आज ही नजदीकी प्रमाणित मंडी या खरीदार को बेचें।`;
    }
    if (parsed.intent === 'markets') {
      return `${location ? location + ' क्षेत्र में ' : ''}${fullCropTitle} का वर्तमान मंडी भाव ₹${spot} प्रति क्विंटल है।`;
    }
    if (parsed.intent === 'buyers') {
      return `${fullCropTitle} के लिए प्रमाणित मिलर्स और खरीदार ₹${spot + 40} प्रति क्विंटल पर सीधे खरीद कर रहे हैं।`;
    }
    return `आपकी फसल ${fullCropTitle} ${qty} क्विंटल दर्ज कर ली गई है। सबसे अच्छा बिक्री विकल्प तैयार किया जा रहा है।`;
  }

  // 2. Marathi Spoken Response
  if (targetLang === 'mr') {
    if (parsed.intent === 'advice' || (parsed.crop && parsed.quantity)) {
      if (action === 'HOLD') {
        return `${fullCropTitle} च्या ${qty} क्विंटलसाठी AI सल्ला आहे की ${daysToWait} दिवस थांबा. ${defaultMandi} मध्ये भाव ₹${expectedPrice} प्रति क्विंटलपर्यंत वाढण्याचा अंदाज आहे.`;
      }
      return `${fullCropTitle} च्या ${qty} क्विंटलसाठी: सध्याचा भाव ₹${spot} प्रति क्विंटल चांगल्या पातळीवर आहे. आजच नजीकच्या प्रमाणित बाजारात किंवा खरेदीदाराला विक्री करा.`;
    }
    if (parsed.intent === 'markets') {
      return `${location ? location + ' भागात ' : ''}${fullCropTitle} चा सध्याचा बाजार भाव ₹${spot} प्रति क्विंटल आहे.`;
    }
    if (parsed.intent === 'buyers') {
      return `${fullCropTitle} साठी प्रमाणित खरेदीदार थेट ₹${spot + 40} प्रति क्विंटलने खरेदी करत आहेत.`;
    }
    return `तुमचे पीक ${fullCropTitle} ${qty} क्विंटल नोंदवले गेले आहे. सर्वोत्तम विक्री पर्याय तयार करत आहोत.`;
  }

  // 3. English Spoken Response
  if (parsed.intent === 'advice' || (parsed.crop && parsed.quantity)) {
    if (action === 'HOLD') {
      return `For ${qty} quintals of ${fullCropTitle}: AI recommends holding for ${daysToWait} days. Expected price at ${defaultMandi} is ₹${expectedPrice} per quintal.`;
    }
    return `For ${qty} quintals of ${fullCropTitle}: Recommend selling today at ₹${spot} per quintal to capture peak market rates.`;
  }
  if (parsed.intent === 'markets') {
    return `Current market rate for ${fullCropTitle}${location ? ' in ' + location : ''} is ₹${spot} per quintal.`;
  }
  if (parsed.intent === 'buyers') {
    return `Verified buyers and millers are procuring ${fullCropTitle} directly at ₹${spot + 40} per quintal.`;
  }
  return `Understood: ${qty} quintals of ${fullCropTitle}. Analyzing optimal selling options for you.`;
}
