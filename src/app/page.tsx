import { Logo } from "@/components/shared/logo";
import { UnProtectedLayout } from "@/components/shared/unprotected-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, Brain, Package, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function WelcomePage() {
  const features = [
    {
      icon: <BarChart2 className="h-8 w-8 text-primary" />,
      title: "Advanced Dashboard & Reporting",
      description:
        "Gain insights into sales performance, manage staff, and track inventory with ease. Managers get a comprehensive overview, while salespersons focus on their metrics.",
    },
    {
      icon: <Package className="h-8 w-8 text-primary" />,
      title: "Smart Inventory Management",
      description:
        "Keep your stock optimized. Managers can update inventory levels, add new products, and prevent stockouts effectively.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Role-Based Access Control",
      description:
        "Secure and streamlined operations with distinct roles for Managers/Business Owners and Cashiers/Salespersons, ensuring data privacy and operational efficiency.",
    },
    {
      icon: <Brain className="h-8 w-8 text-primary" />,
      title: "AI-Driven Recommendations",
      description:
        "Leverage the power of AI for inventory suggestions, promotional opportunities, and reorder amount predictions based on your sales data.",
    },
  ];

  return (
    <UnProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex flex-col items-center justify-center p-4 md:p-8">
        <header className="absolute top-0 left-0 w-full p-6">
          <Logo />
        </header>

        <main className="container mx-auto flex flex-col items-center text-center py-16 md:py-24">
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
            Welcome to <span className="text-primary">SaleSpider</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-10">
            The smart, decentralized solution for small and medium-sized stores.
            Streamline your sales, manage inventory efficiently, and unlock
            growth with AI-powered insights.
          </p>
          <div className="flex gap-4 mb-16">
            <Button asChild size="lg">
              <Link href="/login">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>

          <div className="relative w-full max-w-4xl">
            <Image
              src="https://placehold.co/1200x600.png?text=SaleSpider+Dashboard+Preview"
              alt="SaleSpider Dashboard Preview"
              width={1200}
              height={600}
              className="rounded-xl shadow-2xl"
              data-ai-hint="dashboard application"
            />
            <div className="absolute inset-0 bg-black/10 rounded-xl"></div>
          </div>
        </main>

        <section
          id="features"
          className="w-full bg-card py-16 md:py-24 rounded-t-3xl shadow-xl"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-card-foreground mb-12">
              Why Choose SaleSpider?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={feature.title.substring(0, 3) + index}
                  className="bg-background/50 hover:shadow-lg transition-shadow duration-300"
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      {feature.icon}
                      <CardTitle className="text-xl text-foreground">
                        {feature.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <footer className="w-full py-8 text-center">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} SaleSpider. All rights reserved.
          </p>
        </footer>
      </div>
    </UnProtectedLayout>
  );
}
