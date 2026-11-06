import bcrypt from "bcryptjs";
import { prisma } from "../src/config/prisma.js";
import type {
  RoomType,
  TenantType,
  ListingStatus,
} from "../src/generated/prisma/client.js";

const PASSWORD = "Password@123";
const passwordHash = bcrypt.hashSync(PASSWORD, 10);

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function seedUsers() {
  const users = [
    { id: "user-admin", name: "Admin", phone: "01700000000", role: "ADMIN" },
    {
      id: "user-landlord-1",
      name: "Rahim Uddin",
      phone: "01711000001",
      role: "LANDLORD",
    },
    {
      id: "user-landlord-2",
      name: "Karim Hossain",
      phone: "01711000002",
      role: "LANDLORD",
    },
    {
      id: "user-landlord-3",
      name: "Salma Begum",
      phone: "01711000003",
      role: "LANDLORD",
    },
    {
      id: "user-renter-1",
      name: "Tanvir Ahmed",
      phone: "01722000001",
      role: "RENTER",
    },
    {
      id: "user-renter-2",
      name: "Nusrat Jahan",
      phone: "01722000002",
      role: "RENTER",
    },
    {
      id: "user-renter-3",
      name: "Fahim Chowdhury",
      phone: "01722000003",
      role: "RENTER",
    },
    {
      id: "user-renter-4",
      name: "Ayesha Siddika",
      phone: "01722000004",
      role: "RENTER",
    },
    {
      id: "user-renter-5",
      name: "Imran Hasan",
      phone: "01722000005",
      role: "RENTER",
    },
  ] as const;

  for (const u of users) {
    await prisma.user.upsert({
      where: { phone: u.phone },
      update: {},
      create: { ...u, passwordHash, isPhoneVerified: true },
    });
  }
}

async function seedVerifications() {
  await prisma.verification.upsert({
    where: { id: "verif-1" },
    update: {},
    create: {
      id: "verif-1",
      userId: "user-landlord-1",
      nidImageUrl: "private/nid-sample-1.jpg",
      selfieUrl: "private/selfie-sample-1.jpg",
      status: "APPROVED",
      reviewedById: "user-admin",
    },
  });

  await prisma.verification.upsert({
    where: { id: "verif-2" },
    update: {},
    create: {
      id: "verif-2",
      userId: "user-landlord-2",
      nidImageUrl: "private/nid-sample-2.jpg",
      selfieUrl: "private/selfie-sample-2.jpg",
      status: "PENDING",
    },
  });

  await prisma.verification.upsert({
    where: { id: "verif-3" },
    update: {},
    create: {
      id: "verif-3",
      userId: "user-landlord-3",
      nidImageUrl: "private/nid-sample-3.jpg",
      selfieUrl: "private/selfie-sample-3.jpg",
      status: "REJECTED",
      rejectReason: "NID photo is blurry",
      reviewedById: "user-admin",
    },
  });
}

async function seedAreas() {
  const areas = [
    { id: "area-ctg", name: "Chattogram", nameBn: "চট্টগ্রাম", parentId: null },
    {
      id: "area-agrabad",
      name: "Agrabad",
      nameBn: "আগ্রাবাদ",
      parentId: "area-ctg",
    },
    {
      id: "area-khulshi",
      name: "Khulshi",
      nameBn: "খুলশী",
      parentId: "area-ctg",
    },
    {
      id: "area-gec",
      name: "GEC Circle",
      nameBn: "জিইসি মোড়",
      parentId: "area-ctg",
    },
    {
      id: "area-halishahar",
      name: "Halishahar",
      nameBn: "হালিশহর",
      parentId: "area-ctg",
    },
    {
      id: "area-hathazari",
      name: "Hathazari",
      nameBn: "হাটহাজারী",
      parentId: "area-ctg",
    },
    {
      id: "area-bayezid",
      name: "Bayezid",
      nameBn: "বায়েজিদ",
      parentId: "area-ctg",
    },
    // blocks
    {
      id: "area-halishahar-a",
      name: "Halishahar Block A",
      nameBn: "হালিশহর ব্লক এ",
      parentId: "area-halishahar",
    },
    {
      id: "area-halishahar-b",
      name: "Halishahar Block B",
      nameBn: "হালিশহর ব্লক বি",
      parentId: "area-halishahar",
    },
    {
      id: "area-khulshi-1",
      name: "Khulshi Road 1",
      nameBn: "খুলশী রোড ১",
      parentId: "area-khulshi",
    },
    {
      id: "area-agrabad-ca",
      name: "Agrabad C/A",
      nameBn: "আগ্রাবাদ বাণিজ্যিক এলাকা",
      parentId: "area-agrabad",
    },
  ];

  for (const a of areas) {
    await prisma.area.upsert({ where: { id: a.id }, update: {}, create: a });
  }
}

