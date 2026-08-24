import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { nominationSchema } from "@/lib/schemas";
import { countryNameFor } from "@/lib/countries";
import { prisma } from "@/lib/db";
import { getOpenCycle } from "@/lib/cycles";
import { rateLimit, clientIp } from "@/lib/rateLimit";

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "");
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`nominate:${ip}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = nominationSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid submission.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Honeypot: a real user never populates this field.
  if (parsed.data.companyWebsite) {
    return NextResponse.json({ id: "ok" }, { status: 201 });
  }

  const cycle = await getOpenCycle();
  if (!cycle) {
    return NextResponse.json({ error: "Nominations are currently closed." }, { status: 403 });
  }

  const { nominatorName, nominatorEmail, nomineeName, countryCode, traits, momentText, impactText } =
    parsed.data;

  try {
    const nomination = await prisma.nomination.create({
      data: {
        cycleId: cycle.id,
        nomineeName: stripHtml(nomineeName),
        countryCode,
        countryName: countryNameFor(countryCode),
        traits: JSON.stringify(traits),
        momentText: stripHtml(momentText),
        impactText: stripHtml(impactText),
        nominatorName: stripHtml(nominatorName),
        nominatorEmail,
      },
    });

    return NextResponse.json({ id: nomination.id }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "You've already submitted a nomination for this window." },
        { status: 409 }
      );
    }
    throw err;
  }
}
