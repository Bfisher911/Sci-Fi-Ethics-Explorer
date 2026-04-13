'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import type { SeatTier } from '@/types';

interface SeatTierSelectorProps {
  tiers: SeatTier[];
  selectedTier?: number;
  onSelect: (seats: number) => void;
}

/**
 * Grid of seat tier cards for license purchase.
 * Each card shows seat count, price per seat, and total price.
 * Volume discounts are visually highlighted.
 */
export function SeatTierSelector({ tiers, selectedTier, onSelect }: SeatTierSelectorProps) {
  const highestSeatCount = Math.max(...tiers.map((t) => t.seats));
  const lowestPricePerSeat = Math.min(...tiers.map((t) => t.pricePerSeat));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tiers.map((tier) => {
        const isSelected = selectedTier === tier.seats;
        const isBestValue = tier.seats === highestSeatCount;
        const isLowestPrice = tier.pricePerSeat === lowestPricePerSeat;
        const discountPercent = Math.round(
          ((tiers[0].pricePerSeat - tier.pricePerSeat) / tiers[0].pricePerSeat) * 100
        );

        return (
          <Card
            key={tier.seats}
            className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg bg-card/80 backdrop-blur-sm ${
              isSelected
                ? 'border-2 border-accent ring-2 ring-accent/50 shadow-accent/20'
                : 'border border-border hover:border-muted-foreground/50'
            }`}
            onClick={() => onSelect(tier.seats)}
          >
            {(isBestValue || isLowestPrice) && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                <Badge className="bg-accent text-accent-foreground text-xs">
                  {isBestValue ? 'Best Value' : 'Lowest Price'}
                </Badge>
              </div>
            )}
            <CardContent className="pt-6 pb-4 text-center space-y-3">
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Seats</span>
              </div>
              <div className="text-4xl font-extrabold text-foreground">{tier.seats}</div>
              <div className="space-y-1">
                <div className="text-lg font-semibold text-foreground">
                  ${tier.pricePerSeat.toFixed(2)}
                  <span className="text-sm font-normal text-muted-foreground">/seat</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  ${tier.totalPrice.toFixed(2)} total
                </div>
                {discountPercent > 0 && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    Save {discountPercent}%
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
