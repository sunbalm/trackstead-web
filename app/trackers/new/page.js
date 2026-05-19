"use client";

import { Suspense } from "react";
import NewTrackerContent from "./NewTrackerContent";

export default function NewTrackerPage() {
  return (
    <Suspense fallback={null}>
      <NewTrackerContent />
    </Suspense>
  );
}