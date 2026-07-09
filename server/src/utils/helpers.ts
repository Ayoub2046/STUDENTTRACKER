export function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 80) return 'A-';
  if (percentage >= 75) return 'B+';
  if (percentage >= 70) return 'B';
  if (percentage >= 65) return 'B-';
  if (percentage >= 60) return 'C+';
  if (percentage >= 55) return 'C';
  if (percentage >= 50) return 'C-';
  if (percentage >= 45) return 'D+';
  if (percentage >= 40) return 'D';
  return 'F';
}

export function calculateGPA(percentage: number): number {
  if (percentage >= 90) return 4.0;
  if (percentage >= 85) return 4.0;
  if (percentage >= 80) return 3.7;
  if (percentage >= 75) return 3.3;
  if (percentage >= 70) return 3.0;
  if (percentage >= 65) return 2.7;
  if (percentage >= 60) return 2.3;
  if (percentage >= 55) return 2.0;
  if (percentage >= 50) return 1.7;
  if (percentage >= 45) return 1.3;
  if (percentage >= 40) return 1.0;
  return 0.0;
}

export function calculateAverage(marks: { obtained: number; max: number }[]): number {
  if (marks.length === 0) return 0;
  const totalObtained = marks.reduce((sum, m) => sum + m.obtained, 0);
  const totalMax = marks.reduce((sum, m) => sum + m.max, 0);
  if (totalMax === 0) return 0;
  return (totalObtained / totalMax) * 100;
}

export function calculateCGPA(semesters: { gpa: number; credits: number }[]): number {
  const totalCredits = semesters.reduce((sum, s) => sum + s.credits, 0);
  if (totalCredits === 0) return 0;
  const totalGradePoints = semesters.reduce((sum, s) => sum + s.gpa * s.credits, 0);
  return totalGradePoints / totalCredits;
}
