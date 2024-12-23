// Example from https://beta.reactjs.org/learn

import { useState } from "react";
import { Cards } from "nextra/components";
import { MonitorIcon } from "lucide-react";
function MyButton() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <Cards>
      <Cards.Card
        icon={<MonitorIcon />}
        title="Website SDK"
        href="/docs/webSdk"
      />
    </Cards>
  );
}

export default function SDKButton() {
  return <MyButton />;
}
