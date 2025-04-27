import { BookOpen, Loader2 } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";

export default function PlaylistLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <Card className="flex flex-col items-center gap-6 bg-card/50 p-8 backdrop-blur-sm">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20" />
          <div className="relative flex items-center justify-center">
            <BookOpen className="h-12 w-12 animate-bounce text-primary" />
          </div>
        </div>
        <CardContent className="flex flex-col items-center gap-2 p-0">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-lg font-medium text-foreground">Carregando...</p>
          <p className="text-sm text-muted-foreground">
            Preparando suas questões
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
