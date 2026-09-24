"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChatWidget } from "@/components/scripted-chat/ChatWidget";
import { ChatIcon } from "@/components/icons/ui";

/**
 * Homepage's one-click entry into the real auto-quote chat (the only
 * ScriptedFlow signed off for production — see
 * src/lib/scripted-chat/flows/index.ts). Mounting ChatWidget is itself
 * what starts the conversation (it fetches /api/scripted-chat/start on
 * mount), so this component only needs to decide when to mount it.
 */
export function HomeChatLauncher() {
  const [started, setStarted] = useState(false);

  if (started) {
    return <ChatWidget familySlug="auto" />;
  }

  return (
    <Card className="bg-background text-center text-foreground">
      <ChatIcon className="mx-auto size-12 text-accent-500" />
      <h2 className="mt-4 font-serif text-2xl font-semibold text-brand-900">Quick Quote Chat</h2>
      <p className="mt-2 text-brand-700">
        Get your auto quote started in about 2 minutes — no forms, just a quick conversation.
      </p>
      <Button size="lg" className="mt-6 w-full sm:w-auto" onClick={() => setStarted(true)}>
        Start Chatting Now
      </Button>
      <p className="mt-4 text-sm text-brand-600">
        Insuring something else?{" "}
        <Link href="/quote" className="underline hover:text-brand-900">
          See all quote options
        </Link>
      </p>
    </Card>
  );
}
