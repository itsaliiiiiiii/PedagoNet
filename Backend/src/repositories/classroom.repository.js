const BaseRepository = require('./base.repository');

class ClassroomRepository extends BaseRepository {
    async createClassroom(professorId, classroomData) {
        const query = `
            MATCH (p:User {id_user: $professorId, role: 'professor'})
            CREATE (c:Classroom {
                id_classroom: randomUUID(),
                name: $name,
                description: $description,
                code: $code,
                isActive: $isActive,
                createdAt: datetime(),
                updatedAt: datetime()
            })
            CREATE (p)-[:TEACHES]->(c)
            RETURN c`;

        const records = await this.executeQuery(query, {
            professorId,
            name: classroomData.name,
            description: classroomData.description,
            code: classroomData.code,
            isActive: classroomData.isActive || true
        });

        return records.length > 0 ? records[0].get('c').properties : null;
    }

    async enrollStudent(classroomId, studentId, code) {
        const verifyQuery = `
            MATCH (c:Classroom {id_classroom: $classroomId, code: $code})
            RETURN c`;

        const verifyRecords = await this.executeQuery(verifyQuery, { classroomId, code });
        if (verifyRecords.length === 0) {
            return null;
        }

        const enrollmentCheckQuery = `
            MATCH (s:User {id_user: $studentId})-[r:ENROLLED_IN]->(c:Classroom {id_classroom: $classroomId})
            RETURN r`;

        const checkRecords = await this.executeQuery(enrollmentCheckQuery, { classroomId, studentId });
        if (checkRecords.length > 0) {
            return 'already_enrolled';
        }

        const enrollQuery = `
            MATCH (c:Classroom {id_classroom: $classroomId}), (s:User {id_user: $studentId, role: 'student'})
            CREATE (s)-[:ENROLLED_IN]->(c)
            RETURN c, s`;

        const records = await this.executeQuery(enrollQuery, { classroomId, studentId });
        return records.length > 0 ? 'success' : null;
    }

    async unenrollStudent(classroomId, studentId) {
        const query = `
            MATCH (s:User {id_user: $studentId})-[r:ENROLLED_IN]->(c:Classroom {id_classroom: $classroomId})
            DELETE r
            RETURN count(r) as deletedCount`;

        const records = await this.executeQuery(query, { classroomId, studentId });
        return records[0].get('deletedCount').toNumber();
    }

    async getEnrolledStudents(classroomId, userId) {
        const accessCheckQuery = `
            MATCH (u:User {id_user: $userId})
            MATCH (c:Classroom {id_classroom: $classroomId})
            WHERE (u)-[:TEACHES]->(c) OR (u)-[:ENROLLED_IN]->(c)
            RETURN c`;

        const accessRecords = await this.executeQuery(accessCheckQuery, { classroomId, userId });
        if (accessRecords.length === 0) {
            return null;
        }

        const query = `
            MATCH (s:User)-[:ENROLLED_IN]->(c:Classroom {id_classroom: $classroomId})
            RETURN collect({
                id_user: s.id_user,
                firstName: s.firstName,
                lastName: s.lastName,
                email: s.email,
                class: s.class
            }) as students`;

        const records = await this.executeQuery(query, { classroomId });
        return records[0].get('students');
    }

    async getClassroomDetails(classroomId) {
        const query = `
            MATCH (c:Classroom {id_classroom: $classroomId})
            OPTIONAL MATCH (p:User)-[:TEACHES]->(c)
            OPTIONAL MATCH (s:User)-[:ENROLLED_IN]->(c)
            RETURN c, 
            collect(DISTINCT {
                id: p.id_user,
                firstName: p.firstName,
                lastName: p.lastName,
                email: p.email,
                department: p.department
            }) as professors, 
            collect(DISTINCT {
                id: s.id_user,
                firstName: s.firstName,
                lastName: s.lastName,
                email: s.email,
                class: s.class
            }) as students`;

        const records = await this.executeQuery(query, { classroomId });
        if (records.length === 0) return null;

        const record = records[0];
        return {
            classroom: record.get('c').properties,
            professors: record.get('professors'),
            students: record.get('students')
        };
    }

