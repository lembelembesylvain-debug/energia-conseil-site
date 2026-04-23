import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import { buildResendFromHeader } from "@/lib/emails/resendFrom";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const WORK_TYPES = [
  "pac_air_eau",
  "pac_air_air",
  "photovoltaique",
  "vmc_simple",
  "vmc_double",
  "fenetres",
  "volets",
  "plancher_hydraulique",
  "plancher_electrique",
  "isolation",
  "autre",
] as const;

type WorkType = (typeof WORK_TYPES)[number];

function isWorkType(s: string): s is WorkType {
  return (WORK_TYPES as readonly string[]).includes(s);
}

function formatTravauxLabels(keys: string[]): string {
  const map: Record<string, string> = {
    pac_air_eau: "PAC air/eau",
    pac_air_air: "PAC air/air",
    photovoltaique: "Photovoltaïque",
    vmc_simple: "VMC simple flux",
    vmc_double: "VMC double flux",
    fenetres: "Fenêtres / menuiseries",
    volets: "Volets filaires ou solaires",
    plancher_hydraulique: "Plancher chauffant hydraulique",
    plancher_electrique: "Plancher chauffant électrique",
    isolation: "Isolation combles/murs",
    autre: "Autre",
  };
  return keys.map((k) => map[k] || k).join(", ");
}

function formatBudget(b: string): string {
  const m: Record<string, string> = {
    moins_10k: "Moins de 10 000€",
    dix_vingt_cinq: "10 000 - 25 000€",
    vingt_cinq_cinquante: "25 000 - 50 000€",
    cinquante_soixante_quinze: "50 000 - 75 000€",
  };
  return m[b] || b;
}

function formatSituation(s: string): string {
  const m: Record<string, string> = {
    reste_a_charge: "Reste à charge après aides",
    travaux_express: "Travaux express — je ne veux pas attendre les aides",
    ne_sait_pas: "Je ne sais pas encore",
  };
  return m[s] || s;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const prenom = String(body.prenom ?? "").trim();
  const nom = String(body.nom ?? "").trim();
  const email = String(body.email ?? "").trim();
  const telephone = String(body.telephone ?? "").trim();
  const travauxRaw = body.travaux;
  const budget = String(body.budget ?? "").trim();
  const situation = String(body.situation ?? "").trim();
  const region = String(body.region ?? "").trim();
  const description = String(body.description ?? "").trim();

  if (!prenom || !nom || !email || !telephone) {
    return NextResponse.json(
      { error: "Prénom, nom, email et téléphone sont requis." },
      { status: 400 },
    );
  }

  const travauxList: string[] = Array.isArray(travauxRaw)
    ? travauxRaw.filter((x): x is string => typeof x === "string" && isWorkType(x))
    : [];

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = buildResendFromHeader(
    process.env.RESEND_FROM_EMAIL,
    "ENERGIA CONSEIL IA",
  );

  const brokerTo =
    process.env.COURTIER_LEAD_EMAIL?.trim() ||
    "fabien.barras@vivonscourtier.com";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  const leadPayload = {
    prenom,
    nom,
    email,
    telephone,
    travaux: travauxList,
    budget: budget || null,
    situation: situation || null,
    region: region || null,
    description: description || null,
  };

  if (!apiKey) {
    return NextResponse.json(
      { error: "Envoi email indisponible (RESEND_API_KEY)." },
      { status: 503 },
    );
  }

  const resend = new Resend(apiKey);
  const nomComplet = `${prenom} ${nom}`;
  const travauxText = formatTravauxLabels(travauxList);

  const corpsFabien = [
    `Nouveau lead depuis energia-conseil-ia.com (courtier travaux)`,
    ``,
    `Nom : ${nomComplet}`,
    `Email : ${email}`,
    `Téléphone : ${telephone}`,
    `Région / département : ${region || "—"}`,
    ``,
    `Types de travaux : ${travauxText || "—"}`,
    `Budget estimé : ${budget ? formatBudget(budget) : "—"}`,
    `Situation financement : ${situation ? formatSituation(situation) : "—"}`,
    ``,
    `Description du projet :`,
    description || "—",
  ].join("\n");

  const { error: errFabien } = await resend.emails.send({
    from,
    to: brokerTo,
    replyTo: email,
    subject: `🔥 Nouveau lead — ${nomComplet}`,
    text: corpsFabien,
  });

  if (errFabien) {
    console.error("[courtier-contact] Resend (courtier):", errFabien);
    return NextResponse.json(
      { error: errFabien.message || "Échec envoi email courtier" },
      { status: 502 },
    );
  }

  const corpsClient = [
    `Bonjour ${prenom},`,
    ``,
    `Votre demande a bien été reçue.`,
    ``,
    `Fabien Barras de Vivons Courtier vous contactera sous 48h au ${telephone}.`,
    `Site : https://travauxcredit.fr`,
    ``,
    `Cordialement,`,
    `L'équipe ENERGIA-CONSEIL IA®`,
  ].join("\n");

  const { error: errClient } = await resend.emails.send({
    from,
    to: email,
    replyTo: brokerTo,
    subject: "Votre demande a bien été reçue",
    text: corpsClient,
  });

  if (errClient) {
    console.error("[courtier-contact] Resend (client):", errClient);
  }

  let supabaseError: string | null = null;
  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.from("leads_courtier").insert(leadPayload);
    if (error) {
      console.error("[courtier-contact] Supabase:", error.message);
      supabaseError = error.message;
    }
  } else {
    console.warn("[courtier-contact] Supabase non configuré — lead non stocké.");
  }

  return NextResponse.json({
    ok: true,
    supabaseOk: !supabaseError,
    confirmationSent: !errClient,
    supabaseError: supabaseError || undefined,
  });
}
