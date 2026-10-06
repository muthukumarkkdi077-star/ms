/**
 * RouteMind AI - Comprehensive India Geographic Database
 * Contains all 38 Districts of Tamil Nadu, key districts across all Indian States,
 * major logistics corridors, commercial hubs, towns, and taluks.
 */

export interface LocationRecord {
  name: string;
  state: string;
  type: 'District' | 'City' | 'Major Town' | 'Logistics Hub' | 'Port';
  coords: [number, number]; // [lat, lng]
}

export const ALL_INDIA_LOCATIONS: LocationRecord[] = [
  // ── TAMIL NADU (ALL 38 DISTRICTS + MAJOR HUBS & TALUKS) ──
  { name: 'Coimbatore', state: 'Tamil Nadu', type: 'District', coords: [11.0168, 76.9558] },
  { name: 'Madurai', state: 'Tamil Nadu', type: 'District', coords: [9.9252, 78.1198] },
  { name: 'Chennai', state: 'Tamil Nadu', type: 'District', coords: [13.0827, 80.2707] },
  { name: 'Tiruchirappalli (Trichy)', state: 'Tamil Nadu', type: 'District', coords: [10.7905, 78.7047] },
  { name: 'Salem', state: 'Tamil Nadu', type: 'District', coords: [11.6643, 78.1460] },
  { name: 'Tiruppur', state: 'Tamil Nadu', type: 'District', coords: [11.1085, 77.3411] },
  { name: 'Erode', state: 'Tamil Nadu', type: 'District', coords: [11.3410, 77.7172] },
  { name: 'Dindigul', state: 'Tamil Nadu', type: 'District', coords: [10.3673, 77.9803] },
  { name: 'Tirunelveli', state: 'Tamil Nadu', type: 'District', coords: [8.7139, 77.7567] },
  { name: 'Thoothukudi (Tuticorin)', state: 'Tamil Nadu', type: 'District', coords: [8.7642, 78.1348] },
  { name: 'Kanyakumari (Nagercoil)', state: 'Tamil Nadu', type: 'District', coords: [8.1833, 77.4119] },
  { name: 'Thanjavur', state: 'Tamil Nadu', type: 'District', coords: [10.7870, 79.1378] },
  { name: 'Vellore', state: 'Tamil Nadu', type: 'District', coords: [12.9165, 79.1325] },
  { name: 'Karur', state: 'Tamil Nadu', type: 'District', coords: [10.9601, 78.0766] },
  { name: 'Namakkal', state: 'Tamil Nadu', type: 'District', coords: [11.2189, 78.1674] },
  { name: 'Theni', state: 'Tamil Nadu', type: 'District', coords: [10.0104, 77.4768] },
  { name: 'Virudhunagar', state: 'Tamil Nadu', type: 'District', coords: [9.5680, 77.9624] },
  { name: 'Sivaganga', state: 'Tamil Nadu', type: 'District', coords: [9.8433, 78.4809] },
  { name: 'Ramanathapuram', state: 'Tamil Nadu', type: 'District', coords: [9.3639, 78.8395] },
  { name: 'Pudukkottai', state: 'Tamil Nadu', type: 'District', coords: [10.3833, 78.8001] },
  { name: 'Dharmapuri', state: 'Tamil Nadu', type: 'District', coords: [12.1211, 78.1582] },
  { name: 'Krishnagiri', state: 'Tamil Nadu', type: 'District', coords: [12.5266, 78.2146] },
  { name: 'Tiruvannamalai', state: 'Tamil Nadu', type: 'District', coords: [12.2253, 79.0747] },
  { name: 'Villupuram', state: 'Tamil Nadu', type: 'District', coords: [11.9401, 79.4861] },
  { name: 'Cuddalore', state: 'Tamil Nadu', type: 'District', coords: [11.7480, 79.7714] },
  { name: 'Kallakurichi', state: 'Tamil Nadu', type: 'District', coords: [11.7383, 78.9639] },
  { name: 'Chengalpattu', state: 'Tamil Nadu', type: 'District', coords: [12.6841, 79.9836] },
  { name: 'Kanchipuram', state: 'Tamil Nadu', type: 'District', coords: [12.8342, 79.7036] },
  { name: 'Tiruvallur', state: 'Tamil Nadu', type: 'District', coords: [13.1432, 79.9079] },
  { name: 'Ranipet', state: 'Tamil Nadu', type: 'District', coords: [12.9272, 79.3330] },
  { name: 'Tirupathur', state: 'Tamil Nadu', type: 'District', coords: [12.4958, 78.5678] },
  { name: 'Perambalur', state: 'Tamil Nadu', type: 'District', coords: [11.2333, 78.8833] },
  { name: 'Ariyalur', state: 'Tamil Nadu', type: 'District', coords: [11.1401, 79.0786] },
  { name: 'Nagapattinam', state: 'Tamil Nadu', type: 'District', coords: [10.7672, 79.8449] },
  { name: 'Tiruvarur', state: 'Tamil Nadu', type: 'District', coords: [10.7725, 79.6365] },
  { name: 'Mayiladuthurai', state: 'Tamil Nadu', type: 'District', coords: [11.1075, 79.6524] },
  { name: 'Nilgiris (Ooty)', state: 'Tamil Nadu', type: 'District', coords: [11.4102, 76.6950] },
  { name: 'Tenkasi', state: 'Tamil Nadu', type: 'District', coords: [8.9594, 77.3152] },

  // Key Tamil Nadu Hubs, Towns & Villages
  { name: 'Pollachi', state: 'Tamil Nadu', type: 'Major Town', coords: [10.6609, 77.0048] },
  { name: 'Hosur', state: 'Tamil Nadu', type: 'Logistics Hub', coords: [12.7409, 77.8253] },
  { name: 'Dharapuram', state: 'Tamil Nadu', type: 'Major Town', coords: [10.7289, 77.5264] },
  { name: 'Oddanchatram', state: 'Tamil Nadu', type: 'Major Town', coords: [10.4850, 77.7470] },
  { name: 'Palani', state: 'Tamil Nadu', type: 'Major Town', coords: [10.4500, 77.5200] },
  { name: 'Udumalaipettai', state: 'Tamil Nadu', type: 'Major Town', coords: [10.5857, 77.2483] },
  { name: 'Mettupalayam', state: 'Tamil Nadu', type: 'Major Town', coords: [11.3000, 76.9500] },
  { name: 'Karaikudi', state: 'Tamil Nadu', type: 'Major Town', coords: [10.0735, 78.7732] },
  { name: 'Kumbakonam', state: 'Tamil Nadu', type: 'Major Town', coords: [10.9602, 79.3845] },
  { name: 'Rajapalayam', state: 'Tamil Nadu', type: 'Major Town', coords: [9.4533, 77.5539] },
  { name: 'Sivakasi', state: 'Tamil Nadu', type: 'Major Town', coords: [9.4533, 77.8024] },
  { name: 'Kovilpatti', state: 'Tamil Nadu', type: 'Major Town', coords: [9.1724, 77.8687] },
  { name: 'Aruppukottai', state: 'Tamil Nadu', type: 'Major Town', coords: [9.5108, 78.0988] },
  { name: 'Perundurai', state: 'Tamil Nadu', type: 'Logistics Hub', coords: [11.2750, 77.5833] },
  { name: 'Palladam', state: 'Tamil Nadu', type: 'Major Town', coords: [10.9980, 77.2800] },
  { name: 'Avinashi', state: 'Tamil Nadu', type: 'Major Town', coords: [11.1925, 77.2689] },
  { name: 'Ambur', state: 'Tamil Nadu', type: 'Major Town', coords: [12.7844, 78.7142] },
  { name: 'Vaniyambadi', state: 'Tamil Nadu', type: 'Major Town', coords: [12.6833, 78.6167] },
  { name: 'Neyveli', state: 'Tamil Nadu', type: 'Major Town', coords: [11.6000, 79.4833] },
  { name: 'Chidambaram', state: 'Tamil Nadu', type: 'Major Town', coords: [11.3992, 79.6936] },
  { name: 'Pondicherry (Puducherry)', state: 'Puducherry', type: 'District', coords: [11.9416, 79.8083] },

  // ── KERALA ──
  { name: 'Kochi (Cochin / Ernakulam)', state: 'Kerala', type: 'District', coords: [9.9312, 76.2673] },
  { name: 'Thiruvananthapuram (Trivandrum)', state: 'Kerala', type: 'District', coords: [8.5241, 76.9366] },
  { name: 'Kozhikode (Calicut)', state: 'Kerala', type: 'District', coords: [11.2588, 75.7804] },
  { name: 'Palakkad', state: 'Kerala', type: 'District', coords: [10.7867, 76.6548] },
  { name: 'Thrissur', state: 'Kerala', type: 'District', coords: [10.5276, 76.2144] },
  { name: 'Kollam (Quilon)', state: 'Kerala', type: 'District', coords: [8.8932, 76.6141] },
  { name: 'Kannur', state: 'Kerala', type: 'District', coords: [11.8745, 75.3704] },
  { name: 'Alappuzha (Alleppey)', state: 'Kerala', type: 'District', coords: [9.4981, 76.3388] },
  { name: 'Kottayam', state: 'Kerala', type: 'District', coords: [9.5916, 76.5222] },
  { name: 'Malappuram', state: 'Kerala', type: 'District', coords: [11.0735, 76.0740] },
  { name: 'Kasaragod', state: 'Kerala', type: 'District', coords: [12.5102, 74.9852] },
  { name: 'Wayanad (Kalpetta)', state: 'Kerala', type: 'District', coords: [11.6050, 76.0830] },
  { name: 'Idukki', state: 'Kerala', type: 'District', coords: [9.8493, 76.9710] },

  // ── KARNATAKA ──
  { name: 'Bengaluru (Bangalore)', state: 'Karnataka', type: 'District', coords: [12.9716, 77.5946] },
  { name: 'Mysuru (Mysore)', state: 'Karnataka', type: 'District', coords: [12.2958, 76.6394] },
  { name: 'Mangaluru (Mangalore)', state: 'Karnataka', type: 'District', coords: [12.9141, 74.8560] },
  { name: 'Hubballi (Hubli) - Dharwad', state: 'Karnataka', type: 'District', coords: [15.3647, 75.1240] },
  { name: 'Belagavi (Belgaum)', state: 'Karnataka', type: 'District', coords: [15.8497, 74.4977] },
  { name: 'Ballari (Bellary)', state: 'Karnataka', type: 'District', coords: [15.1394, 76.9214] },
  { name: 'Kalaburagi (Gulbarga)', state: 'Karnataka', type: 'District', coords: [17.3297, 76.8343] },
  { name: 'Tumakuru (Tumkur)', state: 'Karnataka', type: 'District', coords: [13.3409, 77.1010] },
  { name: 'Shivamogga (Shimoga)', state: 'Karnataka', type: 'District', coords: [13.9299, 75.5681] },
  { name: 'Davanagere', state: 'Karnataka', type: 'District', coords: [14.4644, 75.9218] },
  { name: 'Hassan', state: 'Karnataka', type: 'District', coords: [13.0033, 76.1004] },
  { name: 'Udupi', state: 'Karnataka', type: 'District', coords: [13.3409, 74.7421] },

  // ── ANDHRA PRADESH & TELANGANA ──
  { name: 'Hyderabad', state: 'Telangana', type: 'District', coords: [17.3850, 78.4867] },
  { name: 'Secunderabad', state: 'Telangana', type: 'City', coords: [17.4399, 78.4983] },
  { name: 'Warangal', state: 'Telangana', type: 'District', coords: [17.9689, 79.5941] },
  { name: 'Nizamabad', state: 'Telangana', type: 'District', coords: [18.6725, 78.0941] },
  { name: 'Khammam', state: 'Telangana', type: 'District', coords: [17.2473, 80.1514] },
  { name: 'Visakhapatnam (Vizag)', state: 'Andhra Pradesh', type: 'District', coords: [17.6868, 83.2185] },
  { name: 'Vijayawada', state: 'Andhra Pradesh', type: 'District', coords: [16.5062, 80.6480] },
  { name: 'Guntur', state: 'Andhra Pradesh', type: 'District', coords: [16.3067, 80.4365] },
  { name: 'Tirupati', state: 'Andhra Pradesh', type: 'District', coords: [13.6288, 79.4192] },
  { name: 'Nellore', state: 'Andhra Pradesh', type: 'District', coords: [14.4426, 79.9865] },
  { name: 'Kurnool', state: 'Andhra Pradesh', type: 'District', coords: [15.8281, 78.0373] },
  { name: 'Anantapur', state: 'Andhra Pradesh', type: 'District', coords: [14.6819, 77.6006] },
  { name: 'Kadapa', state: 'Andhra Pradesh', type: 'District', coords: [14.4673, 78.8242] },
  { name: 'Rajahmundry', state: 'Andhra Pradesh', type: 'City', coords: [17.0005, 81.8040] },
  { name: 'Kakinada', state: 'Andhra Pradesh', type: 'District', coords: [16.9891, 82.2475] },

  // ── MAHARASHTRA & GUJARAT ──
  { name: 'Mumbai', state: 'Maharashtra', type: 'District', coords: [19.0760, 72.8777] },
  { name: 'Pune', state: 'Maharashtra', type: 'District', coords: [18.5204, 73.8567] },
  { name: 'Nagpur', state: 'Maharashtra', type: 'District', coords: [21.1458, 79.0882] },
  { name: 'Nashik', state: 'Maharashtra', type: 'District', coords: [19.9975, 73.7898] },
  { name: 'Aurangabad (Chhatrapati Sambhajinagar)', state: 'Maharashtra', type: 'District', coords: [19.8762, 75.3433] },
  { name: 'Solapur', state: 'Maharashtra', type: 'District', coords: [17.6599, 75.9064] },
  { name: 'Kolhapur', state: 'Maharashtra', type: 'District', coords: [16.7050, 74.2433] },
  { name: 'Thane', state: 'Maharashtra', type: 'District', coords: [19.2183, 72.9781] },
  { name: 'Navi Mumbai', state: 'Maharashtra', type: 'Logistics Hub', coords: [19.0330, 73.0297] },
  { name: 'Ahmedabad', state: 'Gujarat', type: 'District', coords: [23.0225, 72.5714] },
  { name: 'Surat', state: 'Gujarat', type: 'District', coords: [21.1702, 72.8311] },
  { name: 'Vadodara (Baroda)', state: 'Gujarat', type: 'District', coords: [22.3072, 73.1812] },
  { name: 'Rajkot', state: 'Gujarat', type: 'District', coords: [22.3039, 70.8022] },
  { name: 'Bhavnagar', state: 'Gujarat', type: 'District', coords: [21.7645, 72.1519] },
  { name: 'Jamnagar', state: 'Gujarat', type: 'District', coords: [22.4707, 70.0577] },
  { name: 'Gandhinagar', state: 'Gujarat', type: 'District', coords: [23.2156, 72.6369] },

  // ── NORTH & CENTRAL INDIA ──
  { name: 'New Delhi (Delhi NCR)', state: 'Delhi', type: 'District', coords: [28.6139, 77.2090] },
  { name: 'Noida', state: 'Uttar Pradesh', type: 'Logistics Hub', coords: [28.5355, 77.3910] },
  { name: 'Gurugram (Gurgaon)', state: 'Haryana', type: 'Logistics Hub', coords: [28.4595, 77.0266] },
  { name: 'Faridabad', state: 'Haryana', type: 'District', coords: [28.4089, 77.3178] },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', type: 'District', coords: [28.6692, 77.4538] },
  { name: 'Jaipur', state: 'Rajasthan', type: 'District', coords: [26.9124, 75.7873] },
  { name: 'Jodhpur', state: 'Rajasthan', type: 'District', coords: [26.2389, 73.0243] },
  { name: 'Udaipur', state: 'Rajasthan', type: 'District', coords: [24.5854, 73.7125] },
  { name: 'Kota', state: 'Rajasthan', type: 'District', coords: [25.2138, 75.8648] },
  { name: 'Lucknow', state: 'Uttar Pradesh', type: 'District', coords: [26.8467, 80.9462] },
  { name: 'Kanpur', state: 'Uttar Pradesh', type: 'District', coords: [26.4499, 80.3319] },
  { name: 'Agra', state: 'Uttar Pradesh', type: 'District', coords: [27.1767, 78.0081] },
  { name: 'Varanasi', state: 'Uttar Pradesh', type: 'District', coords: [25.3176, 82.9739] },
  { name: 'Prayagraj (Allahabad)', state: 'Uttar Pradesh', type: 'District', coords: [25.4358, 81.8463] },
  { name: 'Meerut', state: 'Uttar Pradesh', type: 'District', coords: [28.9845, 77.7064] },
  { name: 'Chandigarh', state: 'Chandigarh', type: 'District', coords: [30.7333, 76.7794] },
  { name: 'Ludhiana', state: 'Punjab', type: 'District', coords: [30.9010, 75.8573] },
  { name: 'Amritsar', state: 'Punjab', type: 'District', coords: [31.6340, 74.8723] },
  { name: 'Jalandhar', state: 'Punjab', type: 'District', coords: [31.3260, 75.5762] },
  { name: 'Dehradun', state: 'Uttarakhand', type: 'District', coords: [30.3165, 78.0322] },
  { name: 'Bhopal', state: 'Madhya Pradesh', type: 'District', coords: [23.2599, 77.4126] },
  { name: 'Indore', state: 'Madhya Pradesh', type: 'District', coords: [22.7196, 75.8577] },
  { name: 'Gwalior', state: 'Madhya Pradesh', type: 'District', coords: [26.2183, 78.1828] },
  { name: 'Jabalpur', state: 'Madhya Pradesh', type: 'District', coords: [23.1815, 79.9864] },

  // ── EAST & NORTH-EAST INDIA ──
  { name: 'Kolkata', state: 'West Bengal', type: 'District', coords: [22.5726, 88.3639] },
  { name: 'Howrah', state: 'West Bengal', type: 'District', coords: [22.5958, 88.2636] },
  { name: 'Siliguri', state: 'West Bengal', type: 'City', coords: [26.7271, 88.3953] },
  { name: 'Patna', state: 'Bihar', type: 'District', coords: [25.5941, 85.1376] },
  { name: 'Gaya', state: 'Bihar', type: 'District', coords: [24.7914, 85.0002] },
  { name: 'Ranchi', state: 'Jharkhand', type: 'District', coords: [23.3441, 85.3096] },
  { name: 'Jamshedpur', state: 'Jharkhand', type: 'District', coords: [22.8046, 86.2029] },
  { name: 'Bhubaneswar', state: 'Odisha', type: 'District', coords: [20.2961, 85.8245] },
  { name: 'Cuttack', state: 'Odisha', type: 'District', coords: [20.4625, 85.8830] },
  { name: 'Rourkela', state: 'Odisha', type: 'City', coords: [22.2604, 84.8536] },
  { name: 'Guwahati', state: 'Assam', type: 'District', coords: [26.1445, 91.7362] },
  { name: 'Raipur', state: 'Chhattisgarh', type: 'District', coords: [21.2514, 81.6296] },
  { name: 'Goa (Panaji)', state: 'Goa', type: 'District', coords: [15.4909, 73.8278] }
];

export const CITY_COORDS_MAP: Record<string, [number, number]> = {};
ALL_INDIA_LOCATIONS.forEach((loc) => {
  CITY_COORDS_MAP[loc.name.toLowerCase()] = loc.coords;
  // Also index the simple name if parentheses are present (e.g. "Tiruchirappalli" or "Trichy")
  if (loc.name.includes('(')) {
    const parts = loc.name.split(/[()]/).map((p) => p.trim().toLowerCase()).filter(Boolean);
    parts.forEach((p) => {
      CITY_COORDS_MAP[p] = loc.coords;
    });
  }
});
