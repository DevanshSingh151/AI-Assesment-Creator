import { FormData as AssessmentFormData, IAssignment } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export async function createAssignment(formData: AssessmentFormData): Promise<{ success: boolean; assignmentId: string; jobId: string; message: string }> {
  const body = new window.FormData();

  body.append('title', formData.title);
  body.append('subject', formData.subject);
  body.append('grade', formData.grade);
  body.append('dueDate', formData.dueDate);
  body.append('duration', formData.duration);
  body.append('numberOfQuestions', String(formData.numberOfQuestions));
  body.append('totalMarks', String(formData.totalMarks));
  body.append('additionalInstructions', formData.additionalInstructions);

  formData.questionTypes.forEach((type) => {
    body.append('questionTypes', type);
  });

  body.append('difficultyDistribution', JSON.stringify(formData.difficultyDistribution));

  if (formData.uploadedFile) {
    body.append('file', formData.uploadedFile);
  }

  const response = await fetch(`${API_BASE}/assignments`, {
    method: 'POST',
    body,
  });

  return handleResponse<{ success: boolean; assignmentId: string; jobId: string; message: string }>(response);
}

export async function getAssignments(): Promise<IAssignment[]> {
  const response = await fetch(`${API_BASE}/assignments`);
  const data = await handleResponse<{ success: boolean; assignments: IAssignment[] }>(response);
  return data.assignments;
}

export async function getAssignment(id: string): Promise<IAssignment> {
  const response = await fetch(`${API_BASE}/assignments/${id}`);
  const data = await handleResponse<{ success: boolean; assignment: IAssignment }>(response);
  return data.assignment;
}

export async function regenerateAssignment(id: string): Promise<{ success: boolean; jobId: string; message: string }> {
  const response = await fetch(`${API_BASE}/assignments/${id}/regenerate`, {
    method: 'POST',
  });
  return handleResponse<{ success: boolean; jobId: string; message: string }>(response);
}

export function getAssessmentPdfUrl(id: string): string {
  return `${API_BASE}/assignments/${id}/pdf`;
}

