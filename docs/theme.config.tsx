import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  logo: (
    <img
      src="/dark-text-logo.svg"
      alt="Traftics Logo"
      width={120}
      height={14}
      className="rounded-lg"
    />
  ),
  footer: {
    content: "Traftics Docs",
  },
  feedback: {
    content: "",
    labels: "",
  },
  editLink: {
    content: "",
  },
};

export default config;
