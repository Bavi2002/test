"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";

interface QRCodePanelProps {
  qr: string;
}

export default function QRCodePanel({qr}: QRCodePanelProps) {
  return (
    <Card className="w-full max-w-sm rounded-2xl shadow-md p-2 ">
      <div className="flex justify-center">
        <Image
          src={qr} 
          alt="QR Code"
          title="QR Code"
          width={200}
          height={200}
          priority
          className="rounded-md"
        />
      </div>
      <div className="text-center font-medium text-base text-muted-foreground mb-5">
        Scan to Chat with this bot
      </div>
    </Card>
  );
}
