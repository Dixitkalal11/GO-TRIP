// Comprehensive Indian Train Data
// Total States: 28 | Total Union Territories: 8 | Approximate Total Districts: 800

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export const UNION_TERRITORIES = [
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman & Diu",
  "The NCT of Delhi", "Jammu & Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export const INDIAN_DISTRICTS = [
  // Andhra Pradesh (26 districts)
  "Alluri Sitharama Raju", "Anakapalli", "Ananthapuramu", "Annamayya", "Bapatla", 
  "Chittoor", "Dr. B.R. Ambedkar Konaseema", "East Godavari", "Eluru", "Guntur", 
  "Kakinada", "Krishna", "Kurnool", "Nandyal", "NTR", "Palnadu", 
  "Parvathipuram Manyam", "Prakasam", "Sri Sathya Sai", "Srikakulam", 
  "Sri Potti Sriramulu Nellore", "Tirupati", "Visakhapatnam", "Vizianagaram", 
  "West Godavari", "YSR Kadapa",

  // Arunachal Pradesh (27 districts)
  "Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Kamle", 
  "Kra Daadi", "Kurung Kumey", "Lepa Rada", "Lohit", "Longding", 
  "Lower Dibang Valley", "Lower Siang", "Lower Subansiri", "Namsai", 
  "Pakke Kessang", "Papum Pare", "Shi Yomi", "Siang", "Tawang", "Tirap", 
  "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang", 
  "Capital Complex Itanagar",

  // Assam (35 districts)
  "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", 
  "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", 
  "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", 
  "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", 
  "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", 
  "Sonitpur", "South Salamara-Mankachar", "Tinsukia", "Udalguri", 
  "West Karbi Anglong", "Bajali", "Tamulpur",

  // Bihar (38 districts)
  "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", 
  "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", 
  "Jamui", "Jehanabad", "Kaimur (Bhabua)", "Katihar", "Khagaria", 
  "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", 
  "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", 
  "Saharasa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", 
  "Siwan", "Supaul", "Vaishali", "West Champaran",

  // Chhattisgarh (33 districts)
  "Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", 
  "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", 
  "Gaurela-Pendra-Marwahi", "Janjgir-Champa", "Jashpur", "Kabirdham", 
  "Kanker", "Khairagarh-Chhuikhadan-Gandai", "Kondagaon", "Korba", "Koriya", 
  "Mahasamund", "Manendragarh-Chirmiri-Bharatpur", "Mohla-Manpur-Ambagarh Chowki", 
  "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", 
  "Sarangarh-Bilaigarh", "Shakti", "Sukma", "Surajpur", "Surguja",

  // Goa (2 districts)
  "North Goa", "South Goa",

  // Gujarat (33 districts)
  "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", 
  "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", 
  "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", 
  "Kutch", "Kheda", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", 
  "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", 
  "Surendranagar", "Tapi", "Vadodara", "Valsad",

  // Haryana (22 districts)
  "Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", 
  "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", 
  "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", 
  "Rohtak", "Sirsa", "Sonipat", "Yamunanagar",

  // Himachal Pradesh (12 districts)
  "Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", 
  "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una",

  // Jharkhand (24 districts)
  "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", 
  "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", 
  "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", 
  "Sahibganj", "Seraikela-Kharsawan", "Simdega", "West Singhbhum",

  // Karnataka (31 districts)
  "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", 
  "Bidar", "Chamarajanagar", "Chikkaballapura", "Chikkamagaluru", "Chitradurga", 
  "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Kalaburagi", "Hassan", 
  "Haveri", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", 
  "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", 
  "Vijayanagara", "Vijayapura", "Yadgir",

  // Kerala (14 districts)
  "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", 
  "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", 
  "Thiruvananthapuram", "Thrissur", "Wayanad",

  // Madhya Pradesh (55 districts)
  "Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", 
  "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwada", 
  "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", 
  "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", 
  "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", 
  "Niwari", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", 
  "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", 
  "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha",

  // Maharashtra (36 districts)
  "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", 
  "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", 
  "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", 
  "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", 
  "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", 
  "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal",

  // Manipur (16 districts)
  "Bishnupur", "Churachandpur", "Chandel", "Imphal East", "Imphal West", 
  "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", 
  "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul",

  // Meghalaya (12 districts)
  "East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", 
  "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", 
  "West Garo Hills", "West Jaintia Hills", "West Khasi Hills", "Eastern West Khasi Hills",

  // Mizoram (11 districts)
  "Aizawl", "Champhai", "Hnahthial", "Kolasib", "Lawngtlai", "Lunglei", 
  "Mamit", "Saitual", "Serchhip", "Siaha", "Khawzawl",

  // Nagaland (17 districts)
  "Chumoukedima", "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", 
  "Mon", "Niuland", "Noklak", "Peren", "Phek", "Shamator", "Tseminyu", 
  "Tuensang", "Wokha", "Zunheboto", "Meluri",

  // Odisha (30 districts)
  "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", 
  "Debagarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", 
  "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", 
  "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", 
  "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh",

  // Punjab (23 districts)
  "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", 
  "Firozpur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", 
  "Mansa", "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar", 
  "Sahibzada Ajit Singh Nagar", "Sangrur", "Shahid Bhagat Singh Nagar", 
  "Tarn Taran", "Malerkotla",

  // Rajasthan (50 districts)
  "Ajmer", "Alwar", "Anupgarh", "Balotra", "Banswara", "Baran", "Barmer", 
  "Beawar", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", 
  "Churu", "Dausa", "Dholpur", "Didwana Kuchaman", "Dudu", "Dungarpur", 
  "Ganganagar", "Gangapur City", "Hanumangarh", "Jaipur", "Jaipur Rural", 
  "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Jodhpur Rural", 
  "Karauli", "Kota", "Kotputli-Behror", "Khairthal-Tijara", "Nagaur", "Pali", 
  "Pratapgarh", "Rajsamand", "Salumbar", "Sanchore", "Sawai Madhopur", 
  "Shahpura", "Sikar", "Sirohi", "Tonk", "Udaipur",

  // Sikkim (6 districts)
  "Gangtok", "Gyalshing", "Mangan", "Namchi", "Pakyong", "Soreng",

  // Tamil Nadu (38 districts)
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", 
  "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", 
  "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", 
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", 
  "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", 
  "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", 
  "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", 
  "Viluppuram", "Virudhunagar",

  // Telangana (33 districts)
  "Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", 
  "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", 
  "Khammam", "Komaram Bheem", "Mahabubabad", "Mahabubnagar", "Mancherial", 
  "Medak", "Medchal–Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", 
  "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", 
  "Ranga Reddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", 
  "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri",

  // Tripura (8 districts)
  "Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", 
  "Unakoti", "West Tripura",

  // Uttar Pradesh (75 districts)
  "Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", 
  "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", 
  "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", 
  "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", 
  "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", 
  "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", 
  "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", 
  "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", 
  "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", 
  "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", 
  "Rae Bareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", 
  "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", 
  "Sonbhadra", "Sultanpur", "Unnao", "Varanasi",

  // Uttarakhand (13 districts)
  "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", 
  "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", 
  "Udham Singh Nagar", "Uttarkashi",

  // West Bengal (23 districts)
  "Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", 
  "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", 
  "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", 
  "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", 
  "Purulia", "South 24 Parganas", "Uttar Dinajpur",

  // Union Territories
  "Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", 
  "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", 
  "South West Delhi", "West Delhi", "Chandigarh", "Nicobar", 
  "North and Middle Andaman", "South Andaman", "Dadra and Nagar Haveli", 
  "Daman", "Diu", "Anantnag", "Bandipore", "Baramulla", "Budgam", "Doda", 
  "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", 
  "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", 
  "Udhampur", "Kargil", "Leh", "Lakshadweep", "Karaikal", "Mahe", "Puducherry", "Yanam"
];

