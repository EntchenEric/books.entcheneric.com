import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import LoginForm from "./login-form"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"

type LoginButtonProps = {
  readonly name: string
}

export default function LoginButton({ name }: LoginButtonProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button id="LoginButton"><User className="h-4 w-4 mr-1" />Anmelden</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Anmelden</DialogTitle>
          <DialogDescription>
            Bitte melde dich an.
          </DialogDescription>
        </DialogHeader>
        <LoginForm name={name} />
      </DialogContent>
    </Dialog>
  )
}