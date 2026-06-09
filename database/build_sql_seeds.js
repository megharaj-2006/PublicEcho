const fs = require('fs');
const path = require('path');

// 1. Path definitions
const csvPath = path.join('C:', 'Users', 'dell', '.gemini', 'antigravity', 'brain', 'e8257c77-3e45-4020-992a-9119a610ecc8', '.system_generated', 'steps', '63', 'content.md');
const outputDir = path.join(__dirname);

// 2. Constituency to Zone Mapping
const constituencyToZone = {
  'RAJARAJESHWARI NAGAR': 'RR Nagar',
  'BANGALORE SOUTH': 'South Zone',
  'ANEKAL (SC)': 'South Zone',
  'K.R.PURA': 'Mahadevapura',
  'BYATARAYANAPURA': 'Byatarayanapura',
  'YESHVANTHAPURA': 'RR Nagar',
  'DASARAHALLI': 'Dasarahalli',
  'MAHALAXMI LAYOUT': 'West Zone',
  'MALLESWARAM': 'West Zone',
  'HEBBAL': 'East Zone',
  'PULAKESHI NAGAR (SC)': 'East Zone',
  'SARVARGNA NAGAR': 'East Zone',
  'C.V. RAMAN NAGAR (SC)': 'East Zone',
  'SHIVAJI NAGAR': 'East Zone',
  'SHANTI NAGAR': 'East Zone',
  'GANDHI NAGAR': 'West Zone',
  'RAJAJI NAGAR': 'West Zone',
  'CHAMARAJPET': 'West Zone',
  'MAHADEVAPURA (SC)': 'Mahadevapura',
  'GOVINDRAJA NAGAR': 'West Zone',
  'VIJAYA NAGAR': 'West Zone',
  'CHICKPET': 'South Zone',
  'BASAVANAGUDI': 'South Zone',
  'PADMANABA NAGAR': 'South Zone',
  'B.T.M. LAYOUT': 'South Zone',
  'JAYANAGAR': 'South Zone',
  'BOMMANAHALLI': 'Bommanahalli',
  'YELAHANKA': 'Yelahanka'
};

// Zone centers for realistic Lat/Long generation
const zoneCenters = {
  'Mahadevapura': { lat: 12.9698, lng: 77.7499 },
  'East Zone': { lat: 12.9972, lng: 77.6214 },
  'West Zone': { lat: 12.9782, lng: 77.5684 },
  'South Zone': { lat: 12.9250, lng: 77.5897 },
  'Dasarahalli': { lat: 13.0409, lng: 77.5147 },
  'Bommanahalli': { lat: 12.9030, lng: 77.6242 },
  'RR Nagar': { lat: 12.9304, lng: 77.5358 },
  'Yelahanka': { lat: 13.1007, lng: 77.5963 },
  'Byatarayanapura': { lat: 13.0601, lng: 77.5896 }
};

// 3. Indian Names list for realistic user generation
const citizenFirstNames = ['Arjun', 'Deepa', 'Suresh', 'Lakshmi', 'Vikram', 'Ananya', 'Raghav', 'Sneha', 'Rohan', 'Vijay', 'Amit', 'Pooja', 'Rahul', 'Sunita', 'Karan', 'Meera', 'Aditya', 'Shruti', 'Sanjay', 'Geetha', 'Rajesh', 'Divya', 'Anil', 'Kavitha', 'Pranav', 'Nisha', 'Manjunath', 'Aswathy', 'Harish', 'Shweta'];
const citizenLastNames = ['Kumar', 'Nair', 'Gowda', 'Murthy', 'Sen', 'Hegde', 'Prasad', 'Rao', 'Joshi', 'Deshmukh', 'Patel', 'Sharma', 'Naidu', 'Singh', 'Reddy', 'Pillai', 'Acharya', 'Das', 'Banerjee', 'Nambiar', 'Bhat', 'Shetty', 'Menon', 'Kulkarni', 'Sastry', 'Venkatesh', 'Subramanian', 'Verma', 'Gupta', 'Shastry'];

const officialDesignations = ['Road Inspector', 'Assistant Engineer', 'Health Officer', 'Sanitation Supervisor', 'Ward Engineer', 'Revenue Officer', 'Horticulture Officer', 'Environmental Inspector'];