async function seedLandmarks() {
  const landmarks = [
    {
      id: "lm-cu-gate",
      name: "CU Main Gate",
      nameBn: "চবি প্রধান ফটক",
      areaId: "area-hathazari",
    },
    {
      id: "lm-hospital",
      name: "Chattogram Medical College Hospital",
      nameBn: "চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল",
      areaId: "area-gec",
    },
    {
      id: "lm-agrabad-market",
      name: "Agrabad Commercial Area",
      nameBn: "আগ্রাবাদ বাণিজ্যিক এলাকা",
      areaId: "area-agrabad",
    },
    {
      id: "lm-khulshi-market",
      name: "Khulshi Market",
      nameBn: "খুলশী মার্কেট",
      areaId: "area-khulshi",
    },
    {
      id: "lm-halishahar-bazar",
      name: "Halishahar Bazar",
      nameBn: "হালিশহর বাজার",
      areaId: "area-halishahar",
    },
    {
      id: "lm-bayezid-stand",
      name: "Bayezid Bus Stand",
      nameBn: "বায়েজিদ বাস স্ট্যান্ড",
      areaId: "area-bayezid",
    },
    {
      id: "lm-port-gate",
      name: "Port Authority Gate",
      nameBn: "বন্দর গেট",
      areaId: "area-agrabad",
    },
    {
      id: "lm-gec-circle",
      name: "GEC Circle Roundabout",
      nameBn: "জিইসি সার্কেল",
      areaId: "area-gec",
    },
  ];

  for (const l of landmarks) {
    await prisma.landmark.upsert({
      where: { id: l.id },
      update: {},
      create: l,
    });
  }
}

type SeedListing = {
  id: string;
  landlordId: string;
  title: string;
  rent: number;
  advance: number;
  roomType: RoomType;
  acceptedTenants: TenantType[];
  furnished: boolean;
  areaId: string;
  landmarkId: string | null;
  status: ListingStatus;
  daysLeft: number; 
};

const L1 = "user-landlord-1";
const L2 = "user-landlord-2";
const L3 = "user-landlord-3";

