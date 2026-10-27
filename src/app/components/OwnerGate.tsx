import { ArrowLeft, LoaderCircle, LockKeyhole, ShieldX } from "lucide-react"
import { PLATFORM_OWNER_EMAIL, useAuth } from "../services/auth"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"

export function OwnerGate({
  children,
  onBack,
}: {
  children: React.ReactNode
  onBack: () => void
}) {
  const { account, loading } = useAuth()
  const isOwner =
    account?.user.email?.toLowerCase() === PLATFORM_OWNER_EMAIL.toLowerCase()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <div className="flex items-center gap-3 text-muted-foreground">
          <LoaderCircle className="animate-spin text-primary" />
          <span>Verificando acesso administrativo...</span>
        </div>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted p-6">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader>
            <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <ShieldX />
            </div>
            <CardTitle className="text-xl">Acesso restrito</CardTitle>
            <CardDescription>
              Este painel é exclusivo do proprietário da plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              type="button"
              className="w-full"
              onClick={() =>
                window.location.assign(
                  new URL("bingo.html", window.location.href),
                )
              }
            >
              <LockKeyhole />
              Entrar como proprietário
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={onBack}
            >
              <ArrowLeft />
              Voltar ao portal
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return children
}
