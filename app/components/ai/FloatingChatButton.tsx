"use client";

import { MessageCircle } from "lucide-react";

export default function FloatingChatButton() {
  return (
    <div className="fixed bottom-8 right-8 z-[200] hidden md:block" data-aos="zoom-in" data-aos-delay="220">
      <button
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#7c3aed] text-[#ede0ff] shadow-2xl transition-all hover:scale-110 active:scale-95"
        type="button"
      >
        <MessageCircle size={20} />
      </button>
    </div>
  );
}
