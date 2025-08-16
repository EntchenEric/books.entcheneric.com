import { Button } from "@/components/ui/button"
import { deleteSession } from "@/app/lib/session"
import { toast } from "sonner"
import { LogOutIcon } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function LogoutButton() {
  const handleLogout = async () => {
    const promise = () => new Promise(async (resolve) => {
        await deleteSession();
        resolve(null);
    });

    toast.promise(promise, {
      loading: 'Abmeldung wird durchgeführt...',
      success: () => {
        setTimeout(() => window.location.reload(), 500);
        return 'Du wurdest erfolgreich abgemeldet.';
      },
      error: 'Abmeldung fehlgeschlagen.',
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
            <LogOutIcon className="mr-2 h-4 w-4" />
            <span>Abmelden</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Möchtest du dich wirklich abmelden?</AlertDialogTitle>
          <AlertDialogDescription>
            Wenn du dich abmeldest kannst du deine Bibliothek nicht länger bearbeiten. Du musst dich erneut anmelden, um Änderungen vorzunehmen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogout}
            className="bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
          >
            Ja, abmelden
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}