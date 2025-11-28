"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config"; // Pfad zur Config im Hauptverzeichnis

export default function Studio() {
  return <NextStudio config={config} />;
}