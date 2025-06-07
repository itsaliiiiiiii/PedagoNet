import 'package:flutter/material.dart';
import 'package:social_media_app/core/Api.dart';
import 'package:social_media_app/screens/classroom/CreateTask.dart';
import 'package:social_media_app/screens/classroom/UploadDevoir.dart';
import 'package:social_media_app/screens/classroom/ListeUploadTasks.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class CourseDetailsPage extends StatefulWidget {
  final Map<dynamic, dynamic> course;
  final String token;
  final bool isProfessor;

  const CourseDetailsPage(
      {super.key,
      required this.course,
      required this.token,
      required this.isProfessor});

  @override
  State<CourseDetailsPage> createState() => _CourseDetailsPageState();
}

class _CourseDetailsPageState extends State<CourseDetailsPage> {
  final bool _isLoading = false;
  List<Map<String, dynamic>> _assignments = [];
  bool _isLoadingAssignments = false;

  @override
  void initState() {
    super.initState();
    getAssignments();
  }

  Future<void> getAssignments() async {
    setState(() {
      _isLoadingAssignments = true;
    });

    try {
      String api = "${Api.baseUrl}/tasks/${widget.course['id_classroom']}";
      print('Fetching assignments from: $api');

      final response = await http.get(
        Uri.parse(api),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
          'Content-Type': 'application/json',
        },
      );

      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = json.decode(response.body);
        print('Response data: $responseData');

        if (responseData['data'] == null) {
          print('No data in response');
          setState(() {
            _assignments = [];
            _isLoadingAssignments = false;
          });
          return;
        }

        final List<dynamic> data = responseData['data'];
        print('Data length: ${data.length}');

        setState(() {
          _assignments = data.map((task) {
            print('Processing task: $task');

            // Gestion sécurisée de la date
            DateTime dueDate;
            try {
              if (task['deadline'] != null) {
                final deadline = task['deadline'];
                print('Deadline data: $deadline');

                if (deadline is Map) {
                  // Vérifier si les valeurs sont des Maps avec 'low'
                  final year = deadline['year'] is Map
                      ? deadline['year']['low']
                      : deadline['year'];
                  final month = deadline['month'] is Map
                      ? deadline['month']['low']
                      : deadline['month'];
                  final day = deadline['day'] is Map
                      ? deadline['day']['low']
                      : deadline['day'];
                  final hour = deadline['hour'] is Map
                      ? deadline['hour']['low']
                      : deadline['hour'];
                  final minute = deadline['minute'] is Map
                      ? deadline['minute']['low']
                      : deadline['minute'];

                  print(
                      'Parsed date components: year=$year, month=$month, day=$day, hour=$hour, minute=$minute');

                  dueDate = DateTime(
                    int.parse(year.toString()),
                    int.parse(month.toString()),
                    int.parse(day.toString()),
                    int.parse(hour.toString()),
                    int.parse(minute.toString()),
                  );
                } else {
                  print('Deadline is not a Map, using current date');
                  dueDate = DateTime.now();
                }
              } else {
                print('No deadline found, using current date');
                dueDate = DateTime.now();
              }
            } catch (e) {
              print('Error parsing date: $e');
              dueDate = DateTime.now();
            }

            final assignment = {
              'id_task': task['id_task']?.toString() ?? '',
              'title': task['title'] ?? '',
              'description': task['description'] ?? '',
              'dueDate': dueDate,
              'status': 'Non commencé',
              'points': task['maxScore'] ?? 0,
              'submitted': false,
            };

            print('Created assignment: $assignment');
            return assignment;
          }).toList();
        });
      } else {
        print('Error response: ${response.body}');
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Erreur lors de la récupération des devoirs'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      print('Exception: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() {
        _isLoadingAssignments = false;
      });
    }
  }

  String _formatTimeAgo(DateTime dateTime) {
    final Duration difference = DateTime.now().difference(dateTime);

    if (difference.inDays > 0) {
      return 'Il y a ${difference.inDays} jour${difference.inDays > 1 ? 's' : ''}';
    } else if (difference.inHours > 0) {
      return 'Il y a ${difference.inHours} heure${difference.inHours > 1 ? 's' : ''}';
    } else if (difference.inMinutes > 0) {
      return 'Il y a ${difference.inMinutes} minute${difference.inMinutes > 1 ? 's' : ''}';
    } else {
      return 'À l\'instant';
    }
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: NestedScrollView(
        headerSliverBuilder: (BuildContext context, bool innerBoxIsScrolled) {
          return [
            SliverAppBar(
              expandedHeight: 200,
              floating: false,
              pinned: true,
              backgroundColor: widget.course['color'],
              leading: IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white),
                onPressed: () => Navigator.pop(context),
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.share, color: Colors.white),
                  onPressed: () {
                    // Partager le cours
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.more_vert, color: Colors.white),
                  onPressed: () {
                    // Menu options
                  },
                ),
              ],
              flexibleSpace: FlexibleSpaceBar(
                background: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        widget.course['color'],
                        widget.course['color'].withOpacity(0.8),
                      ],
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 80, 16, 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text(
                          widget.course['name'],
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'code',
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(
                              Icons.person,
                              color: Colors.white70,
                              size: 16,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'professor',
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 14,
                              ),
                            ),
                            const SizedBox(width: 16),
                            const Icon(
                              Icons.people,
                              color: Colors.white70,
                              size: 16,
                            ),
                            const SizedBox(width: 4),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ];
        },
        body: _buildAssignmentsTab(),
      ),
    );
  }

  Widget _buildAssignmentsTab() {
    return CustomScrollView(
      physics: const BouncingScrollPhysics(),
      slivers: [
        SliverToBoxAdapter(
          child: SizedBox(
            width: double.infinity,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        Icon(
                          Icons.assignment,
                          color: widget.course['color'],
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Devoirs et Évaluations',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (widget.isProfessor) ...[
                    InkWell(
                      onTap: () async {
                        final result = await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => CreateAssignmentPage(
                              course: widget.course,
                              token: widget.token,
                              classroomId: widget.course['id_classroom'] ??
                                  'classroom_id',
                              professorId: 'professor_id',
                            ),
                          ),
                        );

                        if (result == true) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Devoir créé avec succès'),
                              backgroundColor: Colors.green,
                            ),
                          );
                        }
                      },
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: widget.course['color'].withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: widget.course['color'].withOpacity(0.3),
                          ),
                        ),
                        child: Icon(
                          Icons.add,
                          color: widget.course['color'],
                          size: 20,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
        SliverList(
          delegate: SliverChildBuilderDelegate(
            (context, index) {
              final assignment = _assignments[index];
              return _buildAssignmentCard(assignment);
            },
            childCount: _assignments.length,
          ),
        ),
        const SliverToBoxAdapter(
          child: SizedBox(height: 80),
        ),
      ],
    );
  }

  Widget _buildAssignmentCard(Map<String, dynamic> assignment) {
    final bool isOverdue = assignment['dueDate'].isBefore(DateTime.now()) &&
        !assignment['submitted'];
    final bool isSubmitted = assignment['submitted'];
    final bool isActive = assignment['dueDate'].isAfter(DateTime.now());

    Color statusColor = Colors.orange;
    String status = 'En cours';

    if (isSubmitted) {
      statusColor = Colors.green;
      status = 'Terminé';
    } else if (isOverdue) {
      statusColor = Colors.red;
      status = 'Terminé';
    } else if (!isActive) {
      statusColor = Colors.grey;
      status = 'Terminé';
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Card(
        elevation: 2,
        shadowColor: Colors.black26,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        child: InkWell(
          onTap: () {
            if (widget.isProfessor) {
              // Si c'est un professeur, rediriger vers ListeUploadTasks
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ListeUploadTasks(
                    task: assignment,
                    token: widget.token,
                  ),
                ),
              );
            } else {
              // Si c'est un étudiant, rediriger vers UploadDevoir
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => AssignmentSubmissionPage(
                    assignment: assignment,
                    course: widget.course,
                    token: widget.token,
                  ),
                ),
              );
            }
          },
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        assignment['title'],
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: statusColor.withOpacity(0.3),
                          width: 1,
                        ),
                      ),
                      child: Text(
                        status,
                        style: TextStyle(
                          fontSize: 12,
                          color: statusColor,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(
                      Icons.access_time,
                      size: 16,
                      color: Colors.grey[600],
                    ),
                    const SizedBox(width: 4),
                    Text(
                      isSubmitted
                          ? 'Rendu ${_formatTimeAgo(assignment['dueDate'])}'
                          : _formatTimeUntil(assignment['dueDate']),
                      style: TextStyle(
                        fontSize: 14,
                        color: isOverdue ? Colors.red : Colors.grey[600],
                        fontWeight:
                            isOverdue ? FontWeight.w500 : FontWeight.normal,
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
