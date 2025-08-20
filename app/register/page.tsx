"use client"

import { Input } from "@/components/ui/input";
import SignupForm from "../ui/signup-form";
import { BookMarked } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [accountName, setAccountName] = useState("")

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="hidden bg-muted lg:flex lg:flex-col lg:items-center lg:justify-center p-8 text-center">
        <BookMarked className="h-24 w-24 mb-6 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">
          Dein neues digitales Bücherregal
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-md">
          Organisiere, was du gelesen hast und entdecke, was du als Nächstes lesen möchtest. Alles an einem Ort.
        </p>
      </div>

      <div className="flex items-center justify-center py-12 px-4">
        <div className="mx-auto w-full max-w-[380px]">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Erstelle deinen Account
            </h2>
            <p className="text-muted-foreground mt-2">
              Nur ein paar Klicks bis zu deinem Bücher-Universum.
            </p>
          </div>

          <SignupForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Du hast schon einen Account? Bitte gebe deinen Namen ein!
          </p>
          <Label htmlFor="accountName" className="mb-2">Name</Label>
          <Input
            className="mb-2"
            id="accountName"
            name="accountName"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Name"
          />
          {
            accountName && <a href={accountName}>
              <Button>
                Zum account
              </Button>
            </a>
          }
        </div>
      </div>
    </div>
  );
}