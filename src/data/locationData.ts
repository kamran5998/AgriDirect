export interface StateDistrictMap {
  state: string;
  districts: string[];
  primaryMandis: string[];
}

export const INDIAN_STATES_DATA: StateDistrictMap[] = [
  {
    state: 'Madhya Pradesh',
    districts: ['Sehore', 'Indore', 'Dewas', 'Bhopal', 'Ujjain', 'Hoshangabad', 'Vidisha', 'Gwalior'],
    primaryMandis: ['Sehore APMC Mandi', 'Indore Grain Market', 'Dewas Krishi Mandi', 'Ujjain Mandi', 'Hoshangabad Mandi'],
  },
  {
    state: 'Punjab',
    districts: ['Patiala', 'Ludhiana', 'Khanna', 'Amritsar', 'Bathinda', 'Jalandhar', 'Sangrur', 'Ferozepur'],
    primaryMandis: ['Khanna Grain Market (Asia’s Largest)', 'Patiala APMC Yard', 'Ludhiana Mandi', 'Bathinda Cotton Mandi'],
  },
  {
    state: 'Haryana',
    districts: ['Karnal', 'Kurukshetra', 'Ambala', 'Hisar', 'Sirsa', 'Rohtak', 'Panipat', 'Fatehabad'],
    primaryMandis: ['Karnal Basmati Exchange', 'Kurukshetra Grain Market', 'Sirsa Cotton Hub', 'Hisar APMC Mandi'],
  },
  {
    state: 'Gujarat',
    districts: ['Rajkot', 'Surat', 'Ahmedabad', 'Amreli', 'Junagadh', 'Mehsana', 'Bhavnagar', 'Vadodara'],
    primaryMandis: ['Rajkot APMC Market', 'Gondal Yard', 'Unjha Spices Mandi', 'Surat Agro Terminal', 'Amreli Yard'],
  },
  {
    state: 'Maharashtra',
    districts: ['Nashik', 'Latur', 'Akola', 'Pune', 'Nagpur', 'Solapur', 'Ahmednagar', 'Jalgaon'],
    primaryMandis: ['Lasalgaon Onion Mandi', 'Latur Pulse Exchange', 'Akola Cotton Yard', 'Pune APMC Market', 'Jalgaon Banana Hub'],
  },
  {
    state: 'Rajasthan',
    districts: ['Bharatpur', 'Alwar', 'Kota', 'Sri Ganganagar', 'Jaipur', 'Jodhpur', 'Bikaner', 'Baran'],
    primaryMandis: ['Bharatpur Mustard Market', 'Alwar Krishi Mandi', 'Kota Grain Yard', 'Sri Ganganagar Mandi'],
  },
  {
    state: 'Andhra Pradesh',
    districts: ['Guntur', 'Krishna', 'Kurnool', 'Prakasam', 'East Godavari', 'Anantapur', 'Chittoor'],
    primaryMandis: ['Guntur Spices Yard (Asia’s Largest Chili Hub)', 'Kurnool Cotton Market', 'Vijayawada APMC'],
  },
  {
    state: 'Karnataka',
    districts: ['Kolar', 'Davangere', 'Belagavi', 'Shivamogga', 'Tumakuru', 'Ballari', 'Mysuru', 'Hassan'],
    primaryMandis: ['Kolar Tomato Market', 'Davangere Maize Exchange', 'Belagavi Yard', 'Shivamogga Arecanut Hub'],
  },
  {
    state: 'Tamil Nadu',
    districts: ['Erode', 'Coimbatore', 'Salem', 'Madurai', 'Thanjavur', 'Dindigul', 'Tiruppur'],
    primaryMandis: ['Erode Turmeric Market', 'Coimbatore Vegetable Market', 'Salem Sago & Spices Yard'],
  },
  {
    state: 'Bihar',
    districts: ['Purnia', 'Katihar', 'Patna', 'Muzaffarpur', 'Bhagalpur', 'Begusarai', 'Samastipur'],
    primaryMandis: ['Gulabbagh Maize Market', 'Purnia Grain Hub', 'Muzaffarpur Litchi & Fruit Terminal'],
  },
  {
    state: 'Uttar Pradesh',
    districts: ['Meerut', 'Agra', 'Bareilly', 'Varanasi', 'Kanpur', 'Aligarh', 'Moradabad', 'Gorakhpur'],
    primaryMandis: ['Meerut Grain APMC', 'Agra Potato Yard', 'Kanpur Central Mandi', 'Aligarh Krishi Mandi'],
  },
];

export const AVAILABLE_CROPS_LIST = [
  { id: 'wheat', name: 'Wheat (Sharbati / Lokwan)', category: 'Grains', season: 'Rabi', icon: '🌾' },
  { id: 'basmati', name: 'Basmati Rice (Pusa 1121/1509)', category: 'Grains', season: 'Kharif', icon: '🍚' },
  { id: 'soybean', name: 'Soybean (Yellow Seed)', category: 'Oilseeds', season: 'Kharif', icon: '🌱' },
  { id: 'cotton', name: 'Cotton (Shankar-6 Staple)', category: 'Cash Crops', season: 'Kharif', icon: '☁️' },
  { id: 'mustard', name: 'Mustard Seed (Sarson)', category: 'Oilseeds', season: 'Rabi', icon: '🌻' },
  { id: 'chana', name: 'Chana (Desi Chickpea)', category: 'Pulses', season: 'Rabi', icon: '🍲' },
  { id: 'red_chili', name: 'Red Chili (G-4 / Teja)', category: 'Cash Crops', season: 'Annual', icon: '🌶️' },
  { id: 'tomato', name: 'Tomato (Hybrid Red)', category: 'Vegetables', season: 'Zaid / All-Year', icon: '🍅' },
  { id: 'onion', name: 'Onion (Nashik Red)', category: 'Vegetables', season: 'Rabi & Kharif', icon: '🧅' },
  { id: 'maize', name: 'Maize (Yellow Feed Corn)', category: 'Grains', season: 'Kharif & Rabi', icon: '🌽' },
  { id: 'turmeric', name: 'Turmeric (Salem Curcumin)', category: 'Cash Crops', season: 'Annual', icon: '🟡' },
  { id: 'potato', name: 'Potato (Kufri Pukhraj)', category: 'Vegetables', season: 'Rabi', icon: '🥔' },
];