const listings: SeedListing[] = [
  {
    id: "listing-1",
    landlordId: L1,
    title: "2 bed flat near CU gate",
    rent: 12000,
    advance: 24000,
    roomType: "WHOLE_FLAT",
    acceptedTenants: ["FAMILY"],
    furnished: false,
    areaId: "area-hathazari",
    landmarkId: "lm-cu-gate",
    status: "ACTIVE",
    daysLeft: 9,
  },
  {
    id: "listing-2",
    landlordId: L1,
    title: "Seat in student mess near CU",
    rent: 2500,
    advance: 2500,
    roomType: "SEAT_SUBLET",
    acceptedTenants: ["STUDENT", "MALE_ONLY"],
    furnished: true,
    areaId: "area-hathazari",
    landmarkId: "lm-cu-gate",
    status: "ACTIVE",
    daysLeft: 12,
  },
  {
    id: "listing-3",
    landlordId: L1,
    title: "Single room, bachelor friendly",
    rent: 5500,
    advance: 11000,
    roomType: "SINGLE_ROOM",
    acceptedTenants: ["BACHELOR", "WORKING_PROFESSIONAL"],
    furnished: false,
    areaId: "area-halishahar-a",
    landmarkId: null,
    status: "ACTIVE",
    daysLeft: 2,
  },
  {
    id: "listing-4",
    landlordId: L1,
    title: "Female mess seat in Khulshi",
    rent: 3500,
    advance: 3500,
    roomType: "SEAT_SUBLET",
    acceptedTenants: ["FEMALE_ONLY", "STUDENT"],
    furnished: true,
    areaId: "area-khulshi",
    landmarkId: "lm-khulshi-market",
    status: "ACTIVE",
    daysLeft: 7,
  },
  {
    id: "listing-5",
    landlordId: L1,
    title: "3 bed family flat",
    rent: 18000,
    advance: 36000,
    roomType: "WHOLE_FLAT",
    acceptedTenants: ["FAMILY"],
    furnished: false,
    areaId: "area-khulshi-1",
    landmarkId: null,
    status: "ACTIVE",
    daysLeft: 11,
  },
  {
    id: "listing-6",
    landlordId: L1,
    title: "Shared flat, 2 beds available",
    rent: 4000,
    advance: 8000,
    roomType: "SHARED",
    acceptedTenants: ["BACHELOR", "MALE_ONLY"],
    furnished: false,
    areaId: "area-gec",
    landmarkId: "lm-hospital",
    status: "ACTIVE",
    daysLeft: 1,
  },
  {
    id: "listing-7",
    landlordId: L1,
    title: "Furnished room near Agrabad",
    rent: 8000,
    advance: 16000,
    roomType: "SINGLE_ROOM",
    acceptedTenants: ["WORKING_PROFESSIONAL"],
    furnished: true,
    areaId: "area-agrabad-ca",
    landmarkId: "lm-agrabad-market",
    status: "ACTIVE",
    daysLeft: 5,
  },
  {
    id: "listing-8",
    landlordId: L1,
    title: "1 bed flat near Bayezid",
    rent: 9500,
    advance: 19000,
    roomType: "WHOLE_FLAT",
    acceptedTenants: ["FAMILY", "WORKING_PROFESSIONAL"],
    furnished: false,
    areaId: "area-bayezid",
    landmarkId: "lm-bayezid-stand",
    status: "ACTIVE",
    daysLeft: 3,
  },
  {
    id: "listing-9",
    landlordId: L1,
    title: "Room for any tenant",
    rent: 6000,
    advance: 12000,
    roomType: "SINGLE_ROOM",
    acceptedTenants: ["ANY"],
    furnished: false,
    areaId: "area-halishahar-b",
    landmarkId: "lm-halishahar-bazar",
    status: "ACTIVE",
    daysLeft: 13,
  },
  {
    id: "listing-10",
    landlordId: L1,
    title: "Studio room near port",
    rent: 7000,
    advance: 14000,
    roomType: "SINGLE_ROOM",
    acceptedTenants: ["BACHELOR"],
    furnished: false,
    areaId: "area-agrabad",
    landmarkId: "lm-port-gate",
    status: "RENTED",
    daysLeft: 6,
  },
  {
    id: "listing-11",
    landlordId: L1,
    title: "2 bed flat, GEC area",
    rent: 14000,
    advance: 28000,
    roomType: "WHOLE_FLAT",
    acceptedTenants: ["FAMILY"],
    furnished: false,
    areaId: "area-gec",
    landmarkId: "lm-gec-circle",
    status: "RENTED",
    daysLeft: 4,
  },
  {
    id: "listing-12",
    landlordId: L1,
    title: "Student seat, Hathazari",
    rent: 2000,
    advance: 2000,
    roomType: "SEAT_SUBLET",
    acceptedTenants: ["STUDENT"],
    furnished: false,
    areaId: "area-hathazari",
    landmarkId: null,
    status: "EXPIRED",
    daysLeft: -2,
  },
  {
    id: "listing-13",
    landlordId: L1,
    title: "Flat in Halishahar",
    rent: 10000,
    advance: 20000,
    roomType: "WHOLE_FLAT",
    acceptedTenants: ["FAMILY", "BACHELOR"],
    furnished: false,
    areaId: "area-halishahar",
    landmarkId: null,
    status: "EXPIRED",
    daysLeft: -5,
  },
  {
    id: "listing-14",
    landlordId: L2,
    title: "Room near Khulshi market",
    rent: 6500,
    advance: 13000,
    roomType: "SINGLE_ROOM",
    acceptedTenants: ["BACHELOR", "STUDENT"],
    furnished: false,
    areaId: "area-khulshi",
    landmarkId: "lm-khulshi-market",
    status: "PENDING",
    daysLeft: 14,
  },
  {
    id: "listing-15",
    landlordId: L2,
    title: "Shared flat in Bayezid",
    rent: 3800,
    advance: 7600,
    roomType: "SHARED",
    acceptedTenants: ["MALE_ONLY", "WORKING_PROFESSIONAL"],
    furnished: true,
    areaId: "area-bayezid",
    landmarkId: null,
    status: "PENDING",
    daysLeft: 14,
  },
  {
    id: "listing-16",
    landlordId: L2,
    title: "2 bed flat, Agrabad",
    rent: 15000,
    advance: 30000,
    roomType: "WHOLE_FLAT",
    acceptedTenants: ["FAMILY"],
    furnished: false,
    areaId: "area-agrabad",
    landmarkId: "lm-agrabad-market",
    status: "PENDING",
    daysLeft: 14,
  },
  {
    id: "listing-17",
    landlordId: L3,
    title: "Cheap room, contact me",
    rent: 3000,
    advance: 6000,
    roomType: "SINGLE_ROOM",
    acceptedTenants: ["ANY"],
    furnished: false,
    areaId: "area-gec",
    landmarkId: null,
    status: "HIDDEN",
    daysLeft: 8,
  },
  {
    id: "listing-18",
    landlordId: L3,
    title: "Flat near hospital",
    rent: 11000,
    advance: 22000,
    roomType: "WHOLE_FLAT",
    acceptedTenants: ["FAMILY"],
    furnished: false,
    areaId: "area-gec",
    landmarkId: "lm-hospital",
    status: "PENDING",
    daysLeft: 14,
  },
  {
    id: "listing-19",
    landlordId: L1,
    title: "Bachelor room, Halishahar Block A",
    rent: 4500,
    advance: 9000,
    roomType: "SINGLE_ROOM",
    acceptedTenants: ["BACHELOR"],
    furnished: false,
    areaId: "area-halishahar-a",
    landmarkId: "lm-halishahar-bazar",
    status: "ACTIVE",
    daysLeft: 10,
  },
  {
    id: "listing-20",
    landlordId: L1,
    title: "Female sublet, GEC Circle",
    rent: 4200,
    advance: 4200,
    roomType: "SEAT_SUBLET",
    acceptedTenants: ["FEMALE_ONLY", "WORKING_PROFESSIONAL"],
    furnished: true,
    areaId: "area-gec",
    landmarkId: "lm-gec-circle",
    status: "ACTIVE",
    daysLeft: 6,
  },
];

