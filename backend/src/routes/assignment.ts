import { Router, Request, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { Assignment } from '../models/Assignment';
import { assessmentQueue } from '../queues/queue';
import { generatePDF } from '../services/pdf.service';
import { runAssignmentGenerationLocal } from '../queues/worker';
import { CreateAssignmentDTO, GenerationJobData } from '../types';

const router = Router();

// Multer config for file uploads (in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      'text/plain',
      'text/csv',
      'text/markdown',
      'application/pdf',
      'application/json',
      'text/html',
    ];
    if (allowedMimeTypes.includes(file.mimetype) || file.originalname.match(/\.(txt|csv|md|json|html)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Only text-based files are allowed (txt, csv, md, json, html)'));
    }
  },
});

// Validation schema
const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subject: z.string().min(1, 'Subject is required').max(100),
  grade: z.string().min(1, 'Grade is required').max(50),
  dueDate: z.string().min(1, 'Due date is required'),
  duration: z.string().optional(),
  questionTypes: z.array(z.string()).min(1, 'At least one question type is required'),
  numberOfQuestions: z.number().int().min(1).max(100),
  totalMarks: z.number().int().min(1).max(500),
  difficultyDistribution: z
    .object({
      easy: z.number().min(0).max(100),
      medium: z.number().min(0).max(100),
      hard: z.number().min(0).max(100),
    })
    .optional(),
  additionalInstructions: z.string().max(2000).optional(),
  uploadedFileContent: z.string().optional(),
});

// Helper to queue job with BullMQ or fallback to local background execution if Redis is down
async function queueOrRunJob(assignmentId: string, formData: CreateAssignmentDTO, isRegen = false): Promise<string> {
  const jobData = { assignmentId, formData };
  const jobId = isRegen 
    ? `assignment-${assignmentId}-${Date.now()}` 
    : `assignment-${assignmentId}`;

  try {
    // Try to queue the job with a 1.5s timeout
    const queuePromise = assessmentQueue.add('generate', jobData, { jobId });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('BullMQ connection timeout')), 1500)
    );
    const job = await Promise.race([queuePromise, timeoutPromise]);
    console.log(`✅ Job successfully queued in BullMQ: ${job.id}`);
    return job.id || jobId;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️ BullMQ queuing failed (${errorMsg}), falling back to local background execution.`);
    // Run locally in background (do not await)
    runAssignmentGenerationLocal(assignmentId, formData);
    return `local-${assignmentId}-${Date.now()}`;
  }
}

// ─── GET /api/assignments ────────────────────────────────────
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      assignments,
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

// ─── POST /api/assignments ───────────────────────────────────
router.post('/', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    // Parse body — handle both JSON and form-data
    let body = req.body;

    // If sent as form-data, some fields may be strings that need parsing
    if (typeof body.questionTypes === 'string') {
      try {
        body.questionTypes = JSON.parse(body.questionTypes);
      } catch {
        body.questionTypes = body.questionTypes.split(',').map((s: string) => s.trim());
      }
    }
    if (typeof body.numberOfQuestions === 'string') {
      body.numberOfQuestions = parseInt(body.numberOfQuestions, 10);
    }
    if (typeof body.totalMarks === 'string') {
      body.totalMarks = parseInt(body.totalMarks, 10);
    }
    if (typeof body.difficultyDistribution === 'string') {
      try {
        body.difficultyDistribution = JSON.parse(body.difficultyDistribution);
      } catch {
        // ignore, will be validated below
      }
    }

    // Read uploaded file content if present
    if (req.file) {
      body.uploadedFileContent = req.file.buffer.toString('utf-8');
    }

    // Validate
    const validation = createAssignmentSchema.safeParse(body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        errors: validation.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }

    const formData: CreateAssignmentDTO = validation.data;

    // Create Assignment in MongoDB
    const assignment = await Assignment.create({
      title: formData.title,
      subject: formData.subject,
      grade: formData.grade,
      dueDate: formData.dueDate,
      duration: formData.duration,
      questionTypes: formData.questionTypes,
      numberOfQuestions: formData.numberOfQuestions,
      totalMarks: formData.totalMarks,
      difficultyDistribution: formData.difficultyDistribution,
      additionalInstructions: formData.additionalInstructions,
      uploadedFileContent: formData.uploadedFileContent,
      status: 'pending',
    });

    // Queue job with fallback
    const jobId = await queueOrRunJob(assignment._id.toString(), formData, false);

    // Update assignment with job ID
    assignment.jobId = jobId;
    await assignment.save();

    res.status(201).json({
      success: true,
      assignmentId: assignment._id.toString(),
      jobId,
      message: 'Assignment created. Question paper generation started.',
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

// ─── GET /api/assignments/:id ────────────────────────────────
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(404).json({
        success: false,
        error: 'Assignment not found',
      });
      return;
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      res.status(404).json({
        success: false,
        error: 'Assignment not found',
      });
      return;
    }

    res.json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

// ─── POST /api/assignments/:id/regenerate ────────────────────
router.post('/:id/regenerate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(404).json({
        success: false,
        error: 'Assignment not found',
      });
      return;
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      res.status(404).json({
        success: false,
        error: 'Assignment not found',
      });
      return;
    }

    // Reset assignment status
    assignment.status = 'pending';
    assignment.generatedPaper = undefined;
    assignment.error = undefined;
    await assignment.save();

    // Build form data from stored assignment
    const formData: CreateAssignmentDTO = {
      title: assignment.title,
      subject: assignment.subject,
      grade: assignment.grade,
      dueDate: assignment.dueDate,
      duration: assignment.duration,
      questionTypes: assignment.questionTypes,
      numberOfQuestions: assignment.numberOfQuestions,
      totalMarks: assignment.totalMarks,
      difficultyDistribution: assignment.difficultyDistribution,
      additionalInstructions: assignment.additionalInstructions,
      uploadedFileContent: assignment.uploadedFileContent,
    };

    // Queue job with fallback
    const jobId = await queueOrRunJob(assignment._id.toString(), formData, true);

    assignment.jobId = jobId;
    await assignment.save();

    res.json({
      success: true,
      jobId,
      message: 'Regeneration started.',
    });
  } catch (error) {
    console.error('Error regenerating assignment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

// ─── GET /api/assignments/:id/pdf ────────────────────────────
router.get('/:id/pdf', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(404).json({
        success: false,
        error: 'Assignment not found',
      });
      return;
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      res.status(404).json({
        success: false,
        error: 'Assignment not found',
      });
      return;
    }

    if (!assignment.generatedPaper) {
      res.status(400).json({
        success: false,
        error: 'Question paper has not been generated yet',
      });
      return;
    }

    const pdfBuffer = generatePDF(assignment.generatedPaper);

    const sanitizedTitle = assignment.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${sanitizedTitle}_Question_Paper.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length.toString());
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

export const assignmentRoutes = router;