export const TRAIN_OPERATORS = [
  "Rajdhani Express", "Shatabdi Express", "Vande Bharat Express", "Duronto Express", 
  "Tejas Express", "Humsafar Express", "Garib Rath", "Gatimaan Express",
  "Indian Railways", "Northern Railway", "Southern Railway", "Eastern Railway",
  "Western Railway", "Central Railway", "North Eastern Railway", "Northeast Frontier Railway",
  "South Eastern Railway", "South Central Railway", "South Western Railway",
  "North Western Railway", "West Central Railway", "North Central Railway",
  "East Central Railway", "East Coast Railway", "Konkan Railway", "Metro Railway",
  "Jan Shatabdi Express", "Superfast Express", "Mail/Express", "Passenger/Local"
];

export const TRAIN_TYPES = [
  {
    name: "Rajdhani Express",
    classification: "High-Priority Express",
    feature: "Connects the National Capital (New Delhi) to state capitals. Fully Air-Conditioned (AC), fastest trains on their respective routes.",
    amenities: ["AC 1st Class", "AC 2nd Class", "AC 3rd Class", "Pantry Car", "WiFi"],
    priceMultiplier: 1.5
  },
  {
    name: "Shatabdi Express",
    classification: "High-Priority Express",
    feature: "Day-journey trains (return to base on the same day). Connects metro cities and important state capitals. Fully AC with only seats (no sleeping berths).",
    amenities: ["AC Chair Car", "Executive Class", "Pantry Car", "WiFi"],
    priceMultiplier: 1.4
  },
  {
    name: "Vande Bharat Express",
    classification: "Premium Express",
    feature: "Modern, semi-high-speed (up to 160 km/h) Electric Multiple Unit (EMU) trains. Fully AC Chair Car, typically for day travel.",
    amenities: ["AC Chair Car", "Executive Class", "WiFi", "Charging Points", "Entertainment"],
    priceMultiplier: 1.6
  },
  {
    name: "Duronto Express",
    classification: "High-Priority Express",
    feature: "Long-distance, non-stop (or minimal stops). The first commercial stop is often a major city very far from the origin.",
    amenities: ["AC 1st Class", "AC 2nd Class", "AC 3rd Class", "Sleeper", "Pantry Car"],
    priceMultiplier: 1.3
  },
  {
    name: "Tejas Express",
    classification: "Premium Express",
    feature: "Semi-high speed, featuring modern amenities and smart coaches.",
    amenities: ["AC Chair Car", "Executive Class", "WiFi", "Entertainment", "Catering"],
    priceMultiplier: 1.5
  },
  {
    name: "Humsafar Express",
    classification: "Premium Express",
    feature: "Fully AC 3-Tier sleeper train, designed for high-end, comfortable long-distance travel.",
    amenities: ["AC 3rd Class", "WiFi", "Charging Points", "Catering", "Bedding"],
    priceMultiplier: 1.2
  },
  {
    name: "Garib Rath Express",
    classification: "AC Economy Express",
    feature: "Low-cost, fully AC (3-Tier only) train for the 'common man', with high speed and long distance.",
    amenities: ["AC 3rd Class", "Basic Amenities"],
    priceMultiplier: 0.9
  },
  {
    name: "Jan Shatabdi Express",
    classification: "Affordable Day Express",
    feature: "More affordable alternative to Shatabdi. Features both AC Chair Car and Non-AC Chair Car (seating).",
    amenities: ["AC Chair Car", "Non-AC Chair Car", "Basic Amenities"],
    priceMultiplier: 1.0
  },
  {
    name: "Superfast Express",
    classification: "Express Trains",
    feature: "Trains with an average speed of 55 km/h and above. They have limited stops and are faster than Mail/Express trains.",
    amenities: ["AC 1st Class", "AC 2nd Class", "AC 3rd Class", "Sleeper", "General"],
    priceMultiplier: 1.1
  },
  {
    name: "Mail/Express",
    classification: "Express Trains",
    feature: "Standard long-distance trains, generally with more stops than Superfast trains.",
    amenities: ["AC 1st Class", "AC 2nd Class", "AC 3rd Class", "Sleeper", "General"],
    priceMultiplier: 1.0
  },
  {
    name: "Passenger/Local",
    classification: "Commuter/Local Trains",
    feature: "Slowest category, stopping at almost all stations. Used for short-distance intercity travel or suburban service.",
    amenities: ["General Class", "Basic Seating"],
    priceMultiplier: 0.7
  }
];

// Major train routes connecting states and districts
export const TRAIN_ROUTES = [
  // North-South Routes
  { from: "New Delhi", to: "Chennai", distance: "2180 km", duration: "28-32 hours" },
  { from: "New Delhi", to: "Bangalore", distance: "2370 km", duration: "32-36 hours" },
  { from: "New Delhi", to: "Hyderabad", distance: "1670 km", duration: "24-28 hours" },
  { from: "New Delhi", to: "Mumbai", distance: "1384 km", duration: "16-20 hours" },
  { from: "New Delhi", to: "Kolkata", distance: "1470 km", duration: "18-22 hours" },
  
  // East-West Routes
  { from: "Mumbai", to: "Kolkata", distance: "2010 km", duration: "26-30 hours" },
  { from: "Mumbai", to: "Chennai", distance: "1330 km", duration: "18-22 hours" },
  { from: "Mumbai", to: "Bangalore", distance: "850 km", duration: "12-16 hours" },
  { from: "Mumbai", to: "Hyderabad", distance: "710 km", duration: "10-14 hours" },
  
  // Regional Routes
  { from: "Chennai", to: "Bangalore", distance: "360 km", duration: "5-7 hours" },
  { from: "Chennai", to: "Hyderabad", distance: "715 km", duration: "10-12 hours" },
  { from: "Bangalore", to: "Hyderabad", distance: "570 km", duration: "8-10 hours" },
  { from: "Kolkata", to: "Chennai", distance: "1650 km", duration: "22-26 hours" },
  
  // State Capital Routes
  { from: "New Delhi", to: "Jaipur", distance: "280 km", duration: "4-6 hours" },
  { from: "New Delhi", to: "Lucknow", distance: "550 km", duration: "6-8 hours" },
  { from: "New Delhi", to: "Chandigarh", distance: "250 km", duration: "3-5 hours" },
  { from: "Mumbai", to: "Pune", distance: "150 km", duration: "2-4 hours" },
  { from: "Mumbai", to: "Ahmedabad", distance: "530 km", duration: "6-8 hours" },
  { from: "Chennai", to: "Coimbatore", distance: "500 km", duration: "6-8 hours" },
  { from: "Bangalore", to: "Mysuru", distance: "140 km", duration: "2-3 hours" },
  { from: "Kolkata", to: "Bhubaneswar", distance: "440 km", duration: "6-8 hours" },
  
  // Popular Tourist Routes
  { from: "New Delhi", to: "Agra", distance: "200 km", duration: "2-4 hours" },
  { from: "New Delhi", to: "Varanasi", distance: "800 km", duration: "10-12 hours" },
  { from: "Mumbai", to: "Goa", distance: "580 km", duration: "8-10 hours" },
  { from: "Chennai", to: "Madurai", distance: "460 km", duration: "6-8 hours" },
  { from: "Bangalore", to: "Mangalore", distance: "350 km", duration: "6-8 hours" },
  
  // Metro City Connections
  { from: "New Delhi", to: "Gurugram", distance: "30 km", duration: "1-2 hours" },
  { from: "Mumbai", to: "Thane", distance: "35 km", duration: "1-2 hours" },
  { from: "Chennai", to: "Chengalpattu", distance: "60 km", duration: "1-2 hours" },
  { from: "Bangalore", to: "Electronic City", distance: "25 km", duration: "1-2 hours" },
  { from: "Kolkata", to: "Howrah", distance: "5 km", duration: "30 minutes" }
];

// Helper functions
export function getDistrictsByState(state: string): string[] {
  // This is a simplified mapping - in a real app, you'd have a more detailed mapping
  return INDIAN_DISTRICTS.filter(district => 
    district.toLowerCase().includes(state.toLowerCase()) || 
    state.toLowerCase().includes(district.toLowerCase())
  );
}

export function getRoutesByCities(fromCity: string, toCity: string) {
  return TRAIN_ROUTES.filter(route => 
    route.from.toLowerCase().includes(fromCity.toLowerCase()) && 
    route.to.toLowerCase().includes(toCity.toLowerCase())
  );
}

export function getTrainTypesByClassification(classification: string) {
  return TRAIN_TYPES.filter(type => 
    type.classification.toLowerCase().includes(classification.toLowerCase())
  );
}

export function getAmenitiesForTrainType(trainType: string) {
  const type = TRAIN_TYPES.find(t => t.name.toLowerCase().includes(trainType.toLowerCase()));
  return type ? type.amenities : ["Basic Amenities"];
}

export function getPriceMultiplier(trainType: string) {
  const type = TRAIN_TYPES.find(t => t.name.toLowerCase().includes(trainType.toLowerCase()));
  return type ? type.priceMultiplier : 1.0;
}


