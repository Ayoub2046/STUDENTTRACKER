import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { calculateAverage, calculateGPA, calculateGrade, calculateCGPA } from '../utils/helpers';

export async function getDashboard(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const now = new Date();
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [semesters, subjects, assignments, attendance, assessments, skills, goals, sessions, events] = await Promise.all([
      prisma.semester.findMany({ where: { userId }, orderBy: { year: 'desc' } }),
      prisma.subject.findMany({ where: { userId }, include: { _count: { select: { assignments: true, assessments: true, attendance: true } } } }),
      prisma.assignment.findMany({ where: { userId }, orderBy: { dueDate: 'asc' } }),
      prisma.attendance.findMany({ where: { userId } }),
      prisma.assessment.findMany({ where: { userId } }),
      prisma.skill.findMany({ where: { userId } }),
      prisma.goal.findMany({ where: { userId, status: 'active' } }),
      prisma.studySession.findMany({ where: { userId, date: { gte: startOfMonth } } }),
      prisma.calendarEvent.findMany({ where: { userId, startDate: { gte: now } }, take: 5, orderBy: { startDate: 'asc' } })
    ]);

    const totalCredits = semesters.reduce((s, sem) => s + sem.credits, 0);
    const currentSemester = semesters.find(s => s.status === 'active');
    const overallGPA = semesters.length > 0 ? semesters.reduce((s, sem) => s + sem.gpa, 0) / semesters.length : 0;
    const cgpa = calculateCGPA(semesters.map(s => ({ gpa: s.gpa, credits: s.credits })));

    const presentCount = attendance.filter(a => a.status === 'present').length;
    const attendancePercent = attendance.length > 0 ? (presentCount / attendance.length) * 100 : 0;

    const pendingAssignments = assignments.filter(a => a.status === 'pending').length;
    const upcomingExams = events.filter(e => e.category === 'exam').length;

    const skillProgress = skills.length > 0 ? skills.reduce((s, sk) => s + sk.progress, 0) / skills.length : 0;

    const completions = assignments.filter(a => a.status === 'completed').length + goals.filter(g => g.status === 'completed').length;
    const totalStudyHours = sessions.reduce((s, ses) => s + ses.duration, 0);

    const weekSessions = sessions.filter(s => s.date >= startOfWeek);
    const weeklyHours = weekSessions.reduce((s, ses) => s + ses.duration, 0);

    const recentActivity = [
      ...assignments.slice(0, 5).map(a => ({ id: a.id, type: 'assignment', title: a.title, date: a.updatedAt, status: a.status })),
      ...sessions.slice(0, 5).map(s => ({ id: s.id, type: 'study', title: `Studied ${s.duration} min`, date: s.date })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    const monthlyProgress = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(now.getFullYear(), i, 1);
      const monthSessions = sessions.filter(s => s.date.getMonth() === i && s.date.getFullYear() === now.getFullYear());
      const hours = monthSessions.reduce((s, ses) => s + ses.duration, 0);
      return { month: month.toLocaleString('default', { month: 'short' }), hours: Math.round(hours / 60) };
    });

    res.json({
      currentSemester,
      overallGPA: Math.round(overallGPA * 100) / 100,
      cgpa: Math.round(cgpa * 100) / 100,
      overallAverage: semesters.length > 0 ? Math.round(semesters.reduce((s, sem) => s + sem.average, 0) / semesters.length * 100) / 100 : 0,
      totalCredits,
      completedCredits: totalCredits,
      subjects: subjects.length,
      pendingAssignments,
      upcomingExams,
      attendancePercent: Math.round(attendancePercent * 100) / 100,
      skillProgress: Math.round(skillProgress * 100) / 100,
      currentStreak: 0,
      todayTasks: assignments.filter(a => {
        if (!a.dueDate) return false;
        return new Date(a.dueDate).toDateString() === now.toDateString() && a.status === 'pending';
      }).length,
      weeklyHours: Math.round(weeklyHours / 60),
      totalStudyHours: Math.round(totalStudyHours / 60),
      completions,
      recentActivity: recentActivity.slice(0, 5),
      monthlyProgress,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
}

export async function getSemesters(req: AuthRequest, res: Response) {
  try {
    const semesters = await prisma.semester.findMany({
      where: { userId: req.userId },
      orderBy: { year: 'desc' },
      include: { _count: { select: { subjects: true } } }
    });
    res.json(semesters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch semesters' });
  }
}

export async function createSemester(req: AuthRequest, res: Response) {
  try {
    const { name, year, status, startDate, endDate } = req.body;
    const semester = await prisma.semester.create({
      data: { userId: req.userId!, name, year: parseInt(year), status, startDate: startDate ? new Date(startDate) : null, endDate: endDate ? new Date(endDate) : null }
    });
    res.status(201).json(semester);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create semester' });
  }
}

export async function updateSemester(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;
    if (data.year) data.year = parseInt(data.year);
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    const semester = await prisma.semester.update({ where: { id, userId: req.userId }, data });
    res.json(semester);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update semester' });
  }
}

export async function deleteSemester(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.semester.delete({ where: { id, userId: req.userId } });
    res.json({ message: 'Semester deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete semester' });
  }
}

export async function getSubjects(req: AuthRequest, res: Response) {
  try {
    const subjects = await prisma.subject.findMany({
      where: { userId: req.userId },
      include: { semester: { select: { name: true } }, teacher: { select: { name: true } }, _count: { select: { assessments: true, assignments: true, attendance: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
}

export async function createSubject(req: AuthRequest, res: Response) {
  try {
    const { name, code, credits, semesterId, teacherId, description, color } = req.body;
    if (!name || !semesterId) {
      return res.status(400).json({ error: 'Subject name and semester are required' });
    }
    const semester = await prisma.semester.findFirst({ where: { id: semesterId, userId: req.userId } });
    if (!semester) {
      return res.status(400).json({ error: 'Invalid semester' });
    }
    const subject = await prisma.subject.create({
      data: {
        userId: req.userId!,
        name,
        code: code || null,
        credits: credits ? parseInt(credits) : 3,
        semesterId,
        teacherId: teacherId || null,
        description: description || null,
        color: color || '#6366f1'
      }
    });
    await prisma.semester.update({
      where: { id: semesterId },
      data: { credits: { increment: subject.credits } }
    });
    res.status(201).json(subject);
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
}

export async function updateSubject(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;
    if (data.credits) data.credits = parseInt(data.credits);
    const subject = await prisma.subject.update({ where: { id, userId: req.userId }, data });
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subject' });
  }
}

export async function deleteSubject(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.subject.delete({ where: { id, userId: req.userId } });
    res.json({ message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subject' });
  }
}

export async function getTeachers(req: AuthRequest, res: Response) {
  try {
    const teachers = await prisma.teacher.findMany({
      where: { userId: req.userId },
      include: { _count: { select: { subjects: true } } },
      orderBy: { name: 'asc' }
    });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
}

export async function createTeacher(req: AuthRequest, res: Response) {
  try {
    const { name, department, email, phone, office, notes, color } = req.body;
    if (!name) return res.status(400).json({ error: 'Teacher name is required' });
    const teacher = await prisma.teacher.create({
      data: { userId: req.userId!, name, department: department || null, email: email || null, phone: phone || null, office: office || null, notes: notes || null, color: color || '#8b5cf6' }
    });
    res.status(201).json(teacher);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create teacher' });
  }
}

export async function updateTeacher(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, department, email, phone, office, notes, color } = req.body;
    const teacher = await prisma.teacher.update({
      where: { id, userId: req.userId },
      data: { name, department: department || null, email: email || null, phone: phone || null, office: office || null, notes: notes || null, color: color || undefined }
    });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update teacher' });
  }
}

export async function deleteTeacher(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.teacher.delete({ where: { id, userId: req.userId } });
    res.json({ message: 'Teacher deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
}

export async function getAssessments(req: AuthRequest, res: Response) {
  try {
    const { subjectId } = req.params;
    const assessments = await prisma.assessment.findMany({
      where: { userId: req.userId, subjectId },
      orderBy: { date: 'desc' }
    });
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
}

export async function createAssessment(req: AuthRequest, res: Response) {
  try {
    const { subjectId, type, maxMarks, obtainedMarks, comments, date } = req.body;
    const max = parseFloat(maxMarks);
    const obtained = parseFloat(obtainedMarks);
    const percentage = max > 0 ? (obtained / max) * 100 : 0;
    const grade = calculateGrade(percentage);

    const assessment = await prisma.assessment.create({
      data: {
        userId: req.userId!, subjectId, type,
        maxMarks: max, obtainedMarks: obtained,
        percentage: Math.round(percentage * 100) / 100,
        grade, comments,
        date: date ? new Date(date) : new Date()
      }
    });

    const assessments = await prisma.assessment.findMany({ where: { userId: req.userId, subjectId } });
    const avg = calculateAverage(assessments.map(a => ({ obtained: a.obtainedMarks, max: a.maxMarks })));
    const gpa = calculateGPA(avg);

    await prisma.subject.update({
      where: { id: subjectId },
      data: { average: Math.round(avg * 100) / 100, grade: calculateGrade(avg), gpaPoint: Math.round(gpa * 100) / 100 }
    });

    if (avg > 0) {
      const semSubjects = await prisma.subject.findMany({ where: { semesterId: (await prisma.subject.findUnique({ where: { id: subjectId } }))?.semesterId } });
      const semAvg = semSubjects.length > 0 ? semSubjects.reduce((s, sub) => s + sub.average, 0) / semSubjects.length : 0;
      const semGpa = calculateGPA(semAvg);
      const semCredits = semSubjects.reduce((s, sub) => s + sub.credits, 0);
      await prisma.semester.updateMany({
        where: { id: (await prisma.subject.findUnique({ where: { id: subjectId } }))?.semesterId },
        data: { average: Math.round(semAvg * 100) / 100, gpa: Math.round(semGpa * 100) / 100, credits: semCredits }
      });
    }

    res.status(201).json(assessment);
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
}

export async function updateAssessment(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { subjectId, type, maxMarks, obtainedMarks, grade, comments, date } = req.body;
    const data: Record<string, any> = { subjectId, type, comments: comments || null, grade: grade || null };
    if (maxMarks != null) data.maxMarks = parseFloat(maxMarks);
    if (obtainedMarks != null) {
      data.obtainedMarks = parseFloat(obtainedMarks);
      const max = parseFloat(maxMarks) || 100;
      const obtained = parseFloat(obtainedMarks) || 0;
      data.percentage = max > 0 ? Math.round((obtained / max) * 10000) / 100 : 0;
      data.grade = calculateGrade(data.percentage);
    }
    if (date) data.date = new Date(date);
    const assessment = await prisma.assessment.update({ where: { id, userId: req.userId }, data });
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update assessment' });
  }
}

export async function deleteAssessment(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.assessment.delete({ where: { id, userId: req.userId } });
    res.json({ message: 'Assessment deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete assessment' });
  }
}

export async function getAttendance(req: AuthRequest, res: Response) {
  try {
    const { subjectId } = req.params;
    const records = await prisma.attendance.findMany({
      where: { userId: req.userId, subjectId },
      orderBy: { date: 'desc' }
    });

    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const excused = records.filter(r => r.status === 'excused').length;
    const total = records.length;
    const percentage = total > 0 ? ((present + late) / total) * 100 : 0;

    res.json({ records, stats: { present, absent, late, excused, total, percentage: Math.round(percentage * 100) / 100 } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
}

export async function createAttendance(req: AuthRequest, res: Response) {
  try {
    const { subjectId, status, date, notes } = req.body;
    const record = await prisma.attendance.create({
      data: { userId: req.userId!, subjectId, status, date: date ? new Date(date) : new Date(), notes }
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create attendance' });
  }
}

export async function updateAttendance(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { subjectId, date, status, notes } = req.body;
    const record = await prisma.attendance.update({
      where: { id, userId: req.userId },
      data: { subjectId, date: date ? new Date(date) : undefined, status, notes: notes || null }
    });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update attendance' });
  }
}

export async function deleteAttendance(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.attendance.delete({ where: { id, userId: req.userId } });
    res.json({ message: 'Attendance deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete attendance' });
  }
}

export async function getAssignments(req: AuthRequest, res: Response) {
  try {
    const assignments = await prisma.assignment.findMany({
      where: { userId: req.userId },
      include: { subject: { select: { name: true, color: true } } },
      orderBy: { dueDate: 'asc' }
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
}

export async function createAssignment(req: AuthRequest, res: Response) {
  try {
    const { title, description, dueDate, priority, status, subjectId } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const assignment = await prisma.assignment.create({
      data: {
        userId: req.userId!,
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'medium',
        status: status || 'pending',
        subjectId: subjectId || null
      }
    });
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
}

export async function updateAssignment(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, description, dueDate, priority, status, subjectId } = req.body;
    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description || null;
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
    if (priority !== undefined) data.priority = priority;
    if (status !== undefined) data.status = status;
    if (subjectId !== undefined) data.subjectId = subjectId || null;
    const assignment = await prisma.assignment.update({ where: { id, userId: req.userId }, data });
    res.json(assignment);
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
}

export async function deleteAssignment(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.assignment.delete({ where: { id, userId: req.userId } });
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
}

export async function getProjects(req: AuthRequest, res: Response) {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

export async function createProject(req: AuthRequest, res: Response) {
  try {
    const { title, description, images, video, github, liveDemo, technologies, status } = req.body;
    if (!title) return res.status(400).json({ error: 'Project title is required' });
    const project = await prisma.project.create({
      data: { userId: req.userId!, title, description: description || null, images: images || null, video: video || null, github: github || null, liveDemo: liveDemo || null, technologies: technologies || null, status: status || 'in-progress' }
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
}

export async function updateProject(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, description, images, video, github, liveDemo, technologies, status } = req.body;
    const project = await prisma.project.update({
      where: { id, userId: req.userId },
      data: { title, description: description || null, images: images || null, video: video || null, github: github || null, liveDemo: liveDemo || null, technologies: technologies || null, status: status || undefined }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
}

export async function deleteProject(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.project.delete({ where: { id, userId: req.userId } });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
}

export async function getResearch(req: AuthRequest, res: Response) {
  try {
    const research = await prisma.research.findMany({
      where: { userId: req.userId },
      orderBy: { year: 'desc' }
    });
    res.json(research);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch research' });
  }
}

export async function createResearch(req: AuthRequest, res: Response) {
  try {
    const { title, type, description, authors, journal, doi, pdf, awards, year, status } = req.body;
    if (!title || !type) return res.status(400).json({ error: 'Title and type are required' });
    const research = await prisma.research.create({
      data: { userId: req.userId!, title, type, description: description || null, authors: authors || null, journal: journal || null, doi: doi || null, pdf: pdf || null, awards: awards || null, year: year ? parseInt(year) : null, status: status || 'published' }
    });
    res.status(201).json(research);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create research' });
  }
}

export async function updateResearch(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, type, description, authors, journal, doi, pdf, awards, year, status } = req.body;
    const research = await prisma.research.update({
      where: { id, userId: req.userId },
      data: { title, type, description: description || null, authors: authors || null, journal: journal || null, doi: doi || null, pdf: pdf || null, awards: awards || null, year: year ? parseInt(year) : null, status: status || undefined }
    });
    res.json(research);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update research' });
  }
}

export async function deleteResearch(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.research.delete({ where: { id, userId: req.userId } });
    res.json({ message: 'Research deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete research' });
  }
}

export async function getCertificates(req: AuthRequest, res: Response) {
  try {
    const certificates = await prisma.certificate.findMany({
      where: { userId: req.userId },
      orderBy: { issueDate: 'desc' }
    });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
}

export async function createCertificate(req: AuthRequest, res: Response) {
  try {
    const { name, issuer, description, issueDate, expiryDate, credentialId, url, file } = req.body;
    if (!name || !issuer) return res.status(400).json({ error: 'Name and issuer are required' });
    const certificate = await prisma.certificate.create({
      data: {
        userId: req.userId!, name, issuer,
        description: description || null,
        issueDate: issueDate ? new Date(issueDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        credentialId: credentialId || null, url: url || null, file: file || null
      }
    });
    res.status(201).json(certificate);
  } catch (error) {
    console.error('Create certificate error:', error);
    res.status(500).json({ error: 'Failed to create certificate' });
  }
}

export async function updateCertificate(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, issuer, description, issueDate, expiryDate, credentialId, url, file } = req.body;
    const certificate = await prisma.certificate.update({
      where: { id, userId: req.userId },
      data: { name, issuer, description: description || null, issueDate: issueDate ? new Date(issueDate) : null, expiryDate: expiryDate ? new Date(expiryDate) : null, credentialId: credentialId || null, url: url || null, file: file || null }
    });
    res.json(certificate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update certificate' });
  }
}

export async function deleteCertificate(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.certificate.delete({ where: { id, userId: req.userId } });
    res.json({ message: 'Certificate deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete certificate' });
  }
}

export async function getSkills(req: AuthRequest, res: Response) {
  try {
    const skills = await prisma.skill.findMany({
      where: { userId: req.userId },
      orderBy: { progress: 'desc' }
    });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
}

export async function createSkill(req: AuthRequest, res: Response) {
  try {
    const { name, category, currentLevel, targetLevel, deadline, milestone } = req.body;
    if (!name || !category) return res.status(400).json({ error: 'Name and category are required' });
    const cl = parseInt(currentLevel || '0');
    const tl = parseInt(targetLevel || '100');
    const skill = await prisma.skill.create({
      data: {
        userId: req.userId!, name, category,
        currentLevel: cl, targetLevel: tl,
        progress: tl > 0 ? Math.round((cl / tl) * 10000) / 100 : 0,
        deadline: deadline ? new Date(deadline) : null,
        milestone: milestone || null
      }
    });
    res.status(201).json(skill);
  } catch (error) {
    console.error('Create skill error:', error);
    res.status(500).json({ error: 'Failed to create skill' });
  }
}

export async function updateSkill(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, category, currentLevel, targetLevel, deadline, milestone } = req.body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (category !== undefined) data.category = category;
    if (currentLevel !== undefined) data.currentLevel = parseInt(currentLevel);
    if (targetLevel !== undefined) data.targetLevel = parseInt(targetLevel);
    if (deadline !== undefined) data.deadline = deadline ? new Date(deadline) : null;
    if (milestone !== undefined) data.milestone = milestone || null;
    if (data.currentLevel !== undefined && data.targetLevel !== undefined) {
      data.progress = data.targetLevel > 0 ? Math.round((data.currentLevel / data.targetLevel) * 10000) / 100 : 0;
    } else if (currentLevel !== undefined || targetLevel !== undefined) {
      const skill = await prisma.skill.findUnique({ where: { id } });
      if (skill) {
        const cl = currentLevel !== undefined ? parseInt(currentLevel) : skill.currentLevel;
        const tl = targetLevel !== undefined ? parseInt(targetLevel) : skill.targetLevel;
        data.progress = tl > 0 ? Math.round((cl / tl) * 10000) / 100 : 0;
      }
    }
    const skill = await prisma.skill.update({ where: { id, userId: req.userId }, data });
    res.json(skill);
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({ error: 'Failed to update skill' });
  }
}

export async function deleteSkill(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.skill.delete({ where: { id, userId: req.userId } });
    res.json({ message: 'Skill deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete skill' });
  }
}

export async function getGoals(req: AuthRequest, res: Response) {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
}

export async function createGoal(req: AuthRequest, res: Response) {
  try {
    const { title, description, category, status, targetDate } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const goal = await prisma.goal.create({
      data: {
        userId: req.userId!, title,
        description: description || null,
        category: category || 'daily',
        status: status || 'active',
        targetDate: targetDate ? new Date(targetDate) : null
      }
    });
    res.status(201).json(goal);
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
}

export async function updateGoal(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, description, category, status, targetDate } = req.body;
    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description || null;
    if (category !== undefined) data.category = category;
    if (status !== undefined) data.status = status;
    if (targetDate !== undefined) data.targetDate = targetDate ? new Date(targetDate) : null;
    if (data.status === 'completed') data.completedAt = new Date();
    const goal = await prisma.goal.update({ where: { id, userId: req.userId }, data });
    res.json(goal);
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
}

export async function deleteGoal(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.goal.delete({ where: { id, userId: req.userId } });
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete goal' });
  }
}

export async function getNotes(req: AuthRequest, res: Response) {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: req.userId },
      include: { subject: { select: { name: true, color: true } } },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }]
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
}

export async function createNote(req: AuthRequest, res: Response) {
  try {
    const { title, content, tags, subjectId, isPinned } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const note = await prisma.note.create({
      data: {
        userId: req.userId!,
        title,
        content: content || null,
        tags: tags || null,
        subjectId: subjectId || null,
        isPinned: isPinned || false
      }
    });
    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
}

export async function updateNote(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, content, tags, subjectId, isPinned } = req.body;
    const data: any = {};
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content || null;
    if (tags !== undefined) data.tags = tags || null;
    if (subjectId !== undefined) data.subjectId = subjectId || null;
    if (isPinned !== undefined) data.isPinned = isPinned;
    const note = await prisma.note.update({ where: { id, userId: req.userId }, data });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
}

export async function deleteNote(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.note.delete({ where: { id, userId: req.userId } });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
}

export async function getJournal(req: AuthRequest, res: Response) {
  try {
    const journals = await prisma.journal.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' }
    });
    res.json(journals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
}

export async function createJournal(req: AuthRequest, res: Response) {
  try {
    const { title, content, mood, category, date } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const journal = await prisma.journal.create({
      data: {
        userId: req.userId!, title,
        content: content || null, mood: mood || null,
        category: category || 'reflection',
        date: date ? new Date(date) : new Date()
      }
    });
    res.status(201).json(journal);
  } catch (error) {
    console.error('Create journal error:', error);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
}

export async function updateJournal(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, content, mood, category, date } = req.body;
    const data: any = {};
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content || null;
    if (mood !== undefined) data.mood = mood || null;
    if (category !== undefined) data.category = category;
    if (date !== undefined) data.date = date ? new Date(date) : null;
    const journal = await prisma.journal.update({ where: { id, userId: req.userId }, data });
    res.json(journal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update journal entry' });
  }
}

export async function deleteJournal(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.journal.delete({ where: { id, userId: req.userId } });
    res.json({ message: 'Journal entry deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
}

export async function getCareer(req: AuthRequest, res: Response) {
  try {
    const entries = await prisma.careerEntry.findMany({
      where: { userId: req.userId },
      orderBy: { startDate: 'desc' }
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch career entries' });
  }
}

export async function createCareer(req: AuthRequest, res: Response) {
  try {
    const { type, title, description, organization, location, startDate, endDate, isCurrent, url } = req.body;
    if (!type || !title) return res.status(400).json({ error: 'Type and title are required' });
    const entry = await prisma.careerEntry.create({
      data: {
        userId: req.userId!,
        type, title,
        description: description || null,
        organization: organization || null,
        location: location || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isCurrent: isCurrent || false,
        url: url || null
      }
    });
    res.status(201).json(entry);
  } catch (error) {
    console.error('Create career error:', error);
    res.status(500).json({ error: 'Failed to create career entry' });
  }
}

export async function updateCareer(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { type, title, description, organization, location, startDate, endDate, isCurrent, url } = req.body;
    const data: any = {};
    if (type !== undefined) data.type = type;
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description || null;
    if (organization !== undefined) data.organization = organization || null;
    if (location !== undefined) data.location = location || null;
    if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;
    if (isCurrent !== undefined) data.isCurrent = isCurrent;
    if (url !== undefined) data.url = url || null;
    const entry = await prisma.careerEntry.update({ where: { id, userId: req.userId }, data });
    res.json(entry);
  } catch (error) {
    console.error('Update career error:', error);
    res.status(500).json({ error: 'Failed to update career entry' });
  }
}

export async function deleteCareer(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.careerEntry.delete({ where: { id, userId: req.userId } });
    res.json({ message: 'Career entry deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete career entry' });
  }
}

export async function getEvents(req: AuthRequest, res: Response) {
  try {
    const events = await prisma.calendarEvent.findMany({
      where: { userId: req.userId },
      orderBy: { startDate: 'asc' }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
}

export async function createEvent(req: AuthRequest, res: Response) {
  try {
    const { title, description, startDate, endDate, allDay, color, category, recurring } = req.body;
    if (!title || !startDate) return res.status(400).json({ error: 'Title and start date are required' });
    const event = await prisma.calendarEvent.create({
      data: {
        userId: req.userId!, title,
        description: description || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        allDay: allDay || false,
        color: color || '#6366f1',
        category: category || 'general',
        recurring: recurring || null
      }
    });
    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
}

export async function updateEvent(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate, allDay, color, category, recurring } = req.body;
    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description || null;
    if (startDate !== undefined) data.startDate = new Date(startDate);
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;
    if (allDay !== undefined) data.allDay = allDay;
    if (color !== undefined) data.color = color;
    if (category !== undefined) data.category = category;
    if (recurring !== undefined) data.recurring = recurring || null;
    const event = await prisma.calendarEvent.update({ where: { id, userId: req.userId }, data });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
}

export async function deleteEvent(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.calendarEvent.delete({ where: { id, userId: req.userId } });
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
}

export async function getNotifications(req: AuthRequest, res: Response) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

export async function markNotificationRead(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.notification.update({ where: { id, userId: req.userId }, data: { isRead: true } });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
}

export async function markAllNotificationsRead(req: AuthRequest, res: Response) {
  try {
    await prisma.notification.updateMany({ where: { userId: req.userId, isRead: false }, data: { isRead: true } });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
}

export async function getFiles(req: AuthRequest, res: Response) {
  try {
    const files = await prisma.file.findMany({
      where: { userId: req.userId },
      include: { subject: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
}

export async function uploadFile(req: AuthRequest, res: Response) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const file = await prisma.file.create({
      data: {
        userId: req.userId!,
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`,
        subjectId: req.body.subjectId || null,
        folder: req.body.folder || 'general'
      }
    });
    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload file' });
  }
}

export async function deleteFile(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.file.delete({ where: { id, userId: req.userId } });
    res.json({ message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
}

export async function getStudySessions(req: AuthRequest, res: Response) {
  try {
    const sessions = await prisma.studySession.findMany({
      where: { userId: req.userId },
      include: { subject: { select: { name: true, color: true } } },
      orderBy: { date: 'desc' }
    });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch study sessions' });
  }
}

export async function createStudySession(req: AuthRequest, res: Response) {
  try {
    const { subjectId, duration, type, notes, date } = req.body;
    if (!duration) return res.status(400).json({ error: 'Duration is required' });
    const session = await prisma.studySession.create({
      data: {
        userId: req.userId!,
        subjectId: subjectId || null,
        duration: parseInt(duration),
        type: type || 'study',
        notes: notes || null,
        date: date ? new Date(date) : new Date()
      }
    });
    res.status(201).json(session);
  } catch (error) {
    console.error('Create study session error:', error);
    res.status(500).json({ error: 'Failed to create study session' });
  }
}

export async function getVoiceNotes(req: AuthRequest, res: Response) {
  try {
    const notes = await prisma.voiceNote.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch voice notes' });
  }
}

export async function createVoiceNote(req: AuthRequest, res: Response) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file uploaded' });
    const { title, transcript } = req.body;
    const note = await prisma.voiceNote.create({
      data: { userId: req.userId!, title, transcript: transcript || null, fileUrl: `/uploads/${req.file.filename}`, duration: parseInt(req.body.duration || '0') }
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create voice note' });
  }
}

export async function deleteVoiceNote(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.voiceNote.delete({ where: { id, userId: req.userId } });
    res.json({ message: 'Voice note deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete voice note' });
  }
}

export async function getAnalytics(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const [semesters, subjects, assessments, attendance, skills, sessions, assignments] = await Promise.all([
      prisma.semester.findMany({ where: { userId }, orderBy: { year: 'asc' } }),
      prisma.subject.findMany({ where: { userId }, include: { assessments: true } }),
      prisma.assessment.findMany({ where: { userId } }),
      prisma.attendance.findMany({ where: { userId } }),
      prisma.skill.findMany({ where: { userId } }),
      prisma.studySession.findMany({ where: { userId }, orderBy: { date: 'asc' } }),
      prisma.assignment.findMany({ where: { userId } })
    ]);

    const gpaTrend = semesters.map(s => ({ name: s.name, gpa: s.gpa, cgpa: s.cgpa, average: s.average }));
    const subjectComparison = subjects.map(s => ({ name: s.name, average: s.average, credits: s.credits, color: s.color }));
    const attendanceStats = [
      { name: 'Present', value: attendance.filter(a => a.status === 'present').length },
      { name: 'Absent', value: attendance.filter(a => a.status === 'absent').length },
      { name: 'Late', value: attendance.filter(a => a.status === 'late').length },
      { name: 'Excused', value: attendance.filter(a => a.status === 'excused').length },
    ];

    const studyHours = sessions.reduce<{ name: string; hours: number }[]>((acc, s) => {
      const month = s.date.toLocaleString('default', { month: 'short' });
      const existing = acc.find(a => a.name === month);
      if (existing) existing.hours += s.duration / 60;
      else acc.push({ name: month, hours: s.duration / 60 });
      return acc;
    }, []);

    const taskCompletion = {
      completed: assignments.filter(a => a.status === 'completed').length,
      pending: assignments.filter(a => a.status === 'pending').length,
      overdue: assignments.filter(a => a.status === 'overdue').length,
    };

    const skillGrowth = skills.map(s => ({ name: s.name, currentLevel: s.currentLevel, targetLevel: s.targetLevel, progress: s.progress }));

    res.json({
      gpaTrend,
      cgpa: semesters.length > 0 ? calculateCGPA(semesters.map(s => ({ gpa: s.gpa, credits: s.credits }))) : 0,
      subjectComparison,
      attendanceStats,
      studyHours,
      taskCompletion,
      skillGrowth,
      totalStudyHours: Math.round(sessions.reduce((s, ses) => s + ses.duration, 0) / 60),
      totalAssessments: assessments.length,
      averageScore: assessments.length > 0 ? assessments.reduce((s, a) => s + a.percentage, 0) / assessments.length : 0,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

export async function getAchievements(req: AuthRequest, res: Response) {
  try {
    const achievements = await prisma.achievement.findMany({
      where: { userId: req.userId },
      orderBy: { unlockedAt: 'desc' }
    });
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
}

export async function getReminders(req: AuthRequest, res: Response) {
  try {
    const reminders = await prisma.reminder.findMany({
      where: { userId: req.userId },
      orderBy: { dueDate: 'asc' }
    });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
}

export async function createReminder(req: AuthRequest, res: Response) {
  try {
    const { title, message, type, dueDate } = req.body;
    if (!title || !dueDate) return res.status(400).json({ error: 'Title and due date are required' });
    const reminder = await prisma.reminder.create({
      data: {
        userId: req.userId!,
        title,
        message: message || null,
        type: type || 'general',
        dueDate: new Date(dueDate)
      }
    });
    res.status(201).json(reminder);
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
}

export async function globalSearch(req: AuthRequest, res: Response) {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') return res.json([]);

    const searchTerm = q;

    const [subjects, assignments, notes, projects, teachers] = await Promise.all([
      prisma.subject.findMany({ where: { userId: req.userId, name: { contains: searchTerm } }, take: 5 }),
      prisma.assignment.findMany({ where: { userId: req.userId, title: { contains: searchTerm } }, take: 5 }),
      prisma.note.findMany({ where: { userId: req.userId, title: { contains: searchTerm } }, take: 5 }),
      prisma.project.findMany({ where: { userId: req.userId, title: { contains: searchTerm } }, take: 5 }),
      prisma.teacher.findMany({ where: { userId: req.userId, name: { contains: searchTerm } }, take: 5 }),
    ]);

    res.json({ subjects, assignments, notes, projects, teachers });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
}

export async function getChatHistory(req: AuthRequest, res: Response) {
  try {
    const { sessionId } = req.params;
    const messages = await prisma.chatHistory.findMany({
      where: { userId: req.userId, sessionId },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
}

export async function saveChatMessage(req: AuthRequest, res: Response) {
  try {
    const { role, content, sessionId } = req.body;
    const message = await prisma.chatHistory.create({
      data: { userId: req.userId!, role, content, sessionId }
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save message' });
  }
}

export async function getStats(req: AuthRequest, res: Response) {
  try {
    const [
      userCount, subjectCount, semesterCount, assessmentCount,
      assignmentCount, projectCount, skillCount, certificateCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subject.count(),
      prisma.semester.count(),
      prisma.assessment.count(),
      prisma.assignment.count(),
      prisma.project.count(),
      prisma.skill.count(),
      prisma.certificate.count(),
    ]);
    res.json({
      users: userCount, subjects: subjectCount, semesters: semesterCount,
      assessments: assessmentCount, assignments: assignmentCount,
      projects: projectCount, skills: skillCount, certificates: certificateCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
}
