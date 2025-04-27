"use server";

import { cookies } from "next/headers";

export async function getExamMode() {
  const cookieStore = await cookies();
  return cookieStore.get("examMode")?.value === "true";
}

export async function setExamMode(value: boolean) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "examMode",
    value: value.toString(),
    path: "/",
  });
}
