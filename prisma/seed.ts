import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { countryNameFor } from "../lib/countries";
import { computeGlobalWindow } from "../lib/schedule";

const prisma = new PrismaClient();

const DEV_PASSWORD = "ChangeMe123!";

// Participating countries only: Kenya, Ghana, Rwanda, Sierra Leone,
// Bangladesh, Bhutan, United States.
const PARTICIPATING = ["KE", "GH", "RW", "SL", "BD", "BT", "US"];

const NOMINATORS = [
  { name: "Wanjiru Kamau", email: "wanjiru.kamau@medtroniclabs.org" },
  { name: "David Mensah", email: "david.mensah@medtroniclabs.org" },
  { name: "Priya Nair", email: "priya.nair@medtroniclabs.org" },
  { name: "Carlos Ibarra", email: "carlos.ibarra@medtroniclabs.org" },
  { name: "Fatima Bello", email: "fatima.bello@medtroniclabs.org" },
  { name: "Grace Mwangi", email: "grace.mwangi@medtroniclabs.org" },
  { name: "Samuel Otieno", email: "samuel.otieno@medtroniclabs.org" },
  { name: "Lindiwe Dube", email: "lindiwe.dube@medtroniclabs.org" },
  { name: "Ravi Shah", email: "ravi.shah@medtroniclabs.org" },
  { name: "Aisha Abdullahi", email: "aisha.abdullahi@medtroniclabs.org" },
];

