"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
export default function HomePage() {
  useEffect(() => {
    async function redirectToDashboard() {
      const org_slug = "remeal";
      const proj_slug = "project-4fd62621";
      const defaultDashboard_id = "89ddb53f-f040-4c64-9bfe-52930fac6fd7";
      redirect(
        `/org/${org_slug}/project/${proj_slug}/dashboards/${defaultDashboard_id}`
      );
    }

    redirectToDashboard();
  }, []);

  return null;
}
