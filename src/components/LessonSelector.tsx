import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Period, Lesson, Reservation } from "@/lib/supabase";

interface LessonSelectorProps {
  periods: Period[];
  selectedLessons: Array<{ periodId: string; lessonNumber: number }>;
  onLessonChange: (lessons: Array<{ periodId: string; lessonNumber: number }>) => void;
  existingReservations?: Array<{ periodId: string; lessonNumber: number }>;
}

export const LessonSelector = ({ periods, selectedLessons, onLessonChange, existingReservations = [] }: LessonSelectorProps) => {
  const handleLessonToggle = (periodId: string, lessonNumber: number) => {
    // Verificar se a aula já está reservada
    const isReserved = existingReservations.some(
      r => r.periodId === periodId && r.lessonNumber === lessonNumber
    );
    
    if (isReserved) {
      // Não permitir selecionar aulas já reservadas
      return;
    }

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

  const isLessonReserved = (periodId: string, lessonNumber: number) => {
    return existingReservations.some(
      r => r.periodId === periodId && r.lessonNumber === lessonNumber
    );
  };

  const getSelectedCount = (periodId: string) => {
    return selectedLessons.filter(l => l.periodId === periodId).length;
  };

  const getReservedCount = (periodId: string) => {
    return existingReservations.filter(r => r.periodId === periodId).length;
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
                {getReservedCount(period.id) > 0 && ` (${getReservedCount(period.id)} já reservada${getReservedCount(period.id) > 1 ? 's' : ''})`}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              {period.lessons?.map((lesson) => {
                const reserved = isLessonReserved(period.id, lesson.lessonNumber);
                const selected = isLessonSelected(period.id, lesson.lessonNumber);
                
                return (
                  <div 
                    key={lesson.id} 
                    className={`flex items-center space-x-2 ${reserved ? 'opacity-50' : ''}`}
                    title={reserved ? 'Esta aula já está reservada' : ''}
                  >
                    <Checkbox
                      id={`lesson-${lesson.id}`}
                      checked={selected}
                      onCheckedChange={() => handleLessonToggle(period.id, lesson.lessonNumber)}
                      disabled={reserved}
                    />
                    <Label
                      htmlFor={`lesson-${lesson.id}`}
                      className={`text-sm flex-1 ${reserved ? 'cursor-not-allowed text-muted-foreground line-through' : 'cursor-pointer'}`}
                    >
                      {lesson.label}
                      {reserved && ' 🚫'}
                    </Label>
                  </div>
                );
              })}
            </div>
            {getReservedCount(period.id) > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                🚫 = Aula já reservada
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
