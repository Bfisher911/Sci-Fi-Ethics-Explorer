import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Zap } from 'lucide-react';
import Link from 'next/link';

const tiers = [
  {
    name: 'Explorer (Free)',
    price: '$0',
    frequency: '/month',
    description: 'Start your journey into sci-fi ethics with core features.',
    features: [
      { text: 'Access to a selection of dilemmas', included: true },
      { text: 'Basic scenario analysis (limited)', included: true },
      { text: 'Read community dilemmas', included: true },
      { text: 'Ethical glossary access', included: true },
      { text: 'Limited AI Counselor interactions', included: true },
      { text: 'Submit up to 1 dilemma per month', included: true },
    ],
    cta: 'Start Exploring',
    href: '/stories',
    isPrimary: false,
  },
  {
    name: 'Philosopher (Premium)',
    price: '$9.99',
    frequency: '/month',
    description: 'Unlock the full potential of ethical exploration and AI tools.',
    features: [
      { text: 'Unlimited access to all dilemmas', included: true },
      { text: 'Advanced scenario analysis (unlimited)', included: true },
      { text: 'Submit and participate in community dilemmas', included: true },
      { text: 'Full ethical glossary & framework explorer access', included: true },
      { text: 'Unlimited AI Counselor interactions', included: true },
      { text: 'Submit unlimited dilemmas', included: true },
      { text: 'Priority support & early access to new features', included: true },
      { text: 'Participate in moderated debates', included: true },
    ],
    cta: 'Go Premium',
    href: '#', // Placeholder for Stripe link
    isPrimary: true,
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-primary font-headline">Choose Your Path</h1>
        <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
          Select a plan that suits your journey into the complex world of sci-fi ethics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={`flex flex-col shadow-xl hover:shadow-primary/40 transition-shadow duration-300 bg-card/80 backdrop-blur-sm ${
              tier.isPrimary ? 'border-2 border-accent ring-2 ring-accent/50' : ''
            }`}
          >
            <CardHeader className="text-center">
              {tier.isPrimary && (
                <div className="text-sm font-semibold uppercase tracking-wider text-accent mb-2 flex items-center justify-center">
                  <Zap className="h-4 w-4 mr-1" /> Most Popular
                </div>
              )}
              <CardTitle className={`text-3xl font-bold ${tier.isPrimary ? 'text-accent' : 'text-primary'}`}>{tier.name}</CardTitle>
              <div className="mt-2">
                <span className="text-4xl font-extrabold text-foreground">{tier.price}</span>
                <span className="text-base font-medium text-muted-foreground">{tier.frequency}</span>
              </div>
              <CardDescription className="mt-3 text-md">{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature.text} className="flex items-center">
                    {feature.included ? (
                      <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-foreground/90' : 'text-muted-foreground'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                asChild
                size="lg"
                className={`w-full ${
                  tier.isPrimary ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                <Link href={tier.href} target={tier.href === '#' ? '_blank' : '_self'} rel={tier.href === '#' ? 'noopener noreferrer' : ''}>
                  {tier.cta}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground mt-12">
        Note: This is a conceptual pricing page for an educational project. No actual payments are processed.
        {tiers.find(t => t.href === '#') && <span> The "Go Premium" button is a placeholder.</span>}
      </p>
    </div>
  );
}
