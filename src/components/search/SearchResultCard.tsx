import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export interface SearchResultItem {
  id: string;
  title: string;
  source: string;
  description: string;
  url?: string;
  type?: string; // e.g., "Lei", "Projeto de Lei", "Jurisprudência"
  date?: string;
}

interface SearchResultCardProps {
  result: SearchResultItem;
}

export function SearchResultCard({ result }: SearchResultCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{result.title}</CardTitle>
          <Badge variant="outline">{result.source}</Badge>
        </div>
        {result.type && <CardDescription>{result.type}{result.date ? ` - ${result.date}`: ''}</CardDescription>}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{result.description}</p>
      </CardContent>
      {result.url && (
        <CardFooter>
          <Button variant="link" asChild className="p-0 h-auto">
            <Link href={result.url} target="_blank" rel="noopener noreferrer">
              Ver fonte original <ExternalLink className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
