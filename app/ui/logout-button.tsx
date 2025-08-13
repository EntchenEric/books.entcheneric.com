import { Button } from "@/components/ui/button"
import { deleteSession } from "@/app/lib/session"
import { toast } from "sonner"

export default function LogoutButton() {
  const handleLogout = async () => {
    await deleteSession()
    toast("Du wurdest erfolgreich abgemeldet.")
    window.location.reload()
  }
  return (
    <Button onClick={handleLogout}>Abmelden</Button>
  )
}