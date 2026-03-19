import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Period, Lesson } from "@/lib/supabase";

interface LessonSelectorProps {
  periods: Period[];
  selectedLessons: Array<{ periodId: string; lessonNumber: number }>;
  onLessonChange: (lessons: Array<{ periodId: string; lessonNumber: number }>) => void;
}

export const LessonSelector = ({ periods, selectedLessons, onLessonChange }: LessonSelectorProps) => {
  const handleLessonToggle = (periodId: string, lessonNumber: number) => {
    const isSelected = selectedLessons.some(
      l => l.periodId === periodId && l.lessonNumber === lessonNumber
    );

    if (isSelected) {
      // Remover aula da seleção
      onLessonChange(selectedLessons.filter(
        l => !(l.periodId === periodId && l.lessonNumber === lessonNumber)
      ));
    } else {
      // Adicionar aula à seleção
      onLessonChange([...selectedLessons, { periodId, lessonNumber }]);
    }
  };

  const isLessonSelected = (periodId: string, lessonNumber: number) => {
    return selectedLessons.some(
      l => l.periodId === periodId && l.lessonNumber === lessonNumber
    );
  };

  const getSelectedCount = (periodId: string) => {
    return selectedLessons.filter(l => l.periodId === periodId).length;
  };

  return (
    <div className="space-y-4">
      {periods.map((period) => (
        <Card key={period.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>{period.name}</span>
              <span className="text-sm font-normal text-muted-foreground">
                {getSelectedCount(period.id)} de {period.lessons?.length || 0} aulas selecionadas
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              {period.lessons?.map((lesson) => (
                <div key={lesson.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`lesson-${lesson.id}`}
                    checked={isLessonSelected(period.id, lesson.lessonNumber)}
                    onCheckedChange={() => handleLessonToggle(period.id, lesson.lessonNumber)}
                  />
                  <Label
                    htmlFor={`lesson-${lesson.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {lesson.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
