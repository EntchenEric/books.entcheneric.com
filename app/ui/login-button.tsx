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
import { PersonIcon } from "@radix-ui/react-icons"

export default function LoginButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button><PersonIcon />Anmelden</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Anmelden</DialogTitle>
          <DialogDescription>
            Bitte melde dich an.
          </DialogDescription>
        </DialogHeader>
        <LoginForm />
      </DialogContent>
    </Dialog>
  )
}