const TEMPLATES: {
  nomineeName: string;
  traits: string[];
  moment: string;
  impact: string;
}[] = [
  {
    nomineeName: "Amara Okafor",
    traits: ["PUT_PATIENTS_FIRST", "FOSTER_MUTUAL_ACCOUNTABILITY"],
    moment:
      "In June, a community health worker flagged that her tablet couldn't sync patient records because of a network outage that had lasted three days. Amara drove two hours to the site herself instead of waiting for a remote fix, sat with the CHW to manually back up the week's screening data, and stayed until the connection was restored that evening. She then rewrote the offline-sync guidance so every CHW in the region had a clear fallback, aligning the whole team around one shared process.",
    impact:
      "No patient screening data was lost, and the updated offline procedure is now used across 40 CHWs in the region, reducing similar incidents by an estimated 70 percent.",
  },
  {
    nomineeName: "Miguel Torres",
    traits: ["ADOPT_EXCELLENCE"],
    moment:
      "Miguel noticed our hypertension dashboard was rounding blood pressure readings in a way that occasionally masked borderline-high results. Rather than filing a low-priority ticket, he spent a weekend tracing the issue through three services, wrote a full regression test suite for the calculation, and presented the fix with evidence to the clinical team before it shipped, holding the work to a higher standard of integrity than the deadline strictly required.",
    impact:
      "The fix shipped within a week instead of the usual quarter-long backlog cycle, and the new tests have since caught two other rounding bugs before they reached production.",
  },
  {
    nomineeName: "Chidinma Eze",
    traits: ["FOSTER_MUTUAL_ACCOUNTABILITY", "LEAD_WITH_INNOVATION"],
    moment:
      "When two of our regional teams kept missing each other on handoffs for the diabetes program rollout, Chidinma proposed and ran a weekly 20-minute sync anchored around a shared tracker instead of scattered messages. She held the meeting to a strict agenda and made sure every open item had a named owner and date before people left, building real accountability and trust between teams that rarely spoke before.",
    impact:
      "Handoff delays on the program dropped from an average of four days to under one, and both teams adopted the same tracker format for two other cross-region projects.",
  },
  {
    nomineeName: "Sofia Reyes",
    traits: ["PUT_PATIENTS_FIRST"],
    moment:
      "A mother at one of our partner clinics couldn't complete her child's vaccination record because the form required a national ID number she didn't yet have. Sofia noticed the pattern across several similar cases, escalated it to the clinical operations lead the same day, and worked with the clinic staff to set up a temporary ID workaround so no child's care was delayed.",
    impact:
      "Over 60 families were able to complete vaccination records that would otherwise have been stalled, and the temporary ID process was later adopted as a standing policy for undocumented patients.",
  },
  {
    nomineeName: "Joseph Banda",
    traits: ["ADOPT_EXCELLENCE", "PUT_PATIENTS_FIRST"],
    moment:
      "During a routine data quality review, Joseph found that a subset of blood pressure readings from one facility were being recorded in the wrong units, which would have skewed the entire district's hypertension prevalence estimate. He personally called the facility, walked the nurse through the correct entry process, and re-validated three months of historical data before submitting the district report - holding his own work to the same rigor he'd expect from anyone else.",
    impact:
      "The corrected data changed the district's reported hypertension prevalence by nearly five percentage points, directly affecting how resources were allocated for the next quarter's outreach program.",
  },
  {
    nomineeName: "Emeka Nwosu",
    traits: ["LEAD_WITH_INNOVATION"],
    moment:
      "Emeka noticed that community health workers were spending nearly 15 minutes per patient manually calculating risk scores on paper. Over two weekends, he built a simple offline calculator that ran on the same low-end phones the CHWs already carried, tested it with five CHWs in the field, and iterated based on their feedback before proposing the innovation to the product team.",
    impact:
      "Average time per patient visit dropped by nine minutes, and the tool is now being evaluated for rollout across all CHWs in the country program.",
  },
  {
    nomineeName: "Ana Fernandes",
    traits: ["FOSTER_MUTUAL_ACCOUNTABILITY"],
    moment:
      "When a launch date slipped for the second time, Ana called an honest retro with the full cross-functional team instead of letting frustration simmer quietly. She asked each function to name one commitment they'd missed and one they'd kept, turning the conversation into a shared list of concrete accountability changes rather than blame, and rebuilding trust across the group.",
    impact:
      "The team hit its next two milestones on time, and the retro format Ana introduced is now used by two other product squads.",
  },
  {
    nomineeName: "Tendai Moyo",
    traits: ["PUT_PATIENTS_FIRST", "ADOPT_EXCELLENCE"],
    moment:
      "Tendai was reviewing enrollment numbers when she noticed a sharp drop at one clinic. Instead of assuming it was a data glitch, she visited the clinic and learned that a broken generator was cutting power to the tablets used for patient intake. She arranged a temporary solar charger within two days and flagged the generator for repair through the facilities team.",
    impact:
      "Patient enrollment at the clinic returned to normal within a week, preventing an estimated 150 missed screenings during the outage period.",
  },
  {
    nomineeName: "Rahul Verma",
    traits: ["ADOPT_EXCELLENCE", "LEAD_WITH_INNOVATION"],
    moment:
      "Rahul was asked to add a small feature to the medication reminder system, but noticed the underlying scheduling logic couldn't handle patients on more than three medications without producing duplicate alerts. Rather than build around the bug, he proposed an innovative redesign, built a prototype in three days, and validated it against six months of real prescription data before the sprint ended.",
    impact:
      "The redesigned scheduler eliminated duplicate alerts for the roughly 2,200 patients on multi-drug regimens and became the basis for the next platform release.",
  },
  {
    nomineeName: "Grace Achieng",
    traits: ["FOSTER_MUTUAL_ACCOUNTABILITY", "PUT_PATIENTS_FIRST"],
    moment:
      "Grace was covering for a colleague on leave when a partner NGO asked for an urgent data-sharing agreement update. Rather than saying it would wait, she read the entire existing agreement overnight, drafted the update herself, and looped in legal and the colleague's manager to keep everyone aligned and accountable before sending it back within 48 hours.",
    impact:
      "The partner NGO's screening program continued without interruption, protecting continuity of care for roughly 900 patients who would otherwise have faced a gap in services.",
  },
  {
    nomineeName: "Daniel Kiptoo",
    traits: ["LEAD_WITH_INNOVATION", "ADOPT_EXCELLENCE"],
    moment:
      "Daniel noticed our monthly reporting process required three people to manually reconcile spreadsheets from five different facilities, taking almost two full days each month. He built a lightweight reconciliation script in his own time, tested it against a full quarter of historical data to confirm it matched the manual process exactly, then walked the reporting team through adopting the new tool.",
    impact:
      "Monthly reconciliation time dropped from two days to under two hours, freeing the reporting team to spend that time on data quality reviews instead.",
  },
  {
    nomineeName: "Ngozi Chukwu",
    traits: ["PUT_PATIENTS_FIRST", "LEAD_WITH_INNOVATION"],
    moment:
      "During a site visit, Ngozi noticed elderly patients struggling to read the small print on printed medication schedules. She designed a large-print, icon-based version on her own initiative, tested it with ten patients at the clinic, and refined the icons based on which ones caused confusion before sharing the innovative template with the design team.",
    impact:
      "Medication adherence self-reports at the pilot clinic improved noticeably within a month, and the large-print format is being adapted for use across all partner clinics in the region.",
  },
];

function isoDateOffset(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function seedUsers() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "catherine.muthoni@medtroniclabs.org").toLowerCase();
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH ?? (await bcrypt.hash(DEV_PASSWORD, 10));

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: adminPasswordHash, isAdmin: true, name: "Catherine Muthoni" },
    create: { name: "Catherine Muthoni", email: adminEmail, passwordHash: adminPasswordHash, isAdmin: true },
  });
  console.log(`Seeded admin user: ${adminEmail}`);
  console.log(
    process.env.ADMIN_PASSWORD_HASH
      ? "Password matches your ADMIN_PASSWORD_HASH in .env."
      : `No ADMIN_PASSWORD_HASH set — using dev default password: ${DEV_PASSWORD}`
  );

  // A few employee accounts so the "sign in as an employee" experience has
  // real nomination history to show right away.
  const employeePasswordHash = await bcrypt.hash(DEV_PASSWORD, 10);
  for (const nominator of NOMINATORS.slice(0, 3)) {
    await prisma.user.upsert({
      where: { email: nominator.email },
      update: { name: nominator.name, passwordHash: employeePasswordHash },
      create: { name: nominator.name, email: nominator.email, passwordHash: employeePasswordHash, isAdmin: false },
    });
  }
  console.log(
    `Seeded ${NOMINATORS.slice(0, 3).length} demo employee accounts (password: ${DEV_PASSWORD}), e.g. ${NOMINATORS[0].email}`
  );
}

