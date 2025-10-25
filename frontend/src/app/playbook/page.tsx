import { PlaybookPageClient } from "@/components/playbook/playbook-page-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Playbook Generator | PentestAI",
    description: "Generate penetration testing playbooks for specific targets.",
};

export default function PlaybookPage() {
    return <PlaybookPageClient />;
}
