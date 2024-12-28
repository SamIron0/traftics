import { Cards } from "nextra/components";
import { MonitorIcon } from "lucide-react";

export default function SDKButton() {
  return (
    <Cards>
      <Cards.Card
        icon={<MonitorIcon />}
        title="Project Settings"
        href="/basics"
      />
    </Cards>
  );
}
