import { Worker, Job } from 'bullmq';
import { Server } from 'socket.io';
import { createRedisConnection } from '../config/redis';
import { Assignment } from '../models/Assignment';
import { generateQuestionPaper } from '../services/ai.service';
import { GenerationJobData } from '../types';

let ioInstance: Server | null = null;

function emitToAssignment(assignmentId: string, event: string, data: Record<string, unknown>): void {
  if (ioInstance) {
    ioInstance.to(`assignment:${assignmentId}`).emit(event, data);
  }
}

async function processAssignmentJob(job: Job<GenerationJobData>): Promise<void> {
  const { assignmentId, formData } = job.data;

  console.log(`📝 Processing assignment: ${assignmentId}`);

  try {
    // Update status to processing
    await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });

    emitToAssignment(assignmentId, 'generation:progress', {
      assignmentId,
      status: 'processing',
      message: 'Analyzing requirements...',
      progress: 10,
    });

    // Small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 1000));

    emitToAssignment(assignmentId, 'generation:progress', {
      assignmentId,
      status: 'processing',
      message: 'Generating questions with AI...',
      progress: 30,
    });

    // Generate the question paper
    const generatedPaper = await generateQuestionPaper(formData);

    emitToAssignment(assignmentId, 'generation:progress', {
      assignmentId,
      status: 'processing',
      message: 'Finalizing question paper...',
      progress: 80,
    });

    // Store result in MongoDB
    await Assignment.findByIdAndUpdate(assignmentId, {
      status: 'completed',
      generatedPaper,
      error: undefined,
    });

    emitToAssignment(assignmentId, 'generation:completed', {
      assignmentId,
      status: 'completed',
      message: 'Question paper generated successfully!',
      paper: generatedPaper,
      progress: 100,
    });

    console.log(`✅ Assignment completed: ${assignmentId}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`❌ Assignment failed: ${assignmentId}`, errorMessage);

    await Assignment.findByIdAndUpdate(assignmentId, {
      status: 'failed',
      error: errorMessage,
    });

    emitToAssignment(assignmentId, 'generation:failed', {
      assignmentId,
      status: 'failed',
      message: errorMessage,
      progress: 0,
    });

    throw error; // Re-throw so BullMQ can handle retries
  }
}

export function initWorker(io: Server): Worker<GenerationJobData> {
  ioInstance = io;

  const connection = createRedisConnection();

  const worker = new Worker<GenerationJobData>(
    'assessment-generation',
    async (job) => {
      await processAssignmentJob(job);
    },
    {
      connection: connection as any,
      concurrency: 3,
      limiter: {
        max: 10,
        duration: 60000, // Max 10 jobs per minute (rate limit for API)
      },
    }
  );

  worker.on('completed', (job) => {
    console.log(`🎉 Job ${job.id} completed for assignment: ${job.data.assignmentId}`);
  });

  worker.on('failed', (job, err) => {
    if (job) {
      console.error(`💥 Job ${job.id} failed for assignment: ${job.data.assignmentId}`, err.message);
    } else {
      console.error('💥 A job failed without job reference:', err.message);
    }
  });

  worker.on('error', (err) => {
    console.error('🔥 Worker error:', err);
  });

  console.log('🏗️  BullMQ worker started for assessment-generation queue');

  return worker;
}

export async function runAssignmentGenerationLocal(assignmentId: string, formData: any): Promise<void> {
  const mockJob = {
    data: { assignmentId, formData }
  } as any;

  console.log(`⚠️ Running generation locally/in-memory for assignment: ${assignmentId}`);
  await processAssignmentJob(mockJob).catch((err) => {
    console.error('❌ Local background generation failed:', err);
  });
}