    async getStudentClassrooms(studentId) {
        const query = `
            MATCH (s:User {id_user: $studentId})-[:ENROLLED_IN]->(c:Classroom)
            RETURN collect(c) as classrooms`;

        const records = await this.executeQuery(query, { studentId });
        return records[0].get('classrooms').map(c => c.properties);
    }

    async getProfessorClassrooms(professorId) {
        const query = `
            MATCH (p:User {id_user: $professorId})-[:TEACHES]->(c:Classroom)
            RETURN collect(c) as classrooms`;

        const records = await this.executeQuery(query, { professorId });
        return records[0].get('classrooms').map(c => c.properties);
    }

    async getAllClassrooms(userId, role) {
        let query;
        if (role === 'professor') {
            query = `
                MATCH (p:User {id_user: $userId})-[:TEACHES]->(c:Classroom)
                RETURN collect({
                    id_classroom: c.id_classroom,
                    name: c.name,
                    description: c.description,
                    code: c.code,
                    isActive: c.isActive
                }) as classrooms`;
        } else {
            query = `
                MATCH (s:User {id_user: $userId})-[:ENROLLED_IN]->(c:Classroom)
                RETURN collect({
                    id_classroom: c.id_classroom,
                    name: c.name,
                    description: c.description
                }) as classrooms`;
        }

        const records = await this.executeQuery(query, { userId });
        return records[0].get('classrooms');
    }

    async updateClassroom(classroomId, professorId, updateData) {
        const verifyQuery = `
            MATCH (p:User {id_user: $professorId})-[:TEACHES]->(c:Classroom {id_classroom: $classroomId})
            RETURN c`;

        const verifyRecords = await this.executeQuery(verifyQuery, { professorId, classroomId });
        if (verifyRecords.length === 0) return null;

        const updates = [];
        const params = { classroomId, professorId };

        const allowedUpdates = ['name', 'description', 'isActive'];
        Object.entries(updateData).forEach(([key, value]) => {
            if (allowedUpdates.includes(key)) {
                updates.push(`c.${key} = $${key}`);
                params[key] = value;
            }
        });

        updates.push('c.updatedAt = datetime()');

        const query = `
            MATCH (c:Classroom {id_classroom: $classroomId})
            SET ${updates.join(', ')}
            RETURN c`;

        const records = await this.executeQuery(query, params);
        return records[0].get('c').properties;
    }

    async deleteClassroom(classroomId, professorId) {
        const verifyQuery = `
            MATCH (p:User {id_user: $professorId})-[:TEACHES]->(c:Classroom {id_classroom: $classroomId})
            RETURN c`;

        const verifyRecords = await this.executeQuery(verifyQuery, { professorId, classroomId });
        if (verifyRecords.length === 0) return null;

        const query = `
            MATCH (c:Classroom {id_classroom: $classroomId})
            OPTIONAL MATCH (c)-[:HAS_TASK]->(t:Task)
            OPTIONAL MATCH (t)-[tr]-()  // Get all task relationships
            OPTIONAL MATCH (c)-[cr]-()  // Get all classroom relationships
            DELETE tr, t, cr, c
            RETURN count(c) as deleted`;

        const records = await this.executeQuery(query, { classroomId });
        return records[0].get('deleted').toNumber();
    }

    async enrollStudentByCode(studentId, code) {
        const verifyQuery = `
            MATCH (c:Classroom {code: $code})
            RETURN c`;
    
        const verifyRecords = await this.executeQuery(verifyQuery, { code });
        if (verifyRecords.length === 0) {
            return null;
        }
    
        const classroom = verifyRecords[0].get('c').properties;
        
        const enrollmentCheckQuery = `
            MATCH (s:User {id_user: $studentId})-[r:ENROLLED_IN]->(c:Classroom {code: $code})
            RETURN r`;
    
        const checkRecords = await this.executeQuery(enrollmentCheckQuery, { studentId, code });
        if (checkRecords.length > 0) {
            return 'already_enrolled';
        }
    
        const enrollQuery = `
            MATCH (c:Classroom {code: $code}), (s:User {id_user: $studentId, role: 'student'})
            CREATE (s)-[:ENROLLED_IN]->(c)
            RETURN c, s`;
    
        const records = await this.executeQuery(enrollQuery, { code, studentId });
        return records.length > 0 ? { status: 'success', classroom } : null;
    }
}

module.exports = ClassroomRepository;