async function seedCycle(
  name: string,
  status: "DRAFT" | "OPEN" | "CLOSED",
  startDateOffsetDays: number,
  templateIndexes: number[],
  options: { winnersByTrait?: Partial<Record<string, number>>; publishResults?: boolean } = {}
) {
  const { opensAt, closesAt } = computeGlobalWindow(isoDateOffset(startDateOffsetDays), 16);
  const now = new Date();

  const cycle = await prisma.cycle.create({
    data: {
      name,
      status,
      opensAt,
      closesAt,
      resultsPublishedAt: options.publishResults ? new Date() : null,
    },
  });

  const windowStart = opensAt.getTime();
  const windowEnd = Math.min(closesAt.getTime(), now.getTime());
  const span = Math.max(windowEnd - windowStart, 0);

  for (let i = 0; i < templateIndexes.length; i++) {
    const template = TEMPLATES[templateIndexes[i]];
    const nominator = NOMINATORS[i % NOMINATORS.length];
    const countryCode = PARTICIPATING[i % PARTICIPATING.length];
    const createdAt = new Date(
      windowStart + (templateIndexes.length > 1 ? (span * i) / (templateIndexes.length - 1 || 1) : 0)
    );

    await prisma.nomination.create({
      data: {
        cycleId: cycle.id,
        nomineeName: template.nomineeName,
        countryCode,
        countryName: countryNameFor(countryCode),
        traits: JSON.stringify(template.traits),
        momentText: template.moment,
        impactText: template.impact,
        nominatorName: nominator.name,
        nominatorEmail: nominator.email,
        createdAt,
      },
    });
  }

  const winnerEntries = Object.entries(options.winnersByTrait ?? {});
  for (const [trait, idx] of winnerEntries) {
    if (idx === undefined) continue;
    await prisma.cycleWinner.create({
      data: { cycleId: cycle.id, nomineeName: TEMPLATES[idx].nomineeName, trait },
    });
  }

  console.log(
    `Seeded cycle "${name}" (${status}) with ${templateIndexes.length} nominations` +
      (winnerEntries.length ? `, ${winnerEntries.length} winners` : "") +
      (options.publishResults ? " [results published]" : "")
  );
  return cycle;
}

async function main() {
  await seedUsers();

  await prisma.cycleWinner.deleteMany();
  await prisma.nomination.deleteMany();
  await prisma.cycle.deleteMany();

  // FY27 Q1 — closed, admin still curating: only 2 of the 4 categories filled,
  // and not yet published.
  await seedCycle("FY27 Q1", "CLOSED", -200, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], {
    winnersByTrait: { PUT_PATIENTS_FIRST: 0, ADOPT_EXCELLENCE: 4 },
    publishResults: false,
  });

  // FY27 Q2 — closed, all four categories filled and published.
  await seedCycle("FY27 Q2", "CLOSED", -140, [1, 3, 5, 7, 9, 0, 2, 10, 11], {
    winnersByTrait: {
      PUT_PATIENTS_FIRST: 9,
      ADOPT_EXCELLENCE: 1,
      FOSTER_MUTUAL_ACCOUNTABILITY: 2,
      LEAD_WITH_INNOVATION: 5,
    },
    publishResults: true,
  });

  // FY27 Q3 — closed, all four categories filled and published.
  await seedCycle("FY27 Q3", "CLOSED", -80, [2, 4, 6, 8, 10, 0, 1, 3, 5, 7], {
    winnersByTrait: {
      PUT_PATIENTS_FIRST: 0,
      ADOPT_EXCELLENCE: 8,
      FOSTER_MUTUAL_ACCOUNTABILITY: 6,
      LEAD_WITH_INNOVATION: 10,
    },
    publishResults: true,
  });

  // FY27 Q4 — currently open (started a few days ago, closes in the future).
  await seedCycle("FY27 Q4", "OPEN", -6, [4, 6, 9, 11, 0, 2, 8, 10]);

  // FY28 Q1 — upcoming, not yet activated.
  await prisma.cycle.create({
    data: {
      name: "FY28 Q1",
      status: "DRAFT",
      ...computeGlobalWindow(isoDateOffset(45), 16),
    },
  });
  console.log('Seeded upcoming cycle "FY28 Q1" (DRAFT).');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
