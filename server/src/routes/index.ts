import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import * as auth from '../controllers/auth';
import * as ctrl from '../controllers/index';

const router = Router();

router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.post('/auth/refresh', auth.refreshToken);
router.post('/auth/forgot-password', auth.forgotPassword);
router.post('/auth/reset-password', auth.resetPassword);

router.get('/auth/profile', authenticate, auth.getProfile);
router.put('/auth/profile', authenticate, auth.updateProfile);
router.put('/auth/password', authenticate, auth.changePassword);
router.post('/auth/avatar', authenticate, upload.single('avatar'), auth.updateAvatar);
router.put('/auth/settings', authenticate, auth.updateSettings);

router.get('/dashboard', authenticate, ctrl.getDashboard);
router.get('/search', authenticate, ctrl.globalSearch);

router.get('/semesters', authenticate, ctrl.getSemesters);
router.post('/semesters', authenticate, ctrl.createSemester);
router.put('/semesters/:id', authenticate, ctrl.updateSemester);
router.delete('/semesters/:id', authenticate, ctrl.deleteSemester);

router.get('/subjects', authenticate, ctrl.getSubjects);
router.post('/subjects', authenticate, ctrl.createSubject);
router.put('/subjects/:id', authenticate, ctrl.updateSubject);
router.delete('/subjects/:id', authenticate, ctrl.deleteSubject);

router.get('/teachers', authenticate, ctrl.getTeachers);
router.post('/teachers', authenticate, ctrl.createTeacher);
router.put('/teachers/:id', authenticate, ctrl.updateTeacher);
router.delete('/teachers/:id', authenticate, ctrl.deleteTeacher);

router.get('/assessments/:subjectId', authenticate, ctrl.getAssessments);
router.post('/assessments', authenticate, ctrl.createAssessment);
router.put('/assessments/:id', authenticate, ctrl.updateAssessment);
router.delete('/assessments/:id', authenticate, ctrl.deleteAssessment);

router.get('/attendance/:subjectId', authenticate, ctrl.getAttendance);
router.post('/attendance', authenticate, ctrl.createAttendance);
router.put('/attendance/:id', authenticate, ctrl.updateAttendance);
router.delete('/attendance/:id', authenticate, ctrl.deleteAttendance);

router.get('/assignments', authenticate, ctrl.getAssignments);
router.post('/assignments', authenticate, ctrl.createAssignment);
router.put('/assignments/:id', authenticate, ctrl.updateAssignment);
router.delete('/assignments/:id', authenticate, ctrl.deleteAssignment);

router.get('/projects', authenticate, ctrl.getProjects);
router.post('/projects', authenticate, ctrl.createProject);
router.put('/projects/:id', authenticate, ctrl.updateProject);
router.delete('/projects/:id', authenticate, ctrl.deleteProject);

router.get('/research', authenticate, ctrl.getResearch);
router.post('/research', authenticate, ctrl.createResearch);
router.put('/research/:id', authenticate, ctrl.updateResearch);
router.delete('/research/:id', authenticate, ctrl.deleteResearch);

router.get('/certificates', authenticate, ctrl.getCertificates);
router.post('/certificates', authenticate, ctrl.createCertificate);
router.put('/certificates/:id', authenticate, ctrl.updateCertificate);
router.delete('/certificates/:id', authenticate, ctrl.deleteCertificate);

router.get('/skills', authenticate, ctrl.getSkills);
router.post('/skills', authenticate, ctrl.createSkill);
router.put('/skills/:id', authenticate, ctrl.updateSkill);
router.delete('/skills/:id', authenticate, ctrl.deleteSkill);

router.get('/goals', authenticate, ctrl.getGoals);
router.post('/goals', authenticate, ctrl.createGoal);
router.put('/goals/:id', authenticate, ctrl.updateGoal);
router.delete('/goals/:id', authenticate, ctrl.deleteGoal);

router.get('/notes', authenticate, ctrl.getNotes);
router.post('/notes', authenticate, ctrl.createNote);
router.put('/notes/:id', authenticate, ctrl.updateNote);
router.delete('/notes/:id', authenticate, ctrl.deleteNote);

router.get('/journal', authenticate, ctrl.getJournal);
router.post('/journal', authenticate, ctrl.createJournal);
router.put('/journal/:id', authenticate, ctrl.updateJournal);
router.delete('/journal/:id', authenticate, ctrl.deleteJournal);

router.get('/career', authenticate, ctrl.getCareer);
router.post('/career', authenticate, ctrl.createCareer);
router.put('/career/:id', authenticate, ctrl.updateCareer);
router.delete('/career/:id', authenticate, ctrl.deleteCareer);

router.get('/events', authenticate, ctrl.getEvents);
router.post('/events', authenticate, ctrl.createEvent);
router.put('/events/:id', authenticate, ctrl.updateEvent);
router.delete('/events/:id', authenticate, ctrl.deleteEvent);

router.get('/calendar', authenticate, ctrl.getEvents);
router.post('/calendar', authenticate, ctrl.createEvent);
router.put('/calendar/:id', authenticate, ctrl.updateEvent);
router.delete('/calendar/:id', authenticate, ctrl.deleteEvent);

router.get('/notifications', authenticate, ctrl.getNotifications);
router.put('/notifications/:id/read', authenticate, ctrl.markNotificationRead);
router.put('/notifications/read-all', authenticate, ctrl.markAllNotificationsRead);

router.get('/files', authenticate, ctrl.getFiles);
router.post('/files/upload', authenticate, upload.single('file'), ctrl.uploadFile);
router.delete('/files/:id', authenticate, ctrl.deleteFile);

router.get('/study-sessions', authenticate, ctrl.getStudySessions);
router.post('/study-sessions', authenticate, ctrl.createStudySession);

router.get('/voice-notes', authenticate, ctrl.getVoiceNotes);
router.post('/voice-notes', authenticate, upload.single('audio'), ctrl.createVoiceNote);
router.delete('/voice-notes/:id', authenticate, ctrl.deleteVoiceNote);

router.get('/analytics', authenticate, ctrl.getAnalytics);
router.get('/achievements', authenticate, ctrl.getAchievements);
router.get('/reminders', authenticate, ctrl.getReminders);
router.post('/reminders', authenticate, ctrl.createReminder);

router.get('/chat/:sessionId', authenticate, ctrl.getChatHistory);
router.post('/chat', authenticate, ctrl.saveChatMessage);

router.get('/stats', authenticate, ctrl.getStats);

router.get('/admin/users', authenticate, authorize('admin', 'superadmin'), auth.getUsers);
router.put('/admin/users/role', authenticate, authorize('admin', 'superadmin'), auth.updateUserRole);
router.delete('/admin/users/:id', authenticate, authorize('admin', 'superadmin'), auth.deleteUser);
router.get('/admin/stats', authenticate, authorize('admin', 'superadmin'), ctrl.getStats);

export default router;
