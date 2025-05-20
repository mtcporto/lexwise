import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lightbulb, Search, FileText, MessagesSquare, ExternalLink } from "lucide-react";

export default function DashboardPage() {
  const features = [
    {
      title: "Pesquisa Unificada",
      description: "Acesse e pesquise em diversas APIs públicas de leis, jurisprudência e documentos legais em um só lugar.",
      icon: Search,
      href: "/search",
      cta: "Iniciar Pesquisa",
    },
    {
      title: "Analisador de Caso",
      description: "Faça upload da descrição do seu caso e nossa IA extrairá os pontos mais relevantes para sua análise.",
      icon: FileText,
      href: "/case-analyzer",
      cta: "Analisar Caso",
    },
    {
      title: "Preditor de Contra-Argumentos",
      description: "Descubra possíveis contra-argumentos para o seu caso, baseados em leis e jurisprudência, e fortaleça sua defesa.",
      icon: MessagesSquare,
      href: "/counterargument-predictor",
      cta: "Prever Argumentos",
    },
  ];

  const externalApis = [
    { name: "Senado Federal – Dados Abertos", url: "https://www12.senado.leg.br/dados-abertos" },
    { name: "Câmara dos Deputados – Dados Abertos", url: "https://dadosabertos.camara.leg.br/swagger/api.html" },
    { name: "LexML Brasil", url: "http://www.lexml.gov.br/" },
    { name: "CNJ – DataJud (API pública)", url: "https://datajud-wiki.cnj.jus.br/api-publica/" },
  ];

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lightbulb className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">Bem-vindo ao LexWise Assistant</CardTitle>
              <CardDescription className="text-lg">
                Sua plataforma inteligente para otimizar a atuação jurídica.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            LexWise Assistant integra APIs públicas e ferramentas de IA para fornecer insights valiosos,
            análises de caso e predições de contra-argumentos, auxiliando advogados a prepararem
            defesas mais robustas e estratégicas.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {features.map((feature) => (
          <Card key={feature.title} className="flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <div className="p-2 bg-primary/10 rounded-full">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={feature.href}>
                  {feature.cta}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Fontes de Dados Integradas</CardTitle>
          <CardDescription>
            Priorizamos dados abertos e APIs públicas para fornecer informações atualizadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {externalApis.map((api) => (
              <li key={api.name} className="flex items-center text-sm">
                <a
                  href={api.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center"
                >
                  {api.name}
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
