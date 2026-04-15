import type { Story } from '@/types';
import { mockStories } from './stories';
import { ethicalTheories } from './ethical-theories';

export { mockStories };

export const mockEthicalTheories = ethicalTheories;

export const mockDilemmaOfTheDay: Story = mockStories[0];
