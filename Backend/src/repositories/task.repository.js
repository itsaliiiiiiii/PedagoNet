const BaseRepository = require('./base.repository');

class TaskRepository extends BaseRepository {
    async createTask(professorId, classroomId, taskData) {
        const query = `
            MATCH (p:User {id_user: $professorId})-[:TEACHES]->(c:Classroom {id_classroom: $classroomId})
            CREATE (t:Task {
                id_task: randomUUID(),
                title: $title,
                description: $description,
                deadline: datetime($deadline),
                maxScore: $maxScore,
                createdAt: datetime(),
                updatedAt: datetime()
            })
            CREATE (c)-[:HAS_TASK]->(t)
            WITH t
            UNWIND $attachments AS attachment
            CREATE (a:Attachment {
                id: randomUUID(),
                filename: attachment.filename,
                originalName: attachment.originalName,
                mimetype: attachment.mimetype,
                size: attachment.size,
                path: attachment.path,
                createdAt: datetime()
            })
            CREATE (t)-[:HAS_ATTACHMENT]->(a)
            RETURN t`;
    
        const records = await this.executeQuery(query, {
            professorId,
            classroomId,
            title: taskData.title,
            description: taskData.description,
            deadline: taskData.deadline,
            maxScore: taskData.maxScore,
            attachments: taskData.attachments || []
        });
    
        return records.length > 0 ? records[0].get('t').properties : null;
    }

    async getClassroomTasks(classroomId, userId, role) {
        let query;
        let params = { classroomId, userId };
    
        if (role === 'professor') {
            query = `
                MATCH (c:Classroom {id_classroom: $classroomId})-[:HAS_TASK]->(t:Task)
                OPTIONAL MATCH (t)-[:HAS_ATTACHMENT]->(a:Attachment)
                OPTIONAL MATCH (t)<-[:SUBMITTED]-(s:Submission)
                WITH t, collect(a) as attachments, count(s) as submissionCount
                RETURN t, attachments, submissionCount`;
        } else {
            query = `
                MATCH (s:User {id_user: $userId})-[:ENROLLED_IN]->(c:Classroom {id_classroom: $classroomId})
                MATCH (c)-[:HAS_TASK]->(t:Task)
                OPTIONAL MATCH (t)-[:HAS_ATTACHMENT]->(a:Attachment)
                OPTIONAL MATCH (t)<-[:SUBMITTED]-(sub:Submission {student_id: $userId})
                WITH t, collect(a) as attachments, sub
                RETURN t, attachments, sub`;
        }
    
        const records = await this.executeQuery(query, params);
        return records;
    }

    async submitTask(taskId, studentId, submissionData) {
        const query = `
            MATCH (t:Task {id_task: $taskId}), (s:User {id_user: $studentId})
            CREATE (sub:Submission {
                id_submission: randomUUID(),
                content: $content,
                attachments: $attachments,
                submittedAt: datetime(),
                status: 'submitted',
                student_id: $studentId
            })
            CREATE (s)-[:SUBMITTED]->(sub)
            CREATE (sub)-[:FOR_TASK]->(t)
            RETURN sub`;

        const records = await this.executeQuery(query, {
            taskId,
            studentId,
            content: submissionData.content,
            attachments: submissionData.attachments || []
        });

        return records.length > 0 ? records[0].get('sub').properties : null;
    }

    async gradeSubmission(taskId, studentId, professorId, grade, feedback) {
        const query = `
            MATCH (t:Task {id_task: $taskId})<-[:FOR_TASK]-(sub:Submission {student_id: $studentId})
            SET sub.grade = $grade,
                sub.feedback = $feedback,
                sub.gradedAt = datetime(),
                sub.status = 'graded',
                sub.graded_by = $professorId
            RETURN sub`;

        const records = await this.executeQuery(query, {
            taskId,
            studentId,
            professorId,
            grade,
            feedback
        });

        return records.length > 0 ? records[0].get('sub').properties : null;
    }

    async getStudentTasks(studentId) {
        const query = `
            MATCH (s:User {id_user: $studentId})-[:ENROLLED_IN]->(c:Classroom)
            MATCH (c)-[:HAS_TASK]->(t:Task)
            OPTIONAL MATCH (t)<-[:SUBMITTED]-(sub:Submission {student_id: $studentId})
            WITH c, t, sub,
                CASE 
                    WHEN sub IS NULL THEN 'not_submitted'
                    WHEN sub.status = 'submitted' THEN 'pending_review'
                    ELSE sub.status
                END as submissionStatus
            RETURN c, t, sub, submissionStatus
            ORDER BY t.deadline`;

        return await this.executeQuery(query, { studentId });
    }

    async getTaskSubmissions(taskId, professorId) {
        const query = `
            MATCH (p:User {id_user: $professorId})-[:TEACHES]->(c:Classroom)-[:HAS_TASK]->(t:Task {id_task: $taskId})
            OPTIONAL MATCH (t)<-[:FOR_TASK]-(sub:Submission)<-[:SUBMITTED]-(s:User)
            WITH t, collect({
                submission: sub,
                student: CASE 
                    WHEN s IS NOT NULL 
                    THEN {id_user: s.id_user, firstName: s.firstName, lastName: s.lastName}
                    ELSE NULL 
                END
            }) as submissions
            RETURN {
                task: properties(t),
                submissions: [x IN submissions WHERE x.submission IS NOT NULL]
            } as result`;

        return await this.executeQuery(query, { taskId, professorId });
    }
}

module.exports = new TaskRepository();