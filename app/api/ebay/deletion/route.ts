// app/api/ebay/deletion/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

/**
 * eBay Marketplace Account Deletion endpoint
 *
 * eBay validates the endpoint by calling:
 *   GET https://<endpoint>?challenge_code=XYZ
 *
 * We must respond with:
 *   { "challengeResponse": sha256(challenge_code + verification_token + endpoint_url) }
 *
 * NOTE: The endpoint_url must match EXACTLY what you entered in the eBay portal.
 */
const ENDPOINT_URL = "https://reefcultures.com/api/ebay/deletion";

function sha256Hex(input: string) {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const challengeCode = searchParams.get("challenge_code");

  if (!challengeCode) {
    return NextResponse.json(
      { error: "Missing challenge_code" },
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  const verificationToken = process.env.EBAY_DELETION_VERIFICATION_TOKEN;
  if (!verificationToken) {
    return NextResponse.json(
      { error: "Missing EBAY_DELETION_VERIFICATION_TOKEN env var" },
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  // Per eBay: challengeCode + verificationToken + endpoint
  const hash = sha256Hex(`${challengeCode}${verificationToken}${ENDPOINT_URL}`);

  return NextResponse.json(
    { challengeResponse: hash },
    { status: 200, headers: { "content-type": "application/json" } }
  );
}

/**
 * After validation, eBay will POST deletion notifications here.
 * You can safely just 200 OK them (and optionally process).
 */
export async function POST(req: NextRequest) {
  // You can store/log this if you want:
  // const body = await req.text();
  // console.log("eBay deletion notification:", body);

  return new NextResponse(null, { status: 200 });
}