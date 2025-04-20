const { connectDatabase, neo4jDriver } = require('../config/database');
const bcrypt = require('bcrypt');

// Sample data
// Test credentials - all accounts use password: test123
const users = [
    {
        email: 'test.prof@test.com',
        password: 'test123',
        firstName: 'John',
        lastName: 'Smith',
        role: 'professor',
        department: 'Computer Science',
        bio: 'Professor of Computer Science with 15 years of experience in AI and Machine Learning.',
        dateOfBirth: '1975-05-15'
    },
    {
        email: 'test.prof2@test.com',
        password: 'test123',
        firstName: 'Emily',
        lastName: 'Jones',
        role: 'professor',
        department: 'Mathematics',
        bio: 'Mathematics professor specializing in Advanced Calculus and Number Theory.',
        dateOfBirth: '1980-03-22'
    },
    {
        email: 'test.student@test.com',
        password: 'test123',
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'student',
        major: 'Computer Science',
        bio: 'Third-year CS student interested in web development and AI.',
        dateOfBirth: '2000-08-10'
    },
    {
        email: 'test.student2@test.com',
        password: 'test123',
        firstName: 'Bob',
        lastName: 'Wilson',
        role: 'student',
        major: 'Mathematics',
        bio: 'Second-year Mathematics student passionate about cryptography.',
        dateOfBirth: '2001-02-28'
    },
    {
        email: 'test.student3@test.com',
        password: 'test123',
        firstName: 'Carol',
        lastName: 'Brown',
        role: 'student',
        major: 'Computer Science',
        bio: 'Final year student focusing on software engineering.',
        dateOfBirth: '1999-11-15'
    }
];

const seedDatabase = async () => {
    try {
        // Connect to Neo4j
        await connectDatabase();
        const session = neo4jDriver.session();
        
        console.log('🗑️ Clearing existing data...');
        await session.run('MATCH (n) DETACH DELETE n');
        
        console.log('👥 Creating users...');
        for (const user of users) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);
            await session.run(
                'CREATE (u:User {email: $email, password: $password, firstName: $firstName, ' +
                'lastName: $lastName, role: $role, ' +
                (user.role === 'professor' ? 'department: $department, ' : 'major: $major, ') +
                'bio: $bio, dateOfBirth: $dateOfBirth, isVerified: true})',
                { ...user, password: hashedPassword }
            );
        }

        console.log('🏛️ Creating classrooms...');
        const professors = users.filter(u => u.role === 'professor');
        const students = users.filter(u => u.role === 'student');

        for (const professor of professors) {
            const classroomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            
            await session.run(
                'MATCH (p:User {email: $profEmail}) ' +
                'CREATE (c:Classroom {name: $name, description: $description, ' +
                'code: $code, isActive: true}) ' +
                'CREATE (p)-[:TEACHES]->(c)',
                {
                    profEmail: professor.email,
                    name: `${professor.department} 101`,
                    description: `Introduction to ${professor.department}`,
                    code: classroomCode
                }
            );

            // Enroll students
            for (const student of students) {
                await session.run(
                    'MATCH (c:Classroom {code: $code}), (s:User {email: $studentEmail}) ' +
                    'CREATE (s)-[:ENROLLED_IN]->(c)',
                    {
                        code: classroomCode,
                        studentEmail: student.email
                    }
                );
            }
        }

        console.log('📝 Creating tasks...');
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);
        
        const classrooms = await session.run('MATCH (c:Classroom) RETURN c');
        for (const record of classrooms.records) {
            const classroom = record.get('c').properties;
            
            await session.run(
                'MATCH (c:Classroom {code: $code}) ' +
                'CREATE (t:Task {title: $title, description: $description, ' +
                'dueDate: $dueDate, maxPoints: $maxPoints}) ' +
                'CREATE (c)-[:HAS_TASK]->(t)',
                {
                    code: classroom.code,
                    title: `${classroom.name} Final Project`,
                    description: 'Complete a comprehensive project demonstrating your understanding of the course material.',
                    dueDate: dueDate.toISOString(),
                    maxPoints: 100
                }
            );
        }

        console.log('📫 Creating messages...');
        for (const student of students) {
            for (const professor of professors) {
                await session.run(
                    'MATCH (s:User {email: $studentEmail}), (p:User {email: $profEmail}) ' +
                    'CREATE (m:Message {content: $content, status: "sent", createdAt: datetime()}) ' +
                    'CREATE (s)-[:SENT]->(m)-[:RECEIVED_BY]->(p)',
                    {
                        studentEmail: student.email,
                        profEmail: professor.email,
                        content: 'Hello Professor, I have a question about the course material.'
                    }
                );
            }
        }

        console.log('📱 Creating posts...');
        for (const user of users) {
            await session.run(
                'MATCH (u:User {email: $email}) ' +
                'CREATE (p:Post {content: $content, visibility: $visibility, createdAt: datetime()}) ' +
                'CREATE (u)-[:AUTHORED]->(p)',
                {
                    email: user.email,
                    content: 'Excited to be part of this learning community! #Education #Learning',
                    visibility: 'public'
                }
            );
        }

        console.log('🤝 Creating connections between users...');
        for (let i = 0; i < students.length - 1; i++) {
            await session.run(
                'MATCH (u1:User {email: $email1}), (u2:User {email: $email2}) ' +
                'CREATE (u1)-[:CONNECTION {status: "accepted", createdAt: datetime()}]->(u2)',
                {
                    email1: students[i].email,
                    email2: students[i + 1].email
                }
            );
        }

        console.log('✅ Database seeding completed successfully!');
        
        await session.close();
        await neo4jDriver.close();
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();