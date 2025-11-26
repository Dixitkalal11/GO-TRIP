const mysql = require('mysql2/promise');
require('dotenv').config();

// India States and Districts Data
const indiaData = {
  states: [
    { name: "Andhra Pradesh", districts: ["Alluri Sitharama Raju", "Anakapalli", "Ananthapuramu", "Annamayya", "Bapatla", "Chittoor", "Dr. B.R. Ambedkar Konaseema", "East Godavari", "Eluru", "Guntur", "Kakinada", "Krishna", "Kurnool", "Nandyal", "NTR", "Palnadu", "Parvathipuram Manyam", "Prakasam", "Sri Sathya Sai", "Srikakulam", "Sri Potti Sriramulu Nellore", "Tirupati", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"] },
    { name: "Arunachal Pradesh", districts: ["Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Kamle", "Kra Daadi", "Kurung Kumey", "Lepa Rada", "Lohit", "Longding", "Lower Dibang Valley", "Lower Siang", "Lower Subansiri", "Namsai", "Pakke Kessang", "Papum Pare", "Shi Yomi", "Siang", "Tawang", "Tirap", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang", "Capital Complex Itanagar"] },
    { name: "Assam", districts: ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salamara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong", "Bajali", "Tamulpur"] },
    { name: "Bihar", districts: ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur (Bhabua)", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"] },
    { name: "Chhattisgarh", districts: ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Gaurela-Pendra-Marwahi", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Khairagarh-Chhuikhadan-Gandai", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Manendragarh-Chirmiri-Bharatpur", "Mohla-Manpur-Ambagarh Chowki", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sarangarh-Bilaigarh", "Shakti", "Sukma", "Surajpur", "Surguja"] },
    { name: "Goa", districts: ["North Goa", "South Goa"] },
    { name: "Gujarat", districts: ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kutch", "Kheda", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"] },
    { name: "Haryana", districts: ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"] },
    { name: "Himachal Pradesh", districts: ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"] },
    { name: "Jharkhand", districts: ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Seraikela-Kharsawan", "Simdega", "West Singhbhum"] },
    { name: "Karnataka", districts: ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapura", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Kalaburagi", "Hassan", "Haveri", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayanagara", "Vijayapura", "Yadgir"] },
    { name: "Kerala", districts: ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"] },
    { name: "Madhya Pradesh", districts: ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Niwari", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"] },
    { name: "Maharashtra", districts: ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"] },
    { name: "Manipur", districts: ["Bishnupur", "Churachandpur", "Chandel", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"] },
    { name: "Meghalaya", districts: ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills", "Eastern West Khasi Hills"] },
    { name: "Mizoram", districts: ["Aizawl", "Champhai", "Hnahthial", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saitual", "Serchhip", "Siaha", "Khawzawl"] },
    { name: "Nagaland", districts: ["Chumoukedima", "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Niuland", "Noklak", "Peren", "Phek", "Shamator", "Tseminyu", "Tuensang", "Wokha", "Zunheboto", "Meluri"] },
    { name: "Odisha", districts: ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Debagarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"] },
    { name: "Punjab", districts: ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Firozpur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar", "Sangrur", "Shahid Bhagat Singh Nagar", "Tarn Taran", "Malerkotla"] },
    { name: "Rajasthan", districts: ["Ajmer", "Alwar", "Anupgarh", "Balotra", "Banswara", "Baran", "Barmer", "Beawar", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Didwana Kuchaman", "Dudu", "Dungarpur", "Ganganagar", "Gangapur City", "Hanumangarh", "Jaipur", "Jaipur Rural", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Jodhpur Rural", "Karauli", "Kota", "Kotputli-Behror", "Khairthal-Tijara", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Salumbar", "Sanchore", "Sawai Madhopur", "Shahpura", "Sikar", "Sirohi", "Tonk", "Udaipur"] },
    { name: "Sikkim", districts: ["Gangtok", "Gyalshing", "Mangan", "Namchi", "Pakyong", "Soreng"] },
    { name: "Tamil Nadu", districts: ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"] },
    { name: "Telangana", districts: ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal–Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Ranga Reddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"] },
    { name: "Tripura", districts: ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"] },
    { name: "Uttar Pradesh", districts: ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Rae Bareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"] },
    { name: "Uttarakhand", districts: ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"] },
    { name: "West Bengal", districts: ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"] }
  ],
  unionTerritories: [
    { name: "Andaman and Nicobar Islands", districts: ["Nicobar", "North and Middle Andaman", "South Andaman"] },
    { name: "Chandigarh", districts: ["Chandigarh"] },
    { name: "Dadra and Nagar Haveli and Daman & Diu", districts: ["Dadra and Nagar Haveli", "Daman", "Diu"] },
    { name: "The NCT of Delhi", districts: ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"] },
    { name: "Jammu & Kashmir", districts: ["Anantnag", "Bandipore", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"] },
    { name: "Ladakh", districts: ["Kargil", "Leh"] },
    { name: "Lakshadweep", districts: ["Lakshadweep"] },
    { name: "Puducherry", districts: ["Karaikal", "Mahe", "Puducherry", "Yanam"] }
  ]
};

// Bus operators (Real Indian bus companies)
const busOperators = [
  "VRL Travels", "SRS Travels", "Neeta Travels", "KPN Travels", "Orange Travels", "Shrinath Travels",
  "RedBus", "TSRTC", "MSRTC", "GSRTC", "RSRTC", "KSRTC", "KTC", "MPSRTC", 
  "UPSRTC", "OSRTC", "BSRTC", "HPRTC", "JSRTC", "PSRTC", "RTC", "WBTC",
  "APSRTC", "ASRTC", "BRSRTC", "CTSRTC", "GOSRTC", "HRSRTC", "HPSRTC",
  "JHSRTC", "KASRTC", "KLSRTC", "MPSRTC", "MHSRTC", "MZSRTC", "NLSRTC",
  "ODSRTC", "PBSRTC", "RJSRTC", "SKSRTC", "TNSRTC", "TGSRTC", "TPSRTC",
  "UPSRTC", "UKSRTC", "WBSRTC"
];

// Bus service types (Luxury/Model names)
const busServiceTypes = [
  "Volvo", "Scania", "Mercedes-Benz", "Airavat", "Tata Starbus", "BharatBenz", 
  "Sleeper", "Semi-Sleeper", "AC Seater", "Non-AC Seater", "Multi-Axle"
];

// Train operators (Real Indian train names)
const trainOperators = [
  "Rajdhani Express", "Shatabdi Express", "Vande Bharat Express", "Duronto Express", 
  "Tejas Express", "Humsafar Express", "Garib Rath", "Gatimaan Express",
  "Indian Railways", "Northern Railway", "Southern Railway", "Eastern Railway",
  "Western Railway", "Central Railway", "North Eastern Railway", "Northeast Frontier Railway",
  "South Eastern Railway", "South Central Railway", "South Western Railway",
  "North Western Railway", "West Central Railway", "North Central Railway",
  "East Central Railway", "East Coast Railway", "Konkan Railway", "Metro Railway"
];

// Flight operators (Real Indian airlines)
const flightOperators = [
  "IndiGo", "Air India", "Air India Express", "SpiceJet", "Akasa Air", "Alliance Air", "Vistara"
];

// Generate random price based on distance and mode
function generatePrice(from, to, mode) {
  const basePrices = {
    bus: { min: 200, max: 2000 },
    train: { min: 300, max: 3000 },
    flight: { min: 2000, max: 15000 }
  };
  
  const base = basePrices[mode];
  return Math.floor(Math.random() * (base.max - base.min + 1)) + base.min;
}

// Generate random duration based on mode
function generateDuration(mode) {
  const durations = {
    bus: ["2h 30m", "3h 15m", "4h 45m", "5h 20m", "6h 30m", "8h 15m", "10h 30m", "12h 45m"],
    train: ["3h 20m", "4h 45m", "6h 15m", "8h 30m", "10h 45m", "12h 20m", "15h 30m", "18h 45m"],
    flight: ["1h 15m", "1h 45m", "2h 30m", "3h 15m", "4h 45m", "6h 30m"]
  };
  
  const options = durations[mode];
  return options[Math.floor(Math.random() * options.length)];
}

// Generate random time
function generateTime() {
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
}

async function generateRoutes() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mahekkk11',
    database: 'gotrip_db'
  });

  try {
    console.log('🗑️ Clearing existing routes...');
    // Delete schedules first due to foreign key constraint
    await connection.execute('DELETE FROM schedules');
    await connection.execute('DELETE FROM routes');

    console.log('🚀 Generating new routes...');

    // Generate Flight Routes (State to State)
    console.log('✈️ Generating flight routes...');
    const allStates = [...indiaData.states, ...indiaData.unionTerritories];
    
    for (let i = 0; i < allStates.length; i++) {
      for (let j = 0; j < allStates.length; j++) {
        if (i !== j) {
          const fromState = allStates[i];
          const toState = allStates[j];
          
          // Use capital city or first district as representative
          const fromCity = fromState.districts[0];
          const toCity = toState.districts[0];
          
          const price = generatePrice(fromCity, toCity, 'flight');
          const duration = generateDuration('flight');
          const departureTime = generateTime();
          const arrivalTime = generateTime();
          
          const now = new Date();
          await connection.execute(
            `INSERT INTO routes (fromCity, toCity, travelMode, operator, price, duration, departureTime, arrivalTime, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              fromCity,
              toCity,
              'flight',
              flightOperators[Math.floor(Math.random() * flightOperators.length)],
              price,
              duration,
              departureTime,
              arrivalTime,
              1,
              now,
              now
            ]
          );
        }
      }
    }

    // Generate Bus Routes (District to District within same state and neighboring states)
    console.log('🚌 Generating bus routes...');
    const allDistricts = [];
    
    // Collect all districts
    allStates.forEach(state => {
      state.districts.forEach(district => {
        allDistricts.push({ district, state: state.name });
      });
    });

    // Generate bus routes (limited to avoid too many routes)
    const maxBusRoutes = 1000; // Limit to 1000 bus routes
    let busRouteCount = 0;
    
    for (let i = 0; i < allDistricts.length && busRouteCount < maxBusRoutes; i++) {
      for (let j = 0; j < allDistricts.length && busRouteCount < maxBusRoutes; j++) {
        if (i !== j && Math.random() < 0.1) { // 10% chance to create route
          const fromDistrict = allDistricts[i];
          const toDistrict = allDistricts[j];
          
          const price = generatePrice(fromDistrict.district, toDistrict.district, 'bus');
          const duration = generateDuration('bus');
          const departureTime = generateTime();
          const arrivalTime = generateTime();
          
          // Generate bus operator with service type
          const busOperator = busOperators[Math.floor(Math.random() * busOperators.length)];
          const serviceType = busServiceTypes[Math.floor(Math.random() * busServiceTypes.length)];
          const fullOperatorName = `${busOperator} - ${serviceType}`;
          
          const now = new Date();
          await connection.execute(
            `INSERT INTO routes (fromCity, toCity, travelMode, operator, price, duration, departureTime, arrivalTime, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              fromDistrict.district,
              toDistrict.district,
              'bus',
              fullOperatorName,
              price,
              duration,
              departureTime,
              arrivalTime,
              1,
              now,
              now
            ]
          );
          
          busRouteCount++;
        }
      }
    }

    // Generate Train Routes (Major districts only)
    console.log('🚂 Generating train routes...');
    const majorDistricts = [
      // Major cities from each state
      "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad",
      "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
      "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana",
      "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivali", "Vasai-Virar",
      "Varanasi", "Srinagar", "Aurangabad", "Navi Mumbai", "Solapur", "Vijayawada", "Kolhapur",
      "Amritsar", "Nashik", "Sangli", "Mysore", "Mangalore", "Kochi", "Thiruvananthapuram",
      "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Tiruppur",
      "Vellore", "Thanjavur", "Dindigul", "Karur", "Nagercoil", "Hosur", "Cuddalore",
      "Kanchipuram", "Tiruvallur", "Tiruvannamalai", "Viluppuram", "Krishnagiri", "Dharmapuri",
      "Namakkal", "Perambalur", "Ariyalur", "Pudukkottai", "Sivaganga", "Ramanathapuram",
      "Theni", "Virudhunagar", "Thoothukudi", "Tenkasi", "Kanyakumari", "Nilgiris"
    ];

    const maxTrainRoutes = 500; // Limit to 500 train routes
    let trainRouteCount = 0;
    
    for (let i = 0; i < majorDistricts.length && trainRouteCount < maxTrainRoutes; i++) {
      for (let j = 0; j < majorDistricts.length && trainRouteCount < maxTrainRoutes; j++) {
        if (i !== j && Math.random() < 0.3) { // 30% chance to create route
          const fromCity = majorDistricts[i];
          const toCity = majorDistricts[j];
          
          const price = generatePrice(fromCity, toCity, 'train');
          const duration = generateDuration('train');
          const departureTime = generateTime();
          const arrivalTime = generateTime();
          
          const now = new Date();
          await connection.execute(
            `INSERT INTO routes (fromCity, toCity, travelMode, operator, price, duration, departureTime, arrivalTime, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              fromCity,
              toCity,
              'train',
              trainOperators[Math.floor(Math.random() * trainOperators.length)],
              price,
              duration,
              departureTime,
              arrivalTime,
              1,
              now,
              now
            ]
          );
          
          trainRouteCount++;
        }
      }
    }

    // Get total count
    const [result] = await connection.execute('SELECT COUNT(*) as total FROM routes');
    const totalRoutes = result[0].total;

    console.log(`✅ Successfully generated ${totalRoutes} routes!`);
    console.log(`✈️ Flight routes: ${allStates.length * (allStates.length - 1)}`);
    console.log(`🚌 Bus routes: ${busRouteCount}`);
    console.log(`🚂 Train routes: ${trainRouteCount}`);

  } catch (error) {
    console.error('❌ Error generating routes:', error);
  } finally {
    await connection.end();
  }
}

// Run the script
generateRoutes();
