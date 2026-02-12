"use client";

import { ShieldAlert, Hospital, CarTaxiFront, Landmark } from "lucide-react";

type EmergencyToolkitProps = {
  language: "en" | "kh";
};

const labels = {
  en: {
    title: "Emergency / Travel Toolkit",
    hospital: "Nearest Hospital",
    police: "Tourist Police",
    embassy: "Embassy Area",
    tuktuk: "Find Tuk-Tuk",
  },
  kh: {
    title: "Emergency / Travel Toolkit",
    hospital: "Nearest Hospital",
    police: "Tourist Police",
    embassy: "Embassy Area",
    tuktuk: "Find Tuk-Tuk",
  },
};

const actions = [
  {
    id: "hospital",
    icon: Hospital,
    href: "https://www.google.com/maps/search/?api=1&query=hospital+siem+reap",
  },
  {
    id: "police",
    icon: ShieldAlert,
    href: "https://www.google.com/maps/search/?api=1&query=tourist+police+siem+reap",
  },
  {
    id: "embassy",
    icon: Landmark,
    href: "https://www.google.com/maps/search/?api=1&query=embassy+phnom+penh",
  },
  {
    id: "tuktuk",
    icon: CarTaxiFront,
    href: "https://www.google.com/maps/search/?api=1&query=tuk+tuk+siem+reap",
  },
] as const;

export default function EmergencyToolkit({ language }: EmergencyToolkitProps) {
  const text = labels[language];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.55)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{text.title}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          const label =
            action.id === "hospital"
              ? text.hospital
              : action.id === "police"
                ? text.police
                : action.id === "embassy"
                  ? text.embassy
                  : text.tuktuk;

          return (
            <a
              key={action.id}
              href={action.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
            >
              <Icon size={13} className="text-red-500" />
              <span>{label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
