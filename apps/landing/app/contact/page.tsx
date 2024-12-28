"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactForm() {
  return (
    <div className="min-h-screen p-6 flex items-center justify-center ">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-4xl font-medium ">Send an email</h1>

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block uppercase text-sm font-medium"
            >
              Name
            </label>
            <Input
              id="name"
              placeholder="James Bond"
              className="bg-transparent border-zinc-800"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block uppercase text-sm font-medium"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="james@bond.com"
              className="bg-transparent border-zinc-800  "
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="message"
              className="block uppercase text-sm font-medium"
            >
              Message
            </label>
            <Textarea
              id="message"
              placeholder="How can I help you?"
              className="bg-transparent border-zinc-800 min-h-[120px]"
            />
          </div>

          <Button className="w-full" variant={"default"}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
