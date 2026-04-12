'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, ChevronUp, ChevronDown, Save, Loader2 } from 'lucide-react';
import { createCurriculum } from '@/app/actions/curriculum';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import type { CurriculumModule, CurriculumItem } from '@/types';

export function CurriculumBuilder() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [modules, setModules] = useState<CurriculumModule[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addModule(): void {
    const newModule: CurriculumModule = {
      id: `mod-${Date.now()}`,
      title: '',
      description: '',
      order: modules.length,
      items: [],
    };
    setModules([...modules, newModule]);
  }

  function removeModule(moduleId: string): void {
    setModules(modules.filter((m) => m.id !== moduleId));
  }

  function updateModule(
    moduleId: string,
    field: keyof CurriculumModule,
    value: string
  ): void {
    setModules(
      modules.map((m) =>
        m.id === moduleId ? { ...m, [field]: value } : m
      )
    );
  }

  function moveModule(index: number, direction: 'up' | 'down'): void {
    const newModules = [...modules];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newModules.length) return;
    [newModules[index], newModules[swapIndex]] = [
      newModules[swapIndex],
      newModules[index],
    ];
    newModules.forEach((m, i) => (m.order = i));
    setModules(newModules);
  }

  function addItem(moduleId: string): void {
    const newItem: CurriculumItem = {
      id: `item-${Date.now()}`,
      type: 'story',
      referenceId: '',
      title: '',
      order: 0,
      isRequired: true,
    };
    setModules(
      modules.map((m) => {
        if (m.id !== moduleId) return m;
        const items = [...m.items, { ...newItem, order: m.items.length }];
        return { ...m, items };
      })
    );
  }

  function removeItem(moduleId: string, itemId: string): void {
    setModules(
      modules.map((m) => {
        if (m.id !== moduleId) return m;
        return { ...m, items: m.items.filter((i) => i.id !== itemId) };
      })
    );
  }

  function updateItem(
    moduleId: string,
    itemId: string,
    field: string,
    value: string | boolean
  ): void {
    setModules(
      modules.map((m) => {
        if (m.id !== moduleId) return m;
        return {
          ...m,
          items: m.items.map((i) =>
            i.id === itemId ? { ...i, [field]: value } : i
          ),
        };
      })
    );
  }

  function moveItem(
    moduleId: string,
    itemIndex: number,
    direction: 'up' | 'down'
  ): void {
    setModules(
      modules.map((m) => {
        if (m.id !== moduleId) return m;
        const newItems = [...m.items];
        const swapIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
        if (swapIndex < 0 || swapIndex >= newItems.length) return m;
        [newItems[itemIndex], newItems[swapIndex]] = [
          newItems[swapIndex],
          newItems[itemIndex],
        ];
        newItems.forEach((item, i) => (item.order = i));
        return { ...m, items: newItems };
      })
    );
  }

  async function handleSave(): Promise<void> {
    if (!user) return;
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    setError(null);

    const result = await createCurriculum({
      title: title.trim(),
      description: description.trim(),
      creatorId: user.uid,
      creatorName: user.displayName || user.email || 'Unknown',
      isPublic,
      modules,
      createdAt: new Date(),
    });

    setSaving(false);

    if (result.success) {
      router.push(`/curriculum/${result.data}`);
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-primary">Curriculum Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="curr-title">Title</Label>
            <Input
              id="curr-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Ethics in AI"
            />
          </div>
          <div>
            <Label htmlFor="curr-desc">Description</Label>
            <Textarea
              id="curr-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what students will learn..."
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="is-public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="is-public">Make publicly available</Label>
          </div>
        </CardContent>
      </Card>

      {modules.map((mod, modIndex) => (
        <Card key={mod.id} className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Module {modIndex + 1}</CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => moveModule(modIndex, 'up')}
                disabled={modIndex === 0}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => moveModule(modIndex, 'down')}
                disabled={modIndex === modules.length - 1}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeModule(mod.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={mod.title}
              onChange={(e) => updateModule(mod.id, 'title', e.target.value)}
              placeholder="Module title"
            />
            <Textarea
              value={mod.description}
              onChange={(e) =>
                updateModule(mod.id, 'description', e.target.value)
              }
              placeholder="Module description"
              rows={2}
            />

            <div className="space-y-3 pl-4 border-l-2 border-border">
              {mod.items.map((item, itemIndex) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-2 items-start sm:items-center p-2 rounded bg-muted/30"
                >
                  <Select
                    value={item.type}
                    onValueChange={(v) =>
                      updateItem(mod.id, item.id, 'type', v)
                    }
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="debate">Debate</SelectItem>
                      <SelectItem value="analysis">Analysis</SelectItem>
                      <SelectItem value="discussion">Discussion</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={item.title}
                    onChange={(e) =>
                      updateItem(mod.id, item.id, 'title', e.target.value)
                    }
                    placeholder="Item title"
                    className="flex-1"
                  />
                  <Input
                    value={item.referenceId}
                    onChange={(e) =>
                      updateItem(mod.id, item.id, 'referenceId', e.target.value)
                    }
                    placeholder="Reference ID"
                    className="w-[160px]"
                  />
                  <div className="flex items-center gap-1">
                    <Checkbox
                      checked={item.isRequired}
                      onCheckedChange={(v) =>
                        updateItem(mod.id, item.id, 'isRequired', !!v)
                      }
                    />
                    <span className="text-xs text-muted-foreground">Required</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => moveItem(mod.id, itemIndex, 'up')}
                      disabled={itemIndex === 0}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => moveItem(mod.id, itemIndex, 'down')}
                      disabled={itemIndex === mod.items.length - 1}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeItem(mod.id, item.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addItem(mod.id)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Item
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={addModule}>
          <Plus className="h-4 w-4 mr-2" />
          Add Module
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Curriculum
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
