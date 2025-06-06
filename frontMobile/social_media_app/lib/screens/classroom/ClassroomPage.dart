import 'dart:convert';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:social_media_app/core/Api.dart';
import 'package:social_media_app/screens/classroom/CourseDetailsPage.dart';
import 'package:http/http.dart' as http;

class ClassroomPage extends StatefulWidget {
  final String token;

  const ClassroomPage({super.key, required this.token});

  @override
  State<ClassroomPage> createState() => _ClassroomPageState();
}

class _ClassroomPageState extends State<ClassroomPage>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;
  final bool _isLoading = false;

  late bool isProfessor = true;
  // Données statiques pour la démonstration

  List<dynamic> _courses = [];
  // final List<Map<String, dynamic>> _courses = [
  //   {
  //     'id': '1',
  //     'name': 'Programmation Orientée Objet',
  //     'code': 'POO-2024',
  //     'professor': 'Dr. Martin Dubois',
  //     'color': Colors.blue,
  //     'progress': 0.75,
  //     'nextClass': DateTime.now().add(const Duration(days: 1, hours: 2)),
  //     'students': 45,
  //     'assignments': 3,
  //   },
  //   {
  //     'id': '2',
  //     'name': 'Mathématiques Avancées',
  //     'code': 'MATH-301',
  //     'professor': 'Prof. Sarah Laurent',
  //     'color': Colors.green,
  //     'progress': 0.60,
  //     'nextClass': DateTime.now().add(const Duration(hours: 6)),
  //     'students': 38,
  //     'assignments': 2,
  //   },
  //   {
  //     'id': '3',
  //     'name': 'Base de Données',
  //     'code': 'BDD-201',
  //     'professor': 'Dr. Ahmed Benali',
  //     'color': Colors.orange,
  //     'progress': 0.85,
  //     'nextClass': DateTime.now().add(const Duration(days: 2)),
  //     'students': 42,
  //     'assignments': 1,
  //   },
  //   {
  //     'id': '4',
  //     'name': 'Intelligence Artificielle',
  //     'code': 'IA-401',
  //     'professor': 'Prof. Emma Chen',
  //     'color': Colors.purple,
  //     'progress': 0.40,
  //     'nextClass': DateTime.now().add(const Duration(days: 3, hours: 4)),
  //     'students': 35,
  //     'assignments': 4,
  //   },
  // ];

  Future<void> fetchCourses() async {
    try {
      final response = await http.get(
        Uri.parse('${Api.baseUrl}/classrooms'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

      if (response.statusCode == 200) {
        print("data importer");

        // print(response.body);
        final Map<String, dynamic> responseData = json.decode(response.body);

        final List<dynamic> courseDataWithoutColor = responseData['classrooms'];

        final List<dynamic> courseData = courseDataWithoutColor.map((course) {
          final randomColor = _generateRandomColor();
          return {
            ...course,
            'color': randomColor,
          };
        }).toList();

        // print(profileData);
        setState(() {
          _courses = courseData;
        });
      }
    } catch (e) {
      print('Exception lors de la récupération des course: $e');
    }
  }

  Color _generateRandomColor() {
    final Random random = Random();
    return Color.fromARGB(
      255,
      random.nextInt(256),
      random.nextInt(256),
      random.nextInt(256),
    );
  }

  final List<Map<String, dynamic>> _upcomingAssignments = [
    {
      'id': '1',
      'title': 'Projet Final POO',
      'course': 'Programmation Orientée Objet',
      'dueDate': DateTime.now().add(const Duration(days: 3)),
      'type': 'Projet',
      'priority': 'high',
    },
    {
      'id': '2',
      'title': 'Exercices Chapitre 5',
      'course': 'Mathématiques Avancées',
      'dueDate': DateTime.now().add(const Duration(days: 5)),
      'type': 'Exercices',
      'priority': 'medium',
    },
    {
      'id': '3',
      'title': 'TP Base de Données',
      'course': 'Base de Données',
      'dueDate': DateTime.now().add(const Duration(days: 7)),
      'type': 'TP',
      'priority': 'low',
    },
  ];

  final List<Map<String, dynamic>> _recentAnnouncements = [
    {
      'id': '1',
      'title': 'Changement d\'horaire',
      'content': 'Le cours de POO de demain est reporté à 14h au lieu de 10h.',
      'course': 'Programmation Orientée Objet',
      'timestamp': DateTime.now().subtract(const Duration(hours: 2)),
      'professor': 'Dr. Martin Dubois',
    },
    {
      'id': '2',
      'title': 'Nouveau matériel disponible',
      'content':
          'Les slides du chapitre 6 sont maintenant disponibles sur la plateforme.',
      'course': 'Mathématiques Avancées',
      'timestamp': DateTime.now().subtract(const Duration(hours: 5)),
      'professor': 'Prof. Sarah Laurent',
    },
  ];

  void getUserRole() async {
    final prefs = await SharedPreferences.getInstance();
    isProfessor = prefs.getString('user_role').toString() == "professor";
  }

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _animation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );
    _animationController.forward();
    getUserRole();
    fetchCourses();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  String _formatTimeUntil(DateTime dateTime) {
    final Duration difference = dateTime.difference(DateTime.now());

    if (difference.inDays > 0) {
      return 'Dans ${difference.inDays} jour${difference.inDays > 1 ? 's' : ''}';
    } else if (difference.inHours > 0) {
      return 'Dans ${difference.inHours} heure${difference.inHours > 1 ? 's' : ''}';
    } else if (difference.inMinutes > 0) {
      return 'Dans ${difference.inMinutes} minute${difference.inMinutes > 1 ? 's' : ''}';
    } else {
      return 'Maintenant';
    }
  }

  Color _getPriorityColor(String priority) {
    switch (priority) {
      case 'high':
        return Colors.red;
      case 'medium':
        return Colors.orange;
      case 'low':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        title: const Text(
          'Classroom',
          style: TextStyle(
            color: Colors.black87,
            fontWeight: FontWeight.bold,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black87),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.calendar_today, color: Colors.black87),
            onPressed: () {
              // Naviguer vers le calendrier
            },
          ),
          IconButton(
            icon: const Icon(Icons.search, color: Colors.black87),
            onPressed: () {
              // Ouvrir la recherche
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(),
            )
          : FadeTransition(
              opacity: _animation,
              child: CustomScrollView(
                physics: const BouncingScrollPhysics(),
                slivers: [
                  // Section des statistiques rapides
                  SliverToBoxAdapter(
                    child: _buildQuickStats(),
                  ),

                  // Section des cours
                  SliverToBoxAdapter(
                    child: _buildSectionHeader('Mes Cours', Icons.book),
                  ),
                  SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final course = _courses[index];
                        return _buildCourseCard(course);
                      },
                      childCount: _courses.length,
                    ),
                  ),

                  // Section des devoirs à venir

                  if (!isProfessor) ...[
                    SliverToBoxAdapter(
                      child: _buildSectionHeader(
                          'Devoirs à Rendre', Icons.assignment),
                    ),
                    SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final assignment = _upcomingAssignments[index];
                          return _buildAssignmentCard(assignment);
                        },
                        childCount: _upcomingAssignments.length,
                      ),
                    ),
                    SliverToBoxAdapter(
                      child: _buildSectionHeader(
                          'Annonces Récentes', Icons.campaign),
                    ),
                    SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final announcement = _recentAnnouncements[index];
                          return _buildAnnouncementCard(announcement);
                        },
                        childCount: _recentAnnouncements.length,
                      ),
                    ),
                  ],

                  // Espace en bas
                  const SliverToBoxAdapter(
                    child: SizedBox(height: 80),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildQuickStats() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(
            child: _buildStatCard(
              'Cours Actifs',
              '${_courses.length}',
              Icons.book,
              Colors.blue,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _buildStatCard(
              'Devoirs',
              '${_upcomingAssignments.length}',
              Icons.assignment,
              Colors.orange,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _buildStatCard(
              'Annonces',
              '${_recentAnnouncements.length}',
              Icons.campaign,
              Colors.green,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(
      String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(
            icon,
            color: color,
            size: 24,
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
      child: Row(
        children: [
          Icon(
            icon,
            color: Colors.black87,
            size: 20,
          ),
          const SizedBox(width: 8),
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCourseCard(Map<dynamic, dynamic> course) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Card(
        elevation: 2,
        shadowColor: Colors.black26,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        child: InkWell(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => CourseDetailsPage(
                  course: course,
                  token: widget.token,
                  isProfessor: isProfessor,
                ),
              ),
            );
          },
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        color: course['color'].withOpacity(0.1),
                        // color: Colors.blue.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: course['color'].withOpacity(0.3),
                          // color: Colors.blue.withOpacity(0.3),

                          width: 2,
                        ),
                      ),
                      child: Icon(
                        Icons.book,
                        color: course['color'],
                        // color: Colors.blue,

                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            course['name'],
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'code',
                            // course['code'],
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey[600],
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            course['description'],
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[500],
                            ),
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        // Text(
                        //   _formatTimeUntil(course['nextClass']),
                        //   style: TextStyle(
                        //     fontSize: 12,
                        //     color: Colors.grey[500],
                        //   ),
                        // ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAssignmentCard(Map<String, dynamic> assignment) {
    final Color priorityColor = _getPriorityColor(assignment['priority']);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Card(
        elevation: 1,
        shadowColor: Colors.black26,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        child: InkWell(
          onTap: () {
            // Naviguer vers les détails du devoir
          },
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Container(
                  width: 4,
                  height: 50,
                  decoration: BoxDecoration(
                    color: priorityColor,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        assignment['title'],
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        assignment['course'],
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(
                            Icons.access_time,
                            size: 12,
                            color: Colors.grey[500],
                          ),
                          const SizedBox(width: 4),
                          Text(
                            _formatTimeUntil(assignment['dueDate']),
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[500],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: priorityColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: priorityColor.withOpacity(0.3),
                      width: 1,
                    ),
                  ),
                  child: Text(
                    assignment['type'],
                    style: TextStyle(
                      fontSize: 12,
                      color: priorityColor,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAnnouncementCard(Map<String, dynamic> announcement) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Card(
        elevation: 1,
        shadowColor: Colors.black26,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        child: InkWell(
          onTap: () {
            // Naviguer vers les détails de l'annonce
          },
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.campaign,
                      color: Colors.blue[600],
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        announcement['title'],
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    Text(
                      _formatTimeUntil(announcement['timestamp'])
                          .replaceAll('Dans ', 'Il y a '),
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[500],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  announcement['content'],
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey[700],
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Text(
                      announcement['course'],
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.blue[600],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '• ${announcement['professor']}',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[500],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