async function seedListings() {
  for (const item of listings) {
    const { daysLeft, ...data } = item;

    await prisma.listing.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...data,
        description: `${item.title}. Gas and water available. Contact the owner for visiting hours.`,
        address: `House ${Math.floor(Math.random() * 90) + 10}, Road ${Math.floor(Math.random() * 9) + 1}, Chattogram`,
        availableFrom: daysFromNow(3),
        expiresAt: daysFromNow(daysLeft),
        lastConfirmedAt: daysFromNow(daysLeft - 14),
      },
    });
  }
}

async function seedInquiries() {
  const inquiries = [
    {
      id: "inq-1",
      listingId: "listing-1",
      renterId: "user-renter-1",
      message: "Is the flat still available? Can I visit this Friday?",
    },
    {
      id: "inq-2",
      listingId: "listing-3",
      renterId: "user-renter-2",
      message: "I am a working professional. Is the advance negotiable?",
    },
    {
      id: "inq-3",
      listingId: "listing-4",
      renterId: "user-renter-4",
      message: "Is the mess female-only and is there a curfew?",
    },
    {
      id: "inq-4",
      listingId: "listing-2",
      renterId: "user-renter-3",
      message: "Is there a seat free from next month?",
    },
  ];

  for (const i of inquiries) {
    await prisma.inquiry.upsert({ where: { id: i.id }, update: {}, create: i });
  }
}

async function seedSavedListings() {
  const saved = [
    { userId: "user-renter-1", listingId: "listing-1" },
    { userId: "user-renter-1", listingId: "listing-5" },
    { userId: "user-renter-2", listingId: "listing-3" },
    { userId: "user-renter-4", listingId: "listing-4" },
  ];

  for (const s of saved) {
    await prisma.savedListing.upsert({
      where: { userId_listingId: s },
      update: {},
      create: s,
    });
  }
}

async function seedReports() {
  const reports = [
    {
      id: "report-1",
      listingId: "listing-6",
      reporterId: "user-renter-1",
      reason: "Already rented",
      status: "OPEN",
    },
    {
      id: "report-2",
      listingId: "listing-6",
      reporterId: "user-renter-2",
      reason: "Phone is switched off",
      status: "OPEN",
    },
    {
      id: "report-3",
      listingId: "listing-3",
      reporterId: "user-renter-3",
      reason: "Photos do not match the room",
      status: "RESOLVED",
    },
  ] as const;

  for (const r of reports) {
    await prisma.report.upsert({
      where: {
        listingId_reporterId: {
          listingId: r.listingId,
          reporterId: r.reporterId,
        },
      },
      update: {},
      create: r,
    });
  }
}

async function main() {
  await seedUsers();
  await seedVerifications();
  await seedAreas();
  await seedLandmarks();
  await seedListings();
  await seedInquiries();
  await seedSavedListings();
  await seedReports();

  console.log("Seed done.");
  console.log(`Password for all users: ${PASSWORD}`);
  console.log("Admin:      01700000000");
  console.log(
    "Landlords:  01711000001 (approved), 01711000002 (pending), 01711000003 (rejected)",
  );
  console.log("Renters:    01722000001 to 01722000005");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