function buildSeeds() {
  console.log("Reading BBMP Wards CSV...");
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.split('\n');
  const wards = [];
  let headerIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Parliamentary constituency id,Parliamentary constituency')) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    console.error("❌ Failed to find CSV header in content.md");
    process.exit(1);
  }

  const seenWardIds = new Set();
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(',');
    if (parts.length >= 6) {
      const constituency = parts[3].trim();
      const wardId = parseInt(parts[4].trim());
      const wardName = parts[5].trim();
      
      if (!seenWardIds.has(wardId)) {
        seenWardIds.add(wardId);
        const zoneName = constituencyToZone[constituency] || 'East Zone';
        wards.push({ wardId, wardName, zoneName });
      }
    }
  }

  console.log(`Parsed ${wards.length} unique BBMP wards.`);

  // ----------------------------------------------------
  // FILE 1: STRUCTURE, DEPARTMENTS, CATEGORIES, DOMAINS, STATUS
  // ----------------------------------------------------
  console.log("Generating SQL File 1 (Base Structures)...");
  let sql1 = `-- PublicEcho Large Seed File 1: Base structures & metadata
USE publicecho;

-- 1. Departments (15 total)
INSERT INTO \`Departments\` (\`department_id\`, \`department_name\`, \`description\`, \`SLA_days\`) VALUES
(0, 'General Administration', 'General administrative support, public grievances, VIP coordination', 7),
(1, 'Roads & Public Infrastructure', 'Potholes, broken roads, tarring, flyovers, subways', 7),
(2, 'Water Supply & Sewerage', 'Water pipeline leaks, low water pressure, borewells, sewage blockages', 3),
(3, 'Electricity & Streetlights', 'Streetlight outages, dangling electrical wires, power supply cuts', 2),
(4, 'Sanitation & Waste Management', 'Garbage overflow, street sweeping, illegal dumping, dry/wet waste collection', 2),
(5, 'Public Health & Safety', 'Vector-borne diseases, epidemic controls, food safety inspections', 4),
(6, 'Parks & Horticulture', 'Park maintenance, fallen trees, overgrown bushes, park lightning', 5),
(7, 'Storm Water Drain Management', 'Blocked drains, desilting, flooding, encroachments of storm water drains', 7),
(8, 'Building & Construction Violations', 'Encroachments, illegal commercial buildings, violation of bylaws', 10),
(9, 'Traffic & Transportation', 'Traffic lights malfunction, missing road signs, speed bumps, public transit issues', 5),
(10, 'Animal Control & Welfare', 'Stray dog menace, vaccination drives, cattle on roads, carcass removal', 3),
(11, 'Environment & Pollution Control', 'Industrial noise, lake pollution, burning of plastic, air quality issues', 6),
(12, 'Public Property Maintenance', 'Vandalism of government buildings, public toilet upkeep, broken fencing', 4),
(13, 'Revenue & Taxation', 'Property tax discrepancies, trade license queries, revenue assessments', 10),
(14, 'Citizen Services & Documentation', 'Birth/death certificate delays, Khata registration issues', 5)
ON DUPLICATE KEY UPDATE \`department_name\` = VALUES(\`department_name\`), \`description\` = VALUES(\`description\`), \`SLA_days\` = VALUES(\`SLA_days\`);

-- 2. Complaint Categories (20 total)
INSERT INTO \`ComplaintCategories\` (\`category_id\`, \`category_name\`) VALUES
(1, 'Pothole'),
(2, 'Water Leakage'),
(3, 'Garbage Overflow'),
(4, 'Streetlight Not Working'),
(5, 'Road Damage'),
(6, 'Water Supply Issue'),
(7, 'Illegal Dumping'),
(8, 'Traffic Signal Failure'),
(9, 'Blocked Drain'),
(10, 'Flooding'),
(11, 'Stray Dog Issue'),
(12, 'Dead Animal Removal'),
(13, 'Tree Fall'),
(14, 'Overgrown Vegetation'),
(15, 'Air Pollution'),
(16, 'Noise Pollution'),
(17, 'Illegal Construction'),
(18, 'Broken Footpath'),
(19, 'Public Toilet Issue'),
(20, 'Property Tax Issue')
ON DUPLICATE KEY UPDATE \`category_name\` = VALUES(\`category_name\`);

-- 3. Complaint Status (7 total)
INSERT INTO \`ComplaintStatus\` (\`status_id\`, \`status_name\`) VALUES
(1, 'Pending'),
(2, 'Assigned'),
(3, 'In Progress'),
(4, 'Resolved'),
(5, 'Rejected'),
(6, 'Escalated'),
(7, 'Closed')
ON DUPLICATE KEY UPDATE \`status_name\` = VALUES(\`status_name\`);

-- 4. Official Domains
INSERT INTO \`official_domains\` (\`id\`, \`domain_name\`) VALUES
(1, 'gov.in'),
(2, 'nic.in'),
(3, 'karnataka.gov.in'),
(4, 'bbmp.gov.in'),
(5, 'bescom.org'),
(6, 'bwssb.gov.in'),
(7, 'bda.gov.in'),
(8, 'bmrc.co.in'),
(9, 'ksrtc.in'),
(10, 'ksp.gov.in')
ON DUPLICATE KEY UPDATE \`domain_name\` = VALUES(\`domain_name\`);
`;
  fs.writeFileSync(path.join(outputDir, 'seed_1_structure.sql'), sql1, 'utf8');

  // ----------------------------------------------------
  // FILE 2: WARDS (225 wards)
  // ----------------------------------------------------
  console.log("Generating SQL File 2 (Wards)...");
  let sql2 = `-- PublicEcho Large Seed File 2: 225 Bengaluru BBMP Wards
USE publicecho;

INSERT INTO \`Wards\` (\`ward_id\`, \`ward_name\`, \`zone_name\`, \`city\`) VALUES
`;
  const wardStrings = wards.map(w => 
    `(${w.wardId}, '${w.wardName.replace(/'/g, "''")}', '${w.zoneName.replace(/'/g, "''")}', 'Bengaluru')`
  );
  sql2 += wardStrings.join(',\n') + '\n';
  sql2 += "ON DUPLICATE KEY UPDATE `ward_name` = VALUES(`ward_name`), `zone_name` = VALUES(`zone_name`), `city` = VALUES(`city`);\n";
  fs.writeFileSync(path.join(outputDir, 'seed_2_wards.sql'), sql2, 'utf8');

  // Helper for escape quotes
  const escapeSqlStr = (str) => str.replace(/'/g, "''");

  // ----------------------------------------------------
  // FILE 3: USERS & OFFICIALS
  // ----------------------------------------------------
  console.log("Generating SQL File 3 (Users & Officials)...");
  let sql3 = `-- PublicEcho Large Seed File 3: Users (Citizens, Officials, Admins) and Official Profiles
USE publicecho;

-- Citizens (IDs 100 to 599)
INSERT INTO \`Users\` (\`user_id\`, \`name\`, \`email\`, \`password_hash\`, \`phone\`, \`role_id\`) VALUES
`;
  const usersList = [];
  const passwordHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // 'password123'
  
  // A. Generate 500 citizens
  for (let i = 100; i < 600; i++) {
    const fName = citizenFirstNames[Math.floor(Math.random() * citizenFirstNames.length)];
    const lName = citizenLastNames[Math.floor(Math.random() * citizenLastNames.length)];
    const name = `${fName} ${lName}`;
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}.${i}@gmail.com`;
    const phone = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
    usersList.push(`(${i}, '${escapeSqlStr(name)}', '${escapeSqlStr(email)}', '${passwordHash}', '${phone}', 1)`);
  }

  // B. Generate 50 officials (user IDs 600 to 649)
  const officialDomains = ['bbmp.gov.in', 'bwssb.gov.in', 'bescom.org', 'bda.gov.in', 'bmrc.co.in', 'ksp.gov.in'];
  for (let i = 600; i < 650; i++) {
    const fName = citizenFirstNames[Math.floor(Math.random() * citizenFirstNames.length)];
    const lName = citizenLastNames[Math.floor(Math.random() * citizenLastNames.length)];
    const name = `Officer ${fName} ${lName}`;
    const domain = officialDomains[i % officialDomains.length];
    const email = `officer.${fName.toLowerCase()}.${i}@${domain}`;
    const phone = `8${Math.floor(100000000 + Math.random() * 900000000)}`;
    usersList.push(`(${i}, '${escapeSqlStr(name)}', '${escapeSqlStr(email)}', '${passwordHash}', '${phone}', 2)`);
  }

  // C. Generate 5 admins (user IDs 700 to 704)
  const adminNames = ['Super Admin', 'Megharaj Maruthi', 'Assistant Admin', 'Portal Auditor', 'Lead Admin'];
  const adminEmails = ['superadmin@publicecho.com', 'admin2@publicecho.com', 'admin3@publicecho.com', 'auditor@publicecho.com', 'admin.lead@publicecho.com'];
  for (let i = 700; i < 705; i++) {
    const name = adminNames[i - 700];
    const email = adminEmails[i - 700];
    const phone = `7${Math.floor(100000000 + Math.random() * 900000000)}`;
    usersList.push(`(${i}, '${escapeSqlStr(name)}', '${escapeSqlStr(email)}', '${passwordHash}', '${phone}', 3)`);
  }

  sql3 += usersList.join(',\n') + '\n';
  sql3 += "ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `email` = VALUES(`email`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `role_id` = VALUES(`role_id`);\n\n";

  // D. Generate 50 Officials Profiles (IDs 100 to 149, linked to users 600 to 649)
  sql3 += "-- Officials Profiles\n";
  sql3 += "INSERT INTO \`Officials\` (\`official_id\`, \`user_id\`, \`department_id\`, \`ward_id\`, \`designation\`, \`office_address\`, \`status\`) VALUES\n";
  
  const officialsList = [];
  const officialsMetadata = []; // Keep local info to use in assigning complaints
  for (let i = 100; i < 150; i++) {
    const userId = i + 500; // 600 to 649
    const deptId = (i - 100) % 15; // 0 to 14 (distribute across 15 depts)
    // Distribute across wards. Let's make sure we hit different wards.
    const wardIndex = (i - 100) % wards.length;
    const ward = wards[wardIndex];
    const designation = officialDesignations[i % officialDesignations.length];
    const officeAddr = `BBMP Ward Office, ${ward.wardName} Ward (${ward.zoneName}), Bengaluru`;
    officialsList.push(`(${i}, ${userId}, ${deptId}, ${ward.wardId}, '${escapeSqlStr(designation)}', '${escapeSqlStr(officeAddr)}', 'Approved')`);
    officialsMetadata.push({ officialId: i, userId, deptId, wardId: ward.wardId, zoneName: ward.zoneName });
  }

  sql3 += officialsList.join(',\n') + '\n';
  sql3 += "ON DUPLICATE KEY UPDATE `user_id` = VALUES(`user_id`), `department_id` = VALUES(`department_id`), `ward_id` = VALUES(`ward_id`), `designation` = VALUES(`designation`), `office_address` = VALUES(`office_address`), `status` = VALUES(`status`);\n";
  fs.writeFileSync(path.join(outputDir, 'seed_3_users_officials.sql'), sql3, 'utf8');


  // ----------------------------------------------------
  // FILE 4: COMPLAINTS & ASSIGNMENTS
  // ----------------------------------------------------
  console.log("Generating SQL File 4 (Complaints & Assignments)...");

  // Complaint category details & templates to make them highly realistic
  const templates = {
    1: { // Pothole
      titles: ["Massive pothole near [Landmark]", "Dangerous deep potholes on [Street]", "Deceptive water-filled crater near [Landmark]"],
      desc: "A very large and deep pothole has formed on this section of the road. It has caused multiple two-wheelers to slip, especially during rain when it is filled with water. Needs urgent filling.",
      deptId: 1
    },
    2: { // Water Leakage
      titles: ["Major water pipe leakage on [Street]", "Drinking water wasting from cracked line near [Landmark]"],
      desc: "Clean drinking water is leaking in huge quantities from a cracked pipe joint on the main street. It has been flowing for over 24 hours, creating a mini-stream on the road.",
      deptId: 2
    },
    3: { // Garbage Overflow
      titles: ["Overflowing BBMP garbage bin near [Landmark]", "Unattended pile of waste on [Street]"],
      desc: "Commercial and residential garbage has not been cleared for several days. Dogs and cows are scattering it everywhere, causing a terrible stench and hygiene hazard.",
      deptId: 4
    },
    4: { // Streetlight Not Working
      titles: ["Entire block of streetlights out on [Street]", "Flickering streetlight near [Landmark] causing dark spot"],
      desc: "The streetlights on this road have been completely non-functional for the past 5 days. The road is pitch dark after 7 PM, making it extremely unsafe for pedestrians and residents.",
      deptId: 3
    },
    5: { // Road Damage
      titles: ["Completely damaged asphalt on [Street]", "Broken road surface near [Landmark] causing traffic jam"],
      desc: "The tar road here has completely eroded due to recent rain, exposing sharp stones and creating massive uneven patches. Vehicles have to slow down, causing heavy congestion.",
      deptId: 1
    },
    6: { // Water Supply Issue
      titles: ["No water supply for 4 days on [Street]", "Highly contaminated muddy water supply near [Landmark]"],
      desc: "Residents in this block are not receiving BWSSB municipal water supply for the past several days. When it does flow, it is muddy and smells bad. Requesting check of supply pressure and filters.",
      deptId: 2
    },
    7: { // Illegal Dumping
      titles: ["Illegal construction debris dumping near [Landmark]", "Night dumping of plastic waste on [Street]"],
      desc: "Unknown trucks are regularly dumping concrete blocks, sand, and commercial plastic waste on the vacant plot/roadside during night hours. Obstructing the footpath.",
      deptId: 4
    },
    8: { // Traffic Signal Failure
      titles: ["Traffic lights blinking amber near [Landmark]", "Complete signal failure at major junction on [Street]"],
      desc: "The traffic signals are completely dead, leading to chaotic conditions and minor accidents at the junction. No traffic police present. Urgent repair needed.",
      deptId: 9
    },
    9: { // Blocked Drain
      titles: ["Sewage overflowing from blocked drain near [Landmark]", "Choked storm water drain on [Street]"],
      desc: "The open drainage channel is completely clogged with silt and plastic bottles. Black sewage water is overflowing onto the road and entering ground floors of nearby shops.",
      deptId: 7
    },
    10: { // Flooding
      titles: ["Severe road flooding near [Landmark]", "Water entering houses on [Street] after light rain"],
      desc: "The storm water drains are completely blocked, leading to knee-deep water logging on the road after even short showers. Traffic is stalled and ground floors are flooded.",
      deptId: 7
    },
    11: { // Stray Dog Issue
      titles: ["Pack of aggressive stray dogs near [Landmark]", "Dog bite hazard on [Street] during night"],
      desc: "A pack of 8-10 stray dogs has become very aggressive in this area. They chase two-wheelers and bark at pedestrians, especially kids. Requesting BBMP vaccination/sterilization drive.",
      deptId: 10
    },
    12: { // Dead Animal Removal
      titles: ["Carcass of dog/cat lying unattended on [Street]", "Dead animal removal request near [Landmark]"],
      desc: "A dead stray animal is lying on the side of the road. It has started decomposing and is spreading a terrible smell. Needs to be removed by sanitation teams immediately.",
      deptId: 10
    },
    13: { // Tree Fall
      titles: ["Large tree branch blocked half of [Street]", "Fallen tree blocking footpath near [Landmark]"],
      desc: "A massive branch has snapped and fallen onto the road, blocking traffic and tearing down cable lines. Footpath is completely blocked. Needs cutting and removal.",
      deptId: 6
    },
    14: { // Overgrown Vegetation
      titles: ["Overgrown bushes blocking drivers view near [Landmark]", "Untrimmed branches touching power lines on [Street]"],
      desc: "The bushes and trees have grown out of control, blocking the visibility of oncoming traffic at the turn. Branches are also dangerously rubbing against overhead Bescom wires.",
      deptId: 6
    },
    15: { // Air Pollution
      titles: ["Illegal open burning of dry waste near [Landmark]", "Dense dust pollution due to construction on [Street]"],
      desc: "Tons of dry leaves and plastic sweepings are being set on fire in the open by sweepers/security guards, causing choking smoke in the residential neighborhood.",
      deptId: 11
    },
    16: { // Noise Pollution
      titles: ["Loudspeakers blasting post 10 PM near [Landmark]", "Commercial heavy machinery noise on [Street]"],
      desc: "A local venue/construction site is using high-decibel speaker systems/machinery late into the night, violating the 10 PM noise curfew rules. Disrupting sleep of kids and elders.",
      deptId: 11
    },
    17: { // Illegal Construction
      titles: ["Unauthorized building encroachment on [Street]", "Construction violating setbacks near [Landmark]"],
      desc: "A commercial building is being erected without leaving proper setbacks, encroaching onto the public footpath and road width. Requesting BBMP inspection of building approval plans.",
      deptId: 8
    },
    18: { // Broken Footpath
      titles: ["Broken/missing concrete footpath slabs near [Landmark]", "Damaged pedestrian walkway on [Street]"],
      desc: "The concrete slabs covering the drain are broken, leaving open gaps. Pedestrians, especially elderly people, have fallen in. Extremely dangerous to walk at night.",
      deptId: 1
    },
    19: { // Public Toilet Issue
      titles: ["Extremely dirty/clogged public toilet near [Landmark]", "No water/electricity in public toilet on [Street]"],
      desc: "The public e-toilet/toilet complex is in a terrible state. Flush is broken, water is unavailable, and there is no maintenance, making it unusable and an eyesore.",
      deptId: 12
    },
    20: { // Property Tax Issue
      titles: ["System showing incorrect property tax dues for block", "Double payment error in property tax portal"],
      desc: "The online BBMP tax portal displays wrong calculations for residential properties in our block. We are unable to pay the correct self-assessment amount online.",
      deptId: 13
    }
  };

  const streets = ["Outer Ring Road", "100 Feet Road", "80 Feet Road", "Bannerghatta Road", "Kanakapura Road", "Sarjapur Road", "Old Airport Road", "Marathahalli Bridge Road", "Hosur Road", "Whitefield Main Road", "Residency Road", "MG Road", "HAL 3rd Stage Main", "Malleshwaram 15th Cross", "Jayanagar 4th Block Ring Road", "HSR 27th Main", "Koramangala 80 Feet Road"];
  const landmarks = ["near Shell petrol bunk", "opposite Metro station", "near Govt Kannada School", "next to central park entrance", "adjacent to temple arch", "near main traffic junction", "opposite central shopping mall", "near flyover ramp", "close to post office"];

  const resolvedComplaints = []; // To assign feedback ratings
  const assignedComplaints = []; // To assign officials

  let sql4 = `-- PublicEcho Large Seed File 4: 1,000 Complaints & assignments
USE publicecho;

INSERT INTO \`Complaints\` (\`complaint_id\`, \`user_id\`, \`category_id\`, \`status_id\`, \`ward_id\`, \`title\`, \`description\`, \`latitude\`, \`longitude\`, \`address\`, \`created_at\`, \`updated_at\`) VALUES
`;

  const complaintsList = [];
  const assignmentsList = [];

  // Generate 1000 complaints (IDs 100 to 1099)
  // Distribution targets:
  // - 500 Resolved (ID 4) -> 50% (to support 500 feedback ratings)
  // - 250 Pending (ID 1) -> 25%
  // - 100 Assigned (ID 2) -> 10%
  // - 100 In Progress (ID 3) -> 10%
  // - 50 Rejected (ID 5) -> 5%
  
  let statusQueue = [];
  for (let i = 0; i < 500; i++) statusQueue.push(4); // Resolved
  for (let i = 0; i < 250; i++) statusQueue.push(1); // Pending
  for (let i = 0; i < 100; i++) statusQueue.push(2); // Assigned
  for (let i = 0; i < 100; i++) statusQueue.push(3); // In Progress
  for (let i = 0; i < 50;  i++) statusQueue.push(5); // Rejected

  // Shuffle statusQueue slightly but keep exact counts
  statusQueue.sort(() => Math.random() - 0.5);

  let assignmentIdCounter = 100;

  for (let i = 100; i < 1100; i++) {
    const complaintId = i;
    const statusId = statusQueue[i - 100];
    
    // Complainant (100 to 599)
    const complainantUserId = 100 + Math.floor(Math.random() * 500);
    
    // Distribute complaints so every ward has at least 3 complaints, then remaining random.
    let ward;
    if (i - 100 < wards.length * 3) {
      // 0 to 674: distribute exactly 3 to each ward
      ward = wards[(i - 100) % wards.length];
    } else {
      // 675 to 999: random wards
      ward = wards[Math.floor(Math.random() * wards.length)];
    }

    // Category (1 to 20)
    const categoryId = 1 + Math.floor(Math.random() * 20);
    const categoryDetails = templates[categoryId];
    
    // Choose title and customize
    const titleTemplate = categoryDetails.titles[Math.floor(Math.random() * categoryDetails.titles.length)];
    const street = streets[Math.floor(Math.random() * streets.length)];
    const landmark = landmarks[Math.floor(Math.random() * landmarks.length)];
    const title = titleTemplate.replace("[Street]", street).replace("[Landmark]", landmark);
    const description = categoryDetails.desc;
    const address = `${street}, ${landmark}, ${ward.wardName} Ward, Bengaluru`;

    // Coordinates: Center of zone + small offset
    const center = zoneCenters[ward.zoneName] || { lat: 12.9716, lng: 77.5946 };
    const latOffset = (Math.random() - 0.5) * 0.012; // spread inside ward
    const lngOffset = (Math.random() - 0.5) * 0.012;
    const lat = (center.lat + latOffset).toFixed(7);
    const lng = (center.lng + lngOffset).toFixed(7);

    // Timestamps: Created in the last 12 months (365 days)
    const createdDaysAgo = Math.floor(Math.random() * 365);
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - createdDaysAgo);
    createdDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
    
    const formattedCreatedStr = createdDate.toISOString().slice(0, 19).replace('T', ' ');

    let formattedUpdatedStr = formattedCreatedStr;
    if (statusId !== 1) { // not Pending
      // Updated some days after created
      const updatedDaysAfter = Math.floor(Math.random() * Math.min(15, createdDaysAgo));
      const updatedDate = new Date(createdDate.getTime());
      updatedDate.setDate(updatedDate.getDate() + updatedDaysAfter);
      updatedDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
      formattedUpdatedStr = updatedDate.toISOString().slice(0, 19).replace('T', ' ');
    }

    // Store complaint
    complaintsList.push(`(${complaintId}, ${complainantUserId}, ${categoryId}, ${statusId}, ${ward.wardId}, '${escapeSqlStr(title)}', '${escapeSqlStr(description)}', ${lat}, ${lng}, '${escapeSqlStr(address)}', '${formattedCreatedStr}', '${formattedUpdatedStr}')`);

    // Assign officials if status is Assigned (2), In Progress (3), or Resolved (4)
    if (statusId === 2 || statusId === 3 || statusId === 4) {
      // Find matching official (same department and ward, or same ward, or same zone, or random)
      const matches = officialsMetadata.filter(o => o.deptId === categoryDetails.deptId && o.wardId === ward.wardId);
      const wardMatches = officialsMetadata.filter(o => o.wardId === ward.wardId);
      const zoneMatches = officialsMetadata.filter(o => o.zoneName === ward.zoneName && o.deptId === categoryDetails.deptId);
      
      let assignedOfficial;
      if (matches.length > 0) {
        assignedOfficial = matches[0];
      } else if (wardMatches.length > 0) {
        assignedOfficial = wardMatches[Math.floor(Math.random() * wardMatches.length)];
      } else if (zoneMatches.length > 0) {
        assignedOfficial = zoneMatches[Math.floor(Math.random() * zoneMatches.length)];
      } else {
        assignedOfficial = officialsMetadata[Math.floor(Math.random() * officialsMetadata.length)];
      }

      // Generate realistic assignment date: slightly after complaint created
      const assignedDate = new Date(createdDate.getTime() + (Math.floor(Math.random() * 12) + 1) * 3600000);
      const formattedAssignedStr = assignedDate.toISOString().slice(0, 19).replace('T', ' ');
      
      let resolvedDateStr = 'NULL';
      if (statusId === 4) { // Resolved
        // Resolve date is slightly before updated date
        resolvedDateStr = `'${formattedUpdatedStr}'`;
        resolvedComplaints.push({ complaintId, officialId: assignedOfficial.officialId, resolvedAt: formattedUpdatedStr });
      }

      assignmentsList.push(`(${assignmentIdCounter++}, ${complaintId}, ${assignedOfficial.officialId}, '${formattedAssignedStr}', ${resolvedDateStr})`);
      assignedComplaints.push({ complaintId, statusId, createdDate, updatedDate: new Date(formattedUpdatedStr) });
    }
  }

  sql4 += complaintsList.join(',\n') + '\n';
  sql4 += "ON DUPLICATE KEY UPDATE `user_id` = VALUES(`user_id`), `category_id` = VALUES(`category_id`), `status_id` = VALUES(`status_id`), `ward_id` = VALUES(`ward_id`), `title` = VALUES(`title`), `description` = VALUES(`description`), `latitude` = VALUES(`latitude`), `longitude` = VALUES(`longitude`), `address` = VALUES(`address`), `created_at` = VALUES(`created_at`), `updated_at` = VALUES(`updated_at`);\n\n";

  sql4 += "-- Assignments (for Assigned/In_Progress/Resolved complaints)\n";
  sql4 += "INSERT INTO \`ComplaintAssignments\` (\`assignment_id\`, \`complaint_id\`, \`official_id\`, \`assigned_at\`, \`resolved_at\`) VALUES\n";
  sql4 += assignmentsList.join(',\n') + '\n';
  sql4 += "ON DUPLICATE KEY UPDATE `complaint_id` = VALUES(`complaint_id`), `official_id` = VALUES(`official_id`), `assigned_at` = VALUES(`assigned_at`), `resolved_at` = VALUES(`resolved_at`);\n";
  
  fs.writeFileSync(path.join(outputDir, 'seed_4_complaints.sql'), sql4, 'utf8');


  // ----------------------------------------------------
  // FILE 5: UPDATES, NOTIFICATIONS, UPVOTES, RATINGS
  // ----------------------------------------------------
  console.log("Generating SQL File 5 (Updates, Notifications, Upvotes, Feedback)...");
  let sql5 = `-- PublicEcho Large Seed File 5: Updates, Notifications, Upvotes, and Feedback Ratings
USE publicecho;

-- Clean up previously seeded records for File 5 to prevent duplicate key conflicts during regeneration
DELETE FROM \`ComplaintUpvotes\` WHERE \`upvote_id\` >= 100;
DELETE FROM \`ComplaintUpdates\` WHERE \`update_id\` >= 100;
DELETE FROM \`Notifications\` WHERE \`notification_id\` >= 100;
DELETE FROM \`feedback_ratings\` WHERE \`rating_id\` >= 100;
`;

  // A. Generate 2,000 updates (linked to complaints)
  // We can add 2 updates to each Assigned, In Progress, and Resolved complaint, plus some to Pending/Rejected
  const updatesList = [];
  const updateMessages = {
    2: ["Complaint accepted by ward responder. Work order initiated.", "Inspection scheduled by field team.", "Assigned to the local assistant engineer."],
    3: ["Team dispatched to site.", "Materials procured and loaded.", "Work in progress. Area barricaded for safety.", "Repair team currently addressing the leakage/damage."],
    4: ["Repair completed. Clean-up in progress.", "Final inspection finished. Resolution uploaded.", "Issue resolved. Awaiting citizen rating feedback."],
    5: ["Complaint rejected: Duplicate entry reported in proximity.", "Rejected: Address falls outside BBMP corporate municipal limits.", "Closed: Invalid photo uploaded. Please re-file with clear image."]
  };

  let updateIdCounter = 100;
  for (const c of assignedComplaints) {
    // 1st update (Assigned stage)
    const update1Date = new Date(c.createdDate.getTime() + 2 * 3600000); // 2 hours after creation
    const fUpdate1Str = update1Date.toISOString().slice(0, 19).replace('T', ' ');
    const msg1 = updateMessages[2][updateIdCounter % updateMessages[2].length];
    updatesList.push(`(${updateIdCounter++}, ${c.complaintId}, '${escapeSqlStr(msg1)}', '${fUpdate1Str}')`);

    // 2nd update (In Progress stage)
    if (c.statusId === 3 || c.statusId === 4) {
      const update2Date = new Date(c.createdDate.getTime() + 12 * 3600000); // 12 hours after creation
      const fUpdate2Str = update2Date.toISOString().slice(0, 19).replace('T', ' ');
      const msg2 = updateMessages[3][updateIdCounter % updateMessages[3].length];
      updatesList.push(`(${updateIdCounter++}, ${c.complaintId}, '${escapeSqlStr(msg2)}', '${fUpdate2Str}')`);
    }

    // 3rd update (Resolved stage)
    if (c.statusId === 4) {
      const update3Date = c.updatedDate;
      const fUpdate3Str = update3Date.toISOString().slice(0, 19).replace('T', ' ');
      const msg3 = updateMessages[4][updateIdCounter % updateMessages[4].length];
      updatesList.push(`(${updateIdCounter++}, ${c.complaintId}, '${escapeSqlStr(msg3)}', '${fUpdate3Str}')`);
    }

    // 4th update (Rejected stage)
    if (c.statusId === 5) {
      const update4Date = c.updatedDate;
      const fUpdate4Str = update4Date.toISOString().slice(0, 19).replace('T', ' ');
      const msg4 = updateMessages[5][updateIdCounter % updateMessages[5].length];
      updatesList.push(`(${updateIdCounter++}, ${c.complaintId}, '${escapeSqlStr(msg4)}', '${fUpdate4Str}')`);
    }
  }

  // If we need exactly 2000 updates, fill in the rest for random complaints
  while (updatesList.length < 2000) {
    const compId = 100 + Math.floor(Math.random() * 1000);
    const msg = "Periodic status update: Operations team monitoring the site area.";
    const randomDaysAgo = Math.floor(Math.random() * 20);
    const date = new Date();
    date.setDate(date.getDate() - randomDaysAgo);
    const dateStr = date.toISOString().slice(0, 19).replace('T', ' ');
    updatesList.push(`(${updateIdCounter++}, ${compId}, '${escapeSqlStr(msg)}', '${dateStr}')`);
  }

  sql5 += "\n-- Complaint Timeline Updates\n";
  sql5 += "INSERT INTO \`ComplaintUpdates\` (\`update_id\`, \`complaint_id\`, \`update_message\`, \`created_at\`) VALUES\n";
  sql5 += updatesList.slice(0, 2000).join(',\n') + '\n';
  sql5 += "ON DUPLICATE KEY UPDATE `complaint_id` = VALUES(`complaint_id`), `update_message` = VALUES(`update_message`), `created_at` = VALUES(`created_at`);\n\n";


  // B. Generate 5,000 notifications
  const notificationsList = [];
  const notificationMessages = [
    "Your complaint has been successfully filed in the system.",
    "A ward responder has been assigned to address your grievance.",
    "Repair teams are currently working at the site.",
    "Civic action completed! Your complaint has been marked Resolved.",
    "Grievance rejected. See timeline notes for explanation.",
    "Your complaint has received 10 upvotes from nearby citizens.",
    "Escalation warning: SLA target was breached, ticket priority elevated."
  ];

  let notificationIdCounter = 100;
  for (let i = 0; i < 5000; i++) {
    const userId = 100 + Math.floor(Math.random() * 500); // 100 to 599 (citizens)
    const compId = 100 + Math.floor(Math.random() * 1000); // 100 to 1099
    const msg = notificationMessages[i % notificationMessages.length];
    const isRead = Math.random() > 0.4 ? 1 : 0;
    
    const randomDaysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - randomDaysAgo);
    const dateStr = date.toISOString().slice(0, 19).replace('T', ' ');

    notificationsList.push(`(${notificationIdCounter++}, ${userId}, ${compId}, '${escapeSqlStr(msg)}', ${isRead}, '${dateStr}')`);
  }

  sql5 += "-- Notifications\n";
  sql5 += "INSERT INTO \`Notifications\` (\`notification_id\`, \`user_id\`, \`complaint_id\`, \`message\`, \`is_read\`, \`sent_at\`) VALUES\n";
  sql5 += notificationsList.join(',\n') + '\n';
  sql5 += "ON DUPLICATE KEY UPDATE `user_id` = VALUES(`user_id`), `complaint_id` = VALUES(`complaint_id`), `message` = VALUES(`message`), `is_read` = VALUES(`is_read`), `sent_at` = VALUES(`sent_at`);\n\n";


  // C. Generate 20-30 upvotes per complaint for ALL 1000 complaints (approx 25,000 upvotes)
  // Must avoid duplicate user-complaint pairings.
  const upvotesList = [];
  const seenUpvotePairs = new Set();
  let upvoteIdCounter = 100;

  console.log("Generating 20-30 upvotes for every single complaint...");
  // Loop through all complaints (100 to 1099)
  for (let compId = 100; compId < 1100; compId++) {
    const upvoteCount = 20 + Math.floor(Math.random() * 11); // 20 to 30 upvotes per complaint
    for (let u = 0; u < upvoteCount; u++) {
      let userId = 100 + Math.floor(Math.random() * 500); // 100 to 599 (citizens)
      let pair = `${compId}-${userId}`;
      let retries = 0;
      
      while (seenUpvotePairs.has(pair) && retries < 15) {
        userId = 100 + Math.floor(Math.random() * 500);
        pair = `${compId}-${userId}`;
        retries++;
      }

      if (!seenUpvotePairs.has(pair)) {
        seenUpvotePairs.add(pair);
        
        // Random upvote timestamp in the last 15 days
        const randomDaysAgo = Math.floor(Math.random() * 15);
        const date = new Date();
        date.setDate(date.getDate() - randomDaysAgo);
        const dateStr = date.toISOString().slice(0, 19).replace('T', ' ');

        upvotesList.push(`(${upvoteIdCounter++}, ${compId}, ${userId}, '${dateStr}')`);
      }
    }
  }

  sql5 += "-- Upvotes\n";
  // Chunk inserting to prevent huge multi-value packets
  const chunkSize = 1000;
  for (let idx = 0; idx < upvotesList.length; idx += chunkSize) {
    const chunk = upvotesList.slice(idx, idx + chunkSize);
    sql5 += "INSERT INTO \`ComplaintUpvotes\` (\`upvote_id\`, \`complaint_id\`, \`user_id\`, \`created_at\`) VALUES\n";
    sql5 += chunk.join(',\n') + '\n';
    sql5 += "ON DUPLICATE KEY UPDATE `complaint_id` = VALUES(`complaint_id`), `user_id` = VALUES(`user_id`), `created_at` = VALUES(`created_at`);\n\n";
  }


  // D. Generate 500 feedback entries (feedback_ratings table) for resolved complaints
  // Since we have 500 resolved complaints in resolvedComplaints list, we map 1 rating to each resolved complaint
  const feedbackList = [];
  const feedbackComments = [
    "Issue resolved quickly. Highly satisfied.",
    "Officer was extremely responsive and kept me updated.",
    "Good quality repair work on the asphalt slabs.",
    "Delay in response but the issue was eventually fixed well.",
    "Thank you BBMP team! Great speed and quality.",
    "Satisfactory resolution. Glad the water leakage is stopped.",
    "Excellent communication from the ward supervisor.",
    "The garbage clearing team was very polite and thorough."
  ];

  let ratingIdCounter = 100;
  for (let i = 0; i < 500; i++) {
    const item = resolvedComplaints[i];
    if (!item) break; // Safeguard if list is smaller
    
    const rSpeed = 3 + Math.floor(Math.random() * 3); // 3, 4, or 5
    const rQuality = 3 + Math.floor(Math.random() * 3);
    const rComm = 3 + Math.floor(Math.random() * 3);
    const comment = feedbackComments[i % feedbackComments.length];

    feedbackList.push(`(${ratingIdCounter++}, ${item.complaintId}, ${item.officialId}, ${rSpeed}, ${rQuality}, ${rComm}, '${escapeSqlStr(comment)}', '${item.resolvedAt}')`);
  }

  sql5 += "-- Feedback Ratings\n";
  sql5 += "INSERT INTO \`feedback_ratings\` (\`rating_id\`, \`complaint_id\`, \`official_id\`, \`rating_speed\`, \`rating_quality\`, \`rating_communication\`, \`comment\`, \`created_at\`) VALUES\n";
  sql5 += feedbackList.join(',\n') + '\n';
  sql5 += "ON DUPLICATE KEY UPDATE `complaint_id` = VALUES(`complaint_id`), `official_id` = VALUES(`official_id`), `rating_speed` = VALUES(`rating_speed`), `rating_quality` = VALUES(`rating_quality`), `rating_communication` = VALUES(`rating_communication`), `comment` = VALUES(`comment`), `created_at` = VALUES(`created_at`);\n";

  fs.writeFileSync(path.join(outputDir, 'seed_5_upvotes.sql'), sql5, 'utf8');

  console.log("✅ All 5 SQL seed files built successfully!");
}

buildSeeds